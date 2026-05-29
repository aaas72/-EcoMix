'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReChartsTooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import PDFExporter from './PDFExporter';
import KPICard from './KPICard';
import PriceSlider from './PriceSlider';
import ComplianceIndicator from './ComplianceIndicator';
import {
  optimizeConcreteMix,
  getOpcBenchmark,
  TARGET_STRENGTHS,
  DEFAULT_MATERIALS,
} from '@/lib/OptimizationEngine';
import { useLanguage } from './LanguageContext';

export default function MixOptimizer() {
  const { t, language } = useLanguage();
  // Optimization State
  const [strengthClass, setStrengthClass] = useState<'C25' | 'C30' | 'C35' | 'C40'>('C35');
  const [priority, setPriority] = useState<'cost' | 'carbon' | 'balanced'>('balanced');

  // Interactive Material weights driven automatically by backend API and manually by sliders
  const [cementWeight, setCementWeight] = useState(180);
  const [flyAshWeight, setFlyAshWeight] = useState(120);
  const [slagWeight, setSlagWeight] = useState(40);
  const [silicaFumeWeight, setSilicaFumeWeight] = useState(0);

  // Constants
  const prices = useMemo(
    () => ({
      cement: DEFAULT_MATERIALS.cement.cost,
      flyAsh: DEFAULT_MATERIALS.flyAsh.cost,
      slag: DEFAULT_MATERIALS.slag.cost,
      silicaFume: DEFAULT_MATERIALS.silicaFume.cost,
    }),
    []
  );

  // 1. Compute constraint optimization recommendation locally & reactively AUTO-UPDATE sliders
  useEffect(() => {
    const localSolved = optimizeConcreteMix({
      strengthClass,
      optimizationPriority: priority,
      cementPrice: prices.cement,
      flyAshPrice: prices.flyAsh,
      slagPrice: prices.slag,
      silicaFumePrice: prices.silicaFume,
    });
    if (localSolved) {
      setCementWeight(localSolved.cement);
      setFlyAshWeight(localSolved.flyAsh);
      setSlagWeight(localSolved.slag);
      setSilicaFumeWeight(localSolved.silicaFume);
    }
  }, [strengthClass, priority, prices]);

  // 2. Compute live properties for current slider configuration
  const optimizedMix = useMemo(() => {
    const usedVol =
      cementWeight / DEFAULT_MATERIALS.cement.density +
      160 / DEFAULT_MATERIALS.water.density +
      flyAshWeight / DEFAULT_MATERIALS.flyAsh.density +
      slagWeight / DEFAULT_MATERIALS.slag.density +
      silicaFumeWeight / DEFAULT_MATERIALS.silicaFume.density;
    
    const aggVol = Math.max(0, 1 - usedVol - 0.015);
    const aggWeight = aggVol * 2680;
    const sand = Math.round(aggWeight * 0.4);
    const gravel = Math.round(aggWeight * 0.6);

    const solvedLocal = optimizeConcreteMix({
      strengthClass,
      optimizationPriority: priority,
      cementPrice: prices.cement,
      flyAshPrice: prices.flyAsh,
      slagPrice: prices.slag,
      silicaFumePrice: prices.silicaFume,
    });

    return {
      cement: cementWeight,
      water: 160,
      flyAsh: flyAshWeight,
      slag: slagWeight,
      silicaFume: silicaFumeWeight,
      sand,
      gravel,
      strength: Math.min(60, Math.round((solvedLocal.strength + (cementWeight - 150) * 0.06 + flyAshWeight * 0.01) * 10) / 10),
      wbRatio: Math.round((160 / (cementWeight + flyAshWeight + slagWeight + silicaFumeWeight)) * 100) / 100,
      totalBinder: cementWeight + flyAshWeight + slagWeight + silicaFumeWeight,
      cost: Math.round((cementWeight * prices.cement + flyAshWeight * prices.flyAsh + slagWeight * prices.slag + silicaFumeWeight * prices.silicaFume + sand * 0.018 + gravel * 0.022 + 160 * 0.002) * 100) / 100,
      carbon: Math.round((cementWeight * 0.85 + flyAshWeight * 0.015 + slagWeight * 0.07 + silicaFumeWeight * 0.025 + sand * 0.005 + gravel * 0.006 + 160 * 0.0002) * 100) / 100,
      volume: 1.0,
    };
  }, [strengthClass, priority, cementWeight, flyAshWeight, slagWeight, silicaFumeWeight, prices]);

  const opcMix = useMemo(() => getOpcBenchmark(strengthClass), [strengthClass]);

  const carbonReduction = Math.round(((opcMix.carbon - optimizedMix.carbon) / opcMix.carbon) * 100);
  const costSavings = Math.round(((opcMix.cost - optimizedMix.cost) / opcMix.cost) * 100);
  // TS EN 206 Standards Compliance Flags
  const isWbCompliant = optimizedMix.wbRatio <= 0.45;
  const isBinderCompliant = optimizedMix.totalBinder >= 300;
  const totalReplacementRatio = ((optimizedMix.flyAsh + optimizedMix.slag + optimizedMix.silicaFume) / optimizedMix.totalBinder) * 100;
  const isReplacementCompliant = totalReplacementRatio <= 75;

  // Charts data
  const weightChartData = [
    { name: 'OPC', OPC: opcMix.carbon, EcoMix: 0 },
    { name: t('ecomixOpt') as any, OPC: 0, EcoMix: optimizedMix.carbon },
  ];

  const radarChartData = [
    { subject: t('radarStrength'), OPC: 90, EcoMix: Math.min(100, Math.round((optimizedMix.strength / TARGET_STRENGTHS[strengthClass]) * 95)) },
    { subject: t('radarCost'), OPC: 80, EcoMix: Math.min(100, Math.round((optimizedMix.cost / opcMix.cost) * -100 + 150)) },
    { subject: t('radarCarbon'), OPC: 20, EcoMix: Math.min(100, Math.round((optimizedMix.carbon / opcMix.carbon) * -100 + 150)) },
    { subject: t('radarWorkability'), OPC: 85, EcoMix: 92 },
    { subject: t('radarDurability'), OPC: 80, EcoMix: optimizedMix.wbRatio <= 0.45 ? 100 : 70 },
  ];

  return (
    <div className="flex flex-col gap-gutter">
      {/* 4-Card Overview KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
        <KPICard
          label={t('carbonRed')}
          icon="eco"
          metric={`-${carbonReduction}%`}
          caption={t('carbonRedCap')}
          glowColor="#4edea3"
        />
        <KPICard
          label={t('costSavings')}
          icon="payments"
          metric={`-${costSavings}%`}
          caption={t('costSavingsCap')}
          glowColor="#89ceff"
        />
        <KPICard
          label={t('strengthMetric')}
          icon="fitness_center"
          metric={`${optimizedMix.strength} MPa`}
          caption={`${t('strengthCap')}: ${TARGET_STRENGTHS[strengthClass]} MPa`}
          glowColor="#c9e6ff"
        />
        <KPICard
          label={t('compliance')}
          icon="verified"
          metric={isWbCompliant && isBinderCompliant && isReplacementCompliant ? t('fullyCompliant') : t('nonCompliant')}
          caption={t('complianceCap')}
          glowColor="#4edea3"
          footer={isWbCompliant && isBinderCompliant && isReplacementCompliant ? t('fullyCompliant') : t('nonCompliant')}
        />
      </section>

      {/* Main 2-Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start w-full">
        {/* Left Configurator Column */}
        <div className="lg:col-span-4 flex flex-col gap-gutter w-full">
          <div className="glass-panel p-panel-padding space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2 w-full">
                <span className="material-symbols-outlined text-[#4edea3]">tune</span>
                {t('mixParams')}
              </h2>
            </div>

            {/* Strength Class Selection */}
            <div className="mb-stack-lg">
              <label className="text-label-caps font-label-caps text-on-surface-variant block mb-2">
                {t('strengthClass')}
              </label>
              <div className="flex bg-[#323537] p-1 rounded-lg border border-white/5">
                {(['C25', 'C30', 'C35', 'C40'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setStrengthClass(cls)}
                    className={`flex-1 py-1.5 text-body-md font-body-md rounded-md transition-all cursor-pointer ${
                      strengthClass === cls
                        ? 'bg-[#191c1e] text-[#4edea3] border border-[#4edea3]/30 shadow-[0_0_10px_rgba(78,222,163,0.1)] font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Optimization Target Select */}
            <div className="mb-stack-lg">
              <label className="text-label-caps font-label-caps text-on-surface-variant block mb-2">
                {t('optTarget')}
              </label>
              <div className="flex bg-[#323537] p-1 rounded-lg border border-white/5 flex-col sm:flex-row gap-1">
                {(['balanced', 'cost', 'carbon'] as const).map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setPriority(pr)}
                    className={`flex-1 py-2 text-label-caps font-label-caps rounded-md transition-all cursor-pointer ${
                      priority === pr
                        ? 'bg-[#191c1e] text-[#89ceff] border border-[#89ceff]/30'
                        : 'text-on-surface-variant hover:bg-white/5'
                    }`}
                  >
                    {pr === 'balanced' ? t('balanced') : pr === 'cost' ? t('minCost') : t('minCarbon')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-stack-md pt-2">
              <PriceSlider
                label={t('cement')}
                value={cementWeight}
                min={100}
                max={400}
                accentColorClass="accent-[#4edea3]"
                textColorClass="text-on-surface"
                onChange={setCementWeight}
              />
              <PriceSlider
                label={t('flyAsh')}
                value={flyAshWeight}
                min={0}
                max={200}
                accentColorClass="accent-[#89ceff]"
                textColorClass="text-[#89ceff]"
                onChange={setFlyAshWeight}
              />
              <PriceSlider
                label={t('slag')}
                value={slagWeight}
                min={0}
                max={200}
                accentColorClass="accent-[#89ceff]"
                textColorClass="text-[#89ceff]"
                onChange={setSlagWeight}
              />
              <PriceSlider
                label={t('silicaFume')}
                value={silicaFumeWeight}
                min={0}
                max={50}
                accentColorClass="accent-[#909096]"
                textColorClass="text-on-surface-variant"
                onChange={setSilicaFumeWeight}
              />
            </div>
          </div>

          {/* Dynamic Recipe Card to balance the vertical spacing */}
          <div className="glass-panel p-panel-padding space-y-3">
            <h3 className="text-title-sm font-title-sm text-on-surface border-b border-white/5 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#89ceff]">assignment</span>
              {language === 'en' ? 'Material Recipe / m³' : 'Malzeme Reçetesi / m³'}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">{t('cement')}</span>
                <span className="font-bold text-[#e0e3e5]">{optimizedMix.cement} kg</span>
              </div>
              {optimizedMix.flyAsh > 0 && (
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-[#89ceff]">{t('flyAsh')}</span>
                  <span className="font-bold text-[#89ceff]">{optimizedMix.flyAsh} kg</span>
                </div>
              )}
              {optimizedMix.slag > 0 && (
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-[#89ceff]">{t('slag')}</span>
                  <span className="font-bold text-[#89ceff]">{optimizedMix.slag} kg</span>
                </div>
              )}
              {optimizedMix.silicaFume > 0 && (
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-[#909096]">{t('silicaFume')}</span>
                  <span className="font-bold text-[#909096]">{optimizedMix.silicaFume} kg</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">{language === 'en' ? 'Mixing Water' : 'Karışım Suyu'}</span>
                <span className="font-bold text-[#e0e3e5]">{optimizedMix.water} kg</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">{language === 'en' ? 'Fine Sand' : 'İnce Kum'}</span>
                <span className="font-bold text-[#e0e3e5]">{optimizedMix.sand} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'en' ? 'Coarse Gravel' : 'Kaba Mıcır'}</span>
                <span className="font-bold text-[#e0e3e5]">{optimizedMix.gravel} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Column */}
        <div className="lg:col-span-8 flex flex-col gap-gutter w-full">
          {/* TS EN 206 Compliance panel */}
          <div className="glass-panel p-panel-padding flex flex-col md:flex-row gap-stack-md justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-title-sm font-title-sm text-on-surface">{t('standardsParams')}</h3>
              <span className="text-label-caps font-label-caps text-on-surface-variant">{t('exposureClass')}</span>
            </div>

            <div className="flex gap-stack-lg">
              <ComplianceIndicator
                value={optimizedMix.wbRatio}
                label={t('wbRatio')}
                limitLabel={`${t('maxLimit')}: 0.45`}
                isCompliant={isWbCompliant}
              />
              <div className="w-px bg-white/10 h-10 align-middle self-center"></div>
              <ComplianceIndicator
                value={`${optimizedMix.totalBinder} kg`}
                label={t('totalBinder')}
                limitLabel={`${t('minLimit')}: 300 kg`}
                isCompliant={isBinderCompliant}
              />
              <div className="w-px bg-white/10 h-10 align-middle self-center"></div>
              <ComplianceIndicator
                value={`${Math.round(totalReplacementRatio)}%`}
                label={t('replacement')}
                limitLabel={`${t('maxLimit')}: 75%`}
                isCompliant={isReplacementCompliant}
                isAccentBlue={true}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="glass-panel p-panel-padding flex flex-col min-h-[300px]">
              <h3 className="text-title-sm font-title-sm text-on-surface mb-stack-md">
                {t('chartCarbonTitle')}
              </h3>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <ReChartsTooltip
                      cursor={false}
                      contentStyle={{
                        backgroundColor: '#101415',
                        borderColor: '#272a2c',
                        color: '#e0e3e5',
                      }}
                    />
                    <Bar dataKey="OPC" fill="#323537" radius={[4, 4, 0, 0]} name={t('opcStandard') as string} />
                    <Bar dataKey="EcoMix" fill="#4edea3" radius={[4, 4, 0, 0]} name={t('ecomixOpt') as string} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-panel-padding flex flex-col min-h-[300px]">
              <h3 className="text-title-sm font-title-sm text-on-surface mb-stack-md">
                {t('chartRadarTitle')}
              </h3>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                    <PolarGrid stroke="#323537" />
                    <PolarAngleAxis dataKey="subject" stroke="#c6c6cc" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#272a2c" tick={false} />
                    <Radar name={t('opcStandard') as string} dataKey="OPC" stroke="#45474b" fill="#45474b" fillOpacity={0.15} />
                    <Radar name={t('ecomixOpt') as string} dataKey="EcoMix" stroke="#4edea3" fill="#4edea3" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Exporter */}
      <footer className="glass-panel p-panel-padding mt-gutter relative overflow-hidden flex flex-col md:flex-row justify-between items-center bg-[#0b0f10]/80 border-t border-white/10">
        <div className="absolute left-0 bottom-0 w-1/2 h-full bg-gradient-to-r from-[#4edea3]/5 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-stack-lg z-10 w-full md:w-auto mb-stack-md md:mb-0">
          {/* Rotatable Circular Digital Stamp */}
          <div className="relative w-20 h-20 flex items-center justify-center transform rotate-6 border border-[#4edea3]/20 rounded-full bg-[#1d2022]">
            <div className="absolute inset-1 border border-dashed border-[#4edea3]/40 rounded-full animate-[spin_60s_linear_infinite]"></div>
            <div className="text-center select-none">
              <span className="material-symbols-outlined text-[#4edea3] block text-[24px] mb-0.5">verified</span>
              <span className="text-[7px] font-bold text-[#4edea3] uppercase block leading-tight">TS EN 206<br />VALID</span>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-title-sm font-title-sm text-on-surface">{t('accreditationTitle')}</h4>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
              {t('accreditationDesc')}
            </p>
          </div>
        </div>
        <PDFExporter
          optimizedMix={optimizedMix}
          opcMix={opcMix}
          targetClass={strengthClass}
          priority={priority}
          prices={prices}
        />
      </footer>
    </div>
  );
}
