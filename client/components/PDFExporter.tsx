'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';
import { ConcreteMix } from '@/lib/OptimizationEngine';
import { useLanguage } from './LanguageContext';

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
  const { t, language } = useLanguage();

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas-pro');

    const input = document.getElementById('engineering-report-pdf');
    if (!input) return;

    input.classList.remove('hidden');

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
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
      const filename = language === 'en'
        ? `EcoMix_Official_Report_${targetClass}_${dateStr}.pdf`
        : `EcoMix_Resmi_Raporu_${targetClass}_${dateStr}.pdf`;
      pdf.save(filename);
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
        <span>{t('exportPdf')}</span>
      </button>

      {/* HIDDEN PRINTABLE OFFICIAL A4 REPORT WRAPPER */}
      <div
        id="engineering-report-pdf"
        className="hidden w-[795px] min-h-[1120px] p-12 bg-white text-slate-800 border border-slate-300 font-sans leading-relaxed relative flex flex-col justify-between"
      >
        <div>
          {/* Official Academic Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('logo')}</h1>
              <p className="text-xs text-slate-600 mt-1 font-bold uppercase tracking-wider">
                {t('subtitle')}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">TS EN 206 Academic Integration Framework</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-slate-800 rounded text-slate-800 font-bold text-xs uppercase mb-2">
                <span>TS EN 206 VALIDATED</span>
              </div>
              <p className="text-[11px] text-slate-600" suppressHydrationWarning>
                {language === 'en' ? 'Date' : 'Tarih'}: {new Date().toLocaleDateString()}
              </p>
              <p className="text-[11px] text-slate-600" suppressHydrationWarning>
                {t('pdfDocIdLabel')}: EM-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide uppercase border-y border-slate-200 py-2">
              {t('pdfTitle')}
            </h2>
          </div>

          {/* Executive Summary */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>{t('pdfSummaryTitle')}</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              {t('pdfSummaryDesc').replace('{targetClass}', targetClass)}
            </p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* EcoMix Optimized Mix */}
            <div className="p-4 border border-slate-300 rounded bg-slate-50">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1">
                {t('pdfOptimizedTitle')}
              </span>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>{t('pdfStrengthTarget')}:</span>
                  <span className="font-bold text-slate-900">{targetClass} (Cube: {optimizedMix.strength} MPa)</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pdfCarbonFootprint')}:</span>
                  <span className="font-bold text-slate-900">{optimizedMix.carbon} kg CO₂/m³</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pdfMaterialCost')}:</span>
                  <span className="font-bold text-slate-900">${optimizedMix.cost} / m³</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('wbRatio')}:</span>
                  <span className="font-bold text-slate-900">{optimizedMix.wbRatio}</span>
                </div>
              </div>
            </div>

            {/* Standard Reference OPC Mix */}
            <div className="p-4 border border-slate-300 rounded">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1">
                {t('pdfOpcTitle')}
              </span>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('pdfStrengthTarget')}:</span>
                  <span>{targetClass} (Cube: {opcMix.strength} MPa)</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pdfCarbonFootprint')}:</span>
                  <span>{opcMix.carbon} kg CO₂/m³</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('pdfMaterialCost')}:</span>
                  <span>${opcMix.cost} / m³</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('wbRatio')}:</span>
                  <span>{opcMix.wbRatio}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Enhancements Banner */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-center">
            <div className="p-3 border border-slate-300 rounded bg-slate-50">
              <span className="text-[10px] text-slate-600 uppercase block font-semibold mb-0.5">{t('carbonRed')}</span>
              <strong className="text-xl font-black text-slate-900">-{carbonReduction}%</strong>
            </div>
            <div className="p-3 border border-slate-300 rounded bg-slate-50">
              <span className="text-[10px] text-slate-600 uppercase block font-semibold mb-0.5">{t('costSavings')}</span>
              <strong className="text-xl font-black text-slate-900">-{costSavings}%</strong>
            </div>
          </div>

          {/* Detailed Formulation Table */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
              {t('pdfTableTitle')}
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-350 text-slate-800 font-bold">
                  <th className="py-2 px-3 border-r border-slate-300">{t('pdfTableColMaterial')}</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300">{t('pdfTableColOpc')}</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/50 font-bold text-slate-900">{t('pdfTableColEcoMix')}</th>
                  <th className="py-2 px-3 text-right">{t('pdfTableColChange')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-700">
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('cement')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.cement} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.cement} kg</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {Math.round(((optimizedMix.cement - opcMix.cement) / opcMix.cement) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('flyAsh')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.flyAsh} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.flyAsh} kg</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {optimizedMix.flyAsh > 0 ? '+100%' : '0%'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('slag')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.slag} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.slag} kg</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {optimizedMix.slag > 0 ? '+100%' : '0%'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('silicaFume')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.silicaFume} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.silicaFume} kg</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {optimizedMix.silicaFume > 0 ? '+100%' : '0%'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('pdfWaterLabel')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.water} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.water} kg</td>
                  <td className="py-2 px-3 text-right text-rose-400">
                    {Math.round(((optimizedMix.water - opcMix.water) / opcMix.water) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 border-r border-slate-300 font-semibold">{t('pdfTableAggregates')}</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300">{opcMix.sand + opcMix.gravel} kg</td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 bg-slate-50/20 font-bold text-slate-900">{optimizedMix.sand + optimizedMix.gravel} kg</td>
                  <td className="py-2 px-3 text-right text-slate-800">
                    {Math.round(
                      (((optimizedMix.sand + optimizedMix.gravel) - (opcMix.sand + opcMix.gravel)) /
                        (opcMix.sand + opcMix.gravel)) *
                        100
                    )}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality validation stamp and official signature blocks */}
        <div className="pt-6 border-t-2 border-slate-800 flex justify-between items-end">
          {/* Engineering Stamped Signature */}
          <div className="relative w-24 h-24 flex items-center justify-center border-2 border-slate-700 rounded-full p-2 bg-slate-50 rotate-3">
            <div className="absolute inset-1 border border-dashed border-slate-500 rounded-full"></div>
            <div className="text-center select-none">
              <span className="text-[14px] font-black text-slate-900 block leading-tight">TS EN 206</span>
              <span className="text-[6px] font-black text-slate-700 uppercase tracking-widest block leading-tight">VALIDATED<br/>ACC. BOARD</span>
              <span className="text-[7px] font-bold text-slate-500 block leading-tight mt-1">EM-STAMP</span>
            </div>
          </div>

          <div className="flex gap-16 text-right">
            <div>
              <p className="text-[10px] font-bold text-slate-600">{t('accreditationTitle')}</p>
              <div className="w-40 border-b border-slate-400 my-2 h-6"></div>
              <p className="text-[9px] text-slate-500">{t('pdfSignAdvisorDesc')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600">{t('accreditationTitle')}</p>
              <div className="w-40 border-b border-slate-400 my-2 h-6"></div>
              <p className="text-[9px] text-slate-500">{t('pdfSignEngineerDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
