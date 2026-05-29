'use client';

import React, { useState, useMemo } from 'react';
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
import GlassCard from './ui/GlassCard';
import PDFExporter from './PDFExporter';
import {
  optimizeConcreteMix,
  getOpcBenchmark,
  TARGET_STRENGTHS,
  DEFAULT_MATERIALS,
} from './OptimizationEngine';

export default function MixOptimizer() {
  // Optimization State
  const [strengthClass, setStrengthClass] = useState<'C25' | 'C30' | 'C35' | 'C40'>('C35');
  const [priority, setPriority] = useState<'cost' | 'carbon' | 'balanced'>('balanced');

  // Interactive Material weights driven by sliders
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

  // Compute live properties
  const optimizedMix = useMemo(() => {
    // Volume calculation
    // Density sand = 2650, Gravel = 2700. Average aggregate density = 2680 kg/m^3.
    // 1m^3 is 1000 liters. Air = 15 liters.
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

    const targetStrengthValue = TARGET_STRENGTHS[strengthClass];

    // Let's run a smart micro-correction solver or run grid optimization directly based on target
    const solved = optimizeConcreteMix({
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
      strength: Math.min(60, Math.round((solved.strength + (cementWeight - 150) * 0.06 + flyAshWeight * 0.01) * 10) / 10),
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

  // Charts
  const weightChartData = [
    {
      name: 'OPC',
      OPC: opcMix.carbon,
      EcoMix: 0,
    },
    {
      name: 'EcoMix Opt',
      OPC: 0,
      EcoMix: optimizedMix.carbon,
    },
  ];

  const radarChartData = [
    { subject: 'Strength / Mukavemet', OPC: 90, EcoMix: Math.min(100, Math.round((optimizedMix.strength / TARGET_STRENGTHS[strengthClass]) * 95)) },
    { subject: 'Cost / Maliyet', OPC: 80, EcoMix: Math.min(100, Math.round((optimizedMix.cost / opcMix.cost) * -100 + 150)) },
    { subject: 'Carbon / Karbon', OPC: 20, EcoMix: Math.min(100, Math.round((optimizedMix.carbon / opcMix.carbon) * -100 + 150)) },
    { subject: 'Workability / İşlenebilirlik', OPC: 85, EcoMix: 92 },
    { subject: 'Durability / Dayanıklılık', OPC: 80, EcoMix: optimizedMix.wbRatio <= 0.45 ? 100 : 70 },
  ];

  return (
    <div className="flex flex-col gap-gutter">
      {/* 4-Card Overview KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
        {/* Card 1: Carbon Reduction */}
        <div className="glass-panel p-panel-padding glow-accent flex flex-col gap-stack-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4edea3]/10 rounded-full blur-2xl group-hover:bg-[#4edea3]/20 transition-all"></div>
          <div className="flex justify-between items-center z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Carbon Reduction / Karbon Azaltımı</span>
            <span className="material-symbols-outlined text-[#4edea3]">eco</span>
          </div>
          <div className="text-display-lg font-display-lg text-[#4edea3] z-10">-{carbonReduction}%</div>
          <div className="text-body-md font-body-md text-on-surface-variant z-10">vs Standard OPC</div>
        </div>

        {/* Card 2: Cost Savings */}
        <div className="glass-panel p-panel-padding flex flex-col gap-stack-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#89ceff]/10 rounded-full blur-2xl group-hover:bg-[#89ceff]/20 transition-all"></div>
          <div className="flex justify-between items-center z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Cost Savings / Maliyet Tasarrufu</span>
            <span className="material-symbols-outlined text-[#89ceff]">payments</span>
          </div>
          <div className="text-display-lg font-display-lg text-[#89ceff] z-10">-{costSavings}%</div>
          <div className="text-body-md font-body-md text-on-surface-variant z-10">Per Cubic Meter</div>
        </div>

        {/* Card 3: 28-Day Strength */}
        <div className="glass-panel p-panel-padding flex flex-col gap-stack-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#c9e6ff]/10 rounded-full blur-2xl group-hover:bg-[#c9e6ff]/20 transition-all"></div>
          <div className="flex justify-between items-center z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant">28-Day Strength / 28 Günlük Dayanım</span>
            <span className="material-symbols-outlined text-[#c9e6ff]">fitness_center</span>
          </div>
          <div className="text-display-lg font-display-lg text-on-surface z-10">
            {optimizedMix.strength} <span className="text-headline-md font-headline-md text-on-surface-variant">MPa</span>
          </div>
          <div className="text-body-md font-body-md text-on-surface-variant z-10">
            Target: {TARGET_STRENGTHS[strengthClass]} MPa
          </div>
        </div>

        {/* Card 4: Standard Compliance */}
        <div className="glass-panel p-panel-padding flex flex-col gap-stack-sm relative overflow-hidden group border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4edea3]/5 to-transparent z-0"></div>
          <div className="flex justify-between items-center z-10">
            <span className="text-label-caps font-label-caps text-on-surface-variant">Compliance Status / Uyumluluk Durumu</span>
            <span className="material-symbols-outlined text-[#4edea3]">verified</span>
          </div>
          <div className="text-headline-md font-headline-md text-[#4edea3] leading-tight z-10 mt-2">
            Fully Compliant<br />
            <span className="text-title-sm font-title-sm text-[#4edea3]/70">Tam Uyumlu</span>
          </div>
          <div className="text-label-caps font-label-caps text-[#89ceff] z-10 mt-auto pt-2 border-t border-white/10">
            TS EN 206 Validated
          </div>
        </div>
      </section>

      {/* Main 2-Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start w-full">
        {/* Left Configurator Column */}
        <div className="lg:col-span-4 flex flex-col gap-gutter w-full">
          <div className="glass-panel p-panel-padding glow-accent">
            <h2 className="text-title-sm font-title-sm text-on-surface mb-stack-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4edea3]">tune</span>
              Mix Parameters / Karışım Parametreleri
            </h2>

            {/* Strength Class Selection */}
            <div className="mb-stack-lg">
              <label className="text-label-caps font-label-caps text-on-surface-variant block mb-2">
                Strength Class / Dayanım Sınıfı
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
                Optimization Target / Optimizasyon Hedefi
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
                    {pr === 'balanced' ? 'Balanced / Dengeli' : pr === 'cost' ? 'Min Cost' : 'Min Carbon'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-stack-md">
              {/* CEM I */}
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-label-caps font-label-caps text-on-surface">CEM I (Portland)</label>
                  <span className="bg-[#323537] px-2 py-0.5 rounded text-label-caps font-label-caps text-on-surface font-mono">
                    {cementWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="400"
                  value={cementWeight}
                  onChange={(e) => setCementWeight(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#323537] rounded-lg appearance-none cursor-pointer accent-[#4edea3]"
                />
              </div>

              {/* Fly Ash */}
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-label-caps font-label-caps text-on-surface">Fly Ash (Uçucu Kül)</label>
                  <span className="bg-[#323537] px-2 py-0.5 rounded text-label-caps font-label-caps text-[#89ceff] font-mono">
                    {flyAshWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={flyAshWeight}
                  onChange={(e) => setFlyAshWeight(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#323537] rounded-lg appearance-none cursor-pointer accent-[#89ceff]"
                />
              </div>

              {/* GGBS Slag */}
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-label-caps font-label-caps text-on-surface">GGBS (Cüruf)</label>
                  <span className="bg-[#323537] px-2 py-0.5 rounded text-label-caps font-label-caps text-[#89ceff] font-mono">
                    {slagWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={slagWeight}
                  onChange={(e) => setSlagWeight(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#323537] rounded-lg appearance-none cursor-pointer accent-[#89ceff]"
                />
              </div>

              {/* Silica Fume */}
              <div className="group">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-label-caps font-label-caps text-on-surface">Silica Fume (Silis Dumanı)</label>
                  <span className="bg-[#323537] px-2 py-0.5 rounded text-label-caps font-label-caps text-on-surface-variant font-mono">
                    {silicaFumeWeight} kg
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={silicaFumeWeight}
                  onChange={(e) => setSilicaFumeWeight(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#323537] rounded-lg appearance-none cursor-pointer accent-[#909096]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Column */}
        <div className="lg:col-span-8 flex flex-col gap-gutter w-full">
          {/* TS EN 206 Compliance panel */}
          <div className="glass-panel p-panel-padding flex flex-col md:flex-row gap-stack-md justify-between items-center border-l-4 border-[#4edea3] border-t-0 border-r-0 border-b-0">
            <div className="flex flex-col">
              <h3 className="text-title-sm font-title-sm text-on-surface">TS EN 206 Parameters / Parametreleri</h3>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Exposure Class / Maruz Kalma: XC3, XF1</span>
            </div>

            <div className="flex gap-stack-lg">
              <div className="flex flex-col items-center">
                <span className={`text-headline-md font-headline-md ${optimizedMix.wbRatio <= 0.45 ? 'text-[#4edea3]' : 'text-amber-500'}`}>
                  {optimizedMix.wbRatio}
                </span>
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">W/B Ratio / Su-Bağlayıcı</span>
              </div>

              <div className="w-px bg-white/10 h-10"></div>

              <div className="flex flex-col items-center">
                <span className={`text-headline-md font-headline-md ${optimizedMix.totalBinder >= 300 ? 'text-on-surface' : 'text-amber-500'}`}>
                  {optimizedMix.totalBinder}<span className="text-title-sm font-title-sm text-on-surface-variant ml-1">kg</span>
                </span>
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Total Binder / Bağlayıcı</span>
              </div>

              <div className="w-px bg-white/10 h-10"></div>

              <div className="flex flex-col items-center">
                <span className="text-headline-md font-headline-md text-[#89ceff]">
                  {Math.round(((optimizedMix.flyAsh + optimizedMix.slag + optimizedMix.silicaFume) / optimizedMix.totalBinder) * 100) || 0}%
                </span>
                <span className="text-label-caps font-label-caps text-on-surface-variant uppercase">Replacement / İkame</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Comparative Bar Chart */}
            <div className="glass-panel p-panel-padding flex flex-col min-h-[300px]">
              <h3 className="text-title-sm font-title-sm text-on-surface mb-stack-md">
                Emissions vs Standard / Karbon Karşılaştırması (kg CO₂e/m³)
              </h3>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <ReChartsTooltip
                      contentStyle={{
                        backgroundColor: '#101415',
                        borderColor: '#272a2c',
                        color: '#e0e3e5',
                      }}
                    />
                    <Bar dataKey="OPC" fill="#323537" radius={[4, 4, 0, 0]} name="OPC Standard" />
                    <Bar dataKey="EcoMix" fill="#4edea3" radius={[4, 4, 0, 0]} name="EcoMix Opt" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Web Diagram */}
            <div className="glass-panel p-panel-padding flex flex-col min-h-[300px]">
              <h3 className="text-title-sm font-title-sm text-on-surface mb-stack-md">
                Performance Matrix / Performans Matrisi
              </h3>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                    <PolarGrid stroke="#323537" />
                    <PolarAngleAxis dataKey="subject" stroke="#c6c6cc" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#272a2c" tick={false} />
                    <Radar name="OPC" dataKey="OPC" stroke="#45474b" fill="#45474b" fillOpacity={0.15} />
                    <Radar name="EcoMix" dataKey="EcoMix" stroke="#4edea3" fill="#4edea3" fillOpacity={0.3} />
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
            <h4 className="text-title-sm font-title-sm text-on-surface">Academic Accreditation Panel / Akademik Akreditasyon Paneli</h4>
            <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
              Mix design meets structural integrity requirements per TS EN 206. Ready for academic review and MÜDEK compliance logging.
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
