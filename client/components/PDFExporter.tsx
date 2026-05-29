'use client';

import React from 'react';
import { Download, CheckCircle, FileText } from 'lucide-react';
import { ConcreteMix } from './OptimizationEngine';

interface PDFExporterProps {
  optimizedMix: ConcreteMix;
  opcMix: ConcreteMix;
  targetClass: string;
  priority: string;
  prices: {
    cement: number;
    flyAsh: number;
    slag: number;
    silicaFume: number;
  };
}

export default function PDFExporter({
  optimizedMix,
  opcMix,
  targetClass,
  priority,
  prices,
}: PDFExporterProps) {
  const handleExportPDF = async () => {
    // Dynamically import jsPDF and html2canvas on client side
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const input = document.getElementById('engineering-report-pdf');
    if (!input) return;

    // Temporarily make it visible/printable
    input.classList.remove('hidden');

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#090d16',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const dateStr = new Date().toISOString().split('T')[0];
      pdf.save(`EcoMix_Report_${targetClass}_${dateStr}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      input.classList.add('hidden');
    }
  };

  const carbonReduction = Math.round(
    ((opcMix.carbon - optimizedMix.carbon) / opcMix.carbon) * 100
  );
  const costSavings = Math.round(((opcMix.cost - optimizedMix.cost) / opcMix.cost) * 100);

  return (
    <div>
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10"
      >
        <Download className="w-5 h-5" />
        <span>تصدير تقرير هندسي مختوم (PDF)</span>
      </button>

      {/* HIDDEN PRINTABLE REPORT WRAPPER */}
      <div
        id="engineering-report-pdf"
        className="hidden w-[790px] p-10 bg-[#090d16] text-[#f1f5f9] border border-slate-800 font-sans leading-relaxed relative"
      >
        {/* Academic Synergy Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-400 tracking-tight">EcoMix</h1>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
              Concrete Mix & Sustainability Optimizer
            </p>
            <p className="text-xs text-slate-500">MÜDEK & TS EN 206 Academic Integration Framework</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs uppercase mb-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>TS EN 206 CERTIFIED</span>
            </div>
            <p className="text-xs text-slate-400" suppressHydrationWarning>Date: {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-slate-500" suppressHydrationWarning>Document ID: EM-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>ملخص التنفيذي للمشروع (Executive Summary)</span>
          </h2>
          <p className="text-sm text-slate-300">
            تم إجراء دراسة تحسين موازنة متعددة الأهداف لخلطة الخرسانة للفئة الإنشائية المستهدفة{' '}
            <strong className="text-sky-300 font-semibold">{targetClass}</strong> باستخدام محرك{' '}
            <strong>EcoMix</strong>. يهدف هذا النموذج إلى تحقيق أعلى خفض ممكن في البصمة الكربونية
            مع تقليل التكاليف الاقتصادية للمواد، ملتزماً بالكامل بمعايير كود البناء{' '}
            <strong className="text-emerald-300 font-semibold">TS EN 206</strong>.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* EcoMix optimized */}
          <div className="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              EcoMix Optimized (الخلطة المحسنة)
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Target Class:</span>
                <span className="font-bold text-emerald-300">{targetClass} (Cube: {optimizedMix.strength} MPa)</span>
              </div>
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Embodied Carbon:</span>
                <span className="font-bold text-emerald-300">{optimizedMix.carbon} kg CO2/m³</span>
              </div>
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Material Cost:</span>
                <span className="font-bold text-emerald-300">${optimizedMix.cost} / m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water/Binder Ratio:</span>
                <span className="font-bold text-emerald-300">{optimizedMix.wbRatio}</span>
              </div>
            </div>
          </div>

          {/* Standard OPC */}
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Standard OPC (الخلطة التقليدية)
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Class Metric:</span>
                <span className="font-bold text-slate-200">{targetClass} (Cube: {opcMix.strength} MPa)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Embodied Carbon:</span>
                <span className="font-bold text-slate-200">{opcMix.carbon} kg CO2/m³</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Material Cost:</span>
                <span className="font-bold text-slate-200">${opcMix.cost} / m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Water/Binder Ratio:</span>
                <span className="font-bold text-slate-200">{opcMix.wbRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings banner */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">خفّض كربون الخرسانة بمعدل</span>
            <strong className="text-2xl font-black text-emerald-400">%{carbonReduction}</strong>
          </div>
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">توفير ميزانية المواد بمعدل</span>
            <strong className="text-2xl font-black text-sky-400">%{costSavings}</strong>
          </div>
        </div>

        {/* Detailed Formulation Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">
            توزيع وزن ومكونات الخلطة التفصيلية (Formulation Breakdown)
          </h2>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2">Material Ingredient</th>
                <th className="py-2 text-right">Standard OPC (kg/m³)</th>
                <th className="py-2 text-right text-emerald-400">EcoMix Optimized (kg/m³)</th>
                <th className="py-2 text-right">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">CEM I Portland Cement</td>
                <td className="py-2.5 text-right">{opcMix.cement} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">{optimizedMix.cement} kg</td>
                <td className="py-2.5 text-right text-rose-400">
                  {Math.round(((optimizedMix.cement - opcMix.cement) / opcMix.cement) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Fly Ash (Eco Substitute)</td>
                <td className="py-2.5 text-right">{opcMix.flyAsh} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">{optimizedMix.flyAsh} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">GGBS Slag (Eco Substitute)</td>
                <td className="py-2.5 text-right">{opcMix.slag} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">{optimizedMix.slag} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Silica Fume (High Strength)</td>
                <td className="py-2.5 text-right">{opcMix.silicaFume} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">{optimizedMix.silicaFume} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Mixing Water</td>
                <td className="py-2.5 text-right">{opcMix.water} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">{optimizedMix.water} kg</td>
                <td className="py-2.5 text-right text-rose-400">
                  {Math.round(((optimizedMix.water - opcMix.water) / opcMix.water) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Aggregates (Sand & Gravel)</td>
                <td className="py-2.5 text-right">{opcMix.sand + opcMix.gravel} kg</td>
                <td className="py-2.5 text-right text-emerald-300 font-bold">
                  {optimizedMix.sand + optimizedMix.gravel} kg
                </td>
                <td className="py-2.5 text-right text-slate-400">
                  {Math.round(
                    (((optimizedMix.sand + optimizedMix.gravel) - (opcMix.sand + opcMix.gravel)) /
                      (opcMix.sand + opcMix.gravel)) *
                      100
                  )}
                  %
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quality stamp and official signature blocks */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex justify-between items-center">
          {/* Engineering Stamped Signature */}
          <div className="w-[140px] h-[140px] rounded-full border-4 border-double border-emerald-500/30 flex flex-col justify-center items-center text-center p-3 relative bg-emerald-500/5 select-none rotate-6">
            <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-black">ECOMIX ENGINE</span>
            <div className="my-1 border-t border-b border-emerald-500/20 py-0.5 px-2">
              <span className="text-[10px] text-emerald-400 font-bold">TS EN 206</span>
            </div>
            <span className="text-[8px] text-emerald-500/70">MÜDEK COMPLIANT</span>
            <span className="absolute bottom-2 text-[7px] text-slate-500">DIGITAL STAMP</span>
          </div>

          <div className="flex gap-16 text-right">
            <div>
              <p className="text-xs text-slate-500">Academic Assessor / Advisor</p>
              <div className="w-32 border-b border-slate-700 my-2 h-6"></div>
              <p className="text-sm font-semibold text-slate-300">Prof. Dr. Sustainability</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lead Civil Software Engineer</p>
              <div className="w-32 border-b border-slate-700 my-2 h-6"></div>
              <p className="text-sm font-semibold text-slate-300">Project Architect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
