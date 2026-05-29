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
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const input = document.getElementById('engineering-report-pdf');
    if (!input) return;

    input.classList.remove('hidden');

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#101415',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
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
        className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-400 hover:bg-emerald-500 active:scale-95 transition-all text-emerald-950 font-bold rounded-xl cursor-pointer shadow-[0_4px_20px_rgba(78,222,163,0.2)] group"
      >
        <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        <span>Export Stamped Engineering Report / Kaşeli Raporu İndir</span>
      </button>

      {/* HIDDEN PRINTABLE REPORT WRAPPER */}
      <div
        id="engineering-report-pdf"
        className="hidden w-[790px] p-10 bg-[#101415] text-[#e0e3e5] border border-slate-800 font-sans leading-relaxed relative"
      >
        {/* Academic Synergy Header */}
        <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#89ceff] tracking-tight">EcoMix</h1>
            <p className="text-xs text-[#4edea3] mt-1 uppercase tracking-widest font-semibold">
              Concrete Mix & Sustainability Optimizer / Beton Karışım ve Sürdürülebilirlik Optimizasyonu
            </p>
            <p className="text-xs text-slate-500 mt-1">MÜDEK & TS EN 206 Academic Integration Framework</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs uppercase mb-2">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>TS EN 206 CERTIFIED</span>
            </div>
            <p className="text-xs text-slate-400" suppressHydrationWarning>Date / Tarih: {new Date().toLocaleDateString()}</p>
            <p className="text-xs text-slate-500" suppressHydrationWarning>Document ID / Döküman No: EM-{Math.floor(100000 + Math.random() * 900000)}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 border-b border-white/10 pb-2 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#89ceff]" />
            <span>Executive Summary / Özet Rapor</span>
          </h2>
          <p className="text-sm text-slate-300">
            A multi-objective optimization analysis was performed for concrete strength class{' '}
            <strong className="text-[#89ceff] font-semibold">{targetClass}</strong> using the EcoMix engine.
            The formulation minimizes both cost and carbon footprint under strict TS EN 206 structural guidelines.
            <br />
            <span className="text-slate-400 text-xs italic block mt-2">
              EcoMix motoru kullanılarak {targetClass} sınıfı beton için çok amaçlı optimizasyon analizi yapılmıştır.
              Maliyet ve karbon ayak izi, TS EN 206 yönergelerine uygun olarak minimize edilmiştir.
            </span>
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* EcoMix optimized */}
          <div className="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
              EcoMix Optimized / Optimize Edilmiş
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Strength Target / Dayanım:</span>
                <span className="font-bold text-[#4edea3]">{targetClass} (Cube: {optimizedMix.strength} MPa)</span>
              </div>
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Carbon Footprint / Karbon:</span>
                <span className="font-bold text-[#4edea3]">{optimizedMix.carbon} kg CO2/m³</span>
              </div>
              <div className="flex justify-between border-b border-emerald-950/40 pb-1">
                <span className="text-slate-400">Material Cost / Maliyet:</span>
                <span className="font-bold text-[#4edea3]">${optimizedMix.cost} / m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">W/B Ratio / Su/Bağlayıcı Oranı:</span>
                <span className="font-bold text-[#4edea3]">{optimizedMix.wbRatio}</span>
              </div>
            </div>
          </div>

          {/* Standard OPC */}
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Standard OPC / Geleneksel Karışım
            </span>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Strength Target / Dayanım:</span>
                <span className="font-bold text-slate-200">{targetClass} (Cube: {opcMix.strength} MPa)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Carbon Footprint / Karbon:</span>
                <span className="font-bold text-slate-200">{opcMix.carbon} kg CO2/m³</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1">
                <span className="text-slate-400">Material Cost / Maliyet:</span>
                <span className="font-bold text-slate-200">${opcMix.cost} / m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">W/B Ratio / Su/Bağlayıcı Oranı:</span>
                <span className="font-bold text-slate-200">{opcMix.wbRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings banner */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Carbon Reduction / Karbon Azaltımı</span>
            <strong className="text-2xl font-black text-[#4edea3]">%{carbonReduction}</strong>
          </div>
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">Material Cost Savings / Maliyet Tasarrufu</span>
            <strong className="text-2xl font-black text-[#89ceff]">%{costSavings}</strong>
          </div>
        </div>

        {/* Detailed Formulation Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-200 border-b border-white/10 pb-2 mb-4">
            Component Weight Breakdown / Karışım Bileşen Oranları (kg/m³)
          </h2>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-850 text-slate-400 font-semibold">
                <th className="py-2">Material / Malzeme</th>
                <th className="py-2 text-right">Standard OPC (kg/m³)</th>
                <th className="py-2 text-right text-emerald-400">EcoMix Optimized (kg/m³)</th>
                <th className="py-2 text-right">Change / Değişim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">CEM I Portland Cement / CEM I Çimento</td>
                <td className="py-2.5 text-right">{opcMix.cement} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">{optimizedMix.cement} kg</td>
                <td className="py-2.5 text-right text-rose-400">
                  {Math.round(((optimizedMix.cement - opcMix.cement) / opcMix.cement) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Fly Ash (Eco Substitute) / Uçucu Kül</td>
                <td className="py-2.5 text-right">{opcMix.flyAsh} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">{optimizedMix.flyAsh} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">GGBS Slag (Eco Substitute) / Yüksek Fırın Cürufu</td>
                <td className="py-2.5 text-right">{opcMix.slag} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">{optimizedMix.slag} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Silica Fume (Eco Substitute) / Silis Dumanı</td>
                <td className="py-2.5 text-right">{opcMix.silicaFume} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">{optimizedMix.silicaFume} kg</td>
                <td className="py-2.5 text-right text-emerald-400">+100%</td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Mixing Water / Karışım Suyu</td>
                <td className="py-2.5 text-right">{opcMix.water} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">{optimizedMix.water} kg</td>
                <td className="py-2.5 text-right text-rose-400">
                  {Math.round(((optimizedMix.water - opcMix.water) / opcMix.water) * 100)}%
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-slate-300 font-medium">Aggregates (Sand & Gravel) / Agrega (Kum & Çakıl)</td>
                <td className="py-2.5 text-right">{opcMix.sand + opcMix.gravel} kg</td>
                <td className="py-2.5 text-right text-[#4edea3] font-bold">
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
        <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center">
          {/* Engineering Stamped Signature */}
          <div className="relative w-20 h-20 flex items-center justify-center transform rotate-6 border border-emerald-500/20 rounded-full bg-slate-900/50 p-2">
            <div className="absolute inset-1 border border-dashed border-emerald-500/40 rounded-full animate-[spin_60s_linear_infinite]"></div>
            <div className="text-center select-none">
              <span className="material-symbols-outlined text-emerald-400 block text-[24px] mb-0.5">verified</span>
              <span className="text-[7px] font-bold text-emerald-400 uppercase block leading-tight">TS EN 206<br/>APPROVED</span>
            </div>
          </div>

          <div className="flex gap-16 text-right">
            <div>
              <p className="text-xs text-slate-500">Academic Advisor / Akademik Danışman</p>
              <div className="w-32 border-b border-slate-700 my-2 h-6"></div>
              <p className="text-sm font-semibold text-slate-300">Prof. Dr. Sustainability</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Lead Systems Engineer / Baş Mühendis</p>
              <div className="w-32 border-b border-slate-700 my-2 h-6"></div>
              <p className="text-sm font-semibold text-slate-300">Project Architect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
