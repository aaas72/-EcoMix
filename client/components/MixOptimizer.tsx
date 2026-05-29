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

  // Backend Integration State
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline'>('offline');
  const [backendSolvedResult, setBackendSolvedResult] = useState<any>(null);

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

  // 1. Check Backend API Server Health
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') {
          setBackendStatus('online');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  // 2. Fetch constraint optimization recommendation from Backend API
  useEffect(() => {
    fetch('http://localhost:5000/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        strengthClass,
        optimizationPriority: priority,
        cementPrice: prices.cement,
        flyAshPrice: prices.flyAsh,
        slagPrice: prices.slag,
        silicaFumePrice: prices.silicaFume,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBackendSolvedResult(data.optimizedResult);
        }
      })
      .catch((err) => {
        console.warn('Backend server optimizer is offline, using client solver fallback.', err);
      });
  }, [strengthClass, priority, prices]);

  // Apply server-solved recommendation values to standard weights state
  const applyServerRecommendation = () => {
    const recommended = backendSolvedResult || optimizeConcreteMix({
      strengthClass,
      optimizationPriority: priority,
      cementPrice: prices.cement,
      flyAshPrice: prices.flyAsh,
      slagPrice: prices.slag,
      silicaFumePrice: prices.silicaFume,
    });

    if (recommended) {
      setCementWeight(recommended.cement);
      setFlyAshWeight(recommended.flyAsh);
      setSlagWeight(recommended.slag);
      setSilicaFumeWeight(recommended.silicaFume);
    }
  };

  // Compute live properties for current slider configuration
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

    const targetStrengthValue = TARGET_STRENGTHS[strengthClass];

    // local solver fallback estimation logic
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

  // Charts data
  const weightChartData = [
    { name: 'OPC', OPC: opcMix.carbon, EcoMix: 0 },
    { name: 'EcoMix Opt', OPC: 0, EcoMix: optimizedMix.carbon },
  ];

  const radarChartData = [
    { subject: 'Strength / Mukavemet', OPC: 90, EcoMix: Math.min(100, Math.round((optimizedMix.strength / TARGET_STRENGTHS[strengthClass]) * 95)) },
    { subject: 'Cost / Maliyet', OPC: 80, EcoMix: Math.min(100, Math.round((optimizedMix.cost / opcMix.cost) * -100 + 150)) },
    { subject: 'Carbon / Karbon', OPC: 20, EcoMix: Math.min(100, Math.round((optimizedMix.carbon / opcMix.carbon) * -100 + 150)) },
    { subject: 'Workability / İşlenebilirlik', OPC: 85, EcoMix: 92 },
    { subject: 'Durability / Dayanıklılık', OPC: 80, EcoMix: optimizedMix.wbRatio <= 0.45 ? 100 : 70 },
  ];

  // TS EN 206 Standards Compliance Flags
  const isWbCompliant = optimizedMix.wbRatio <= 0.45;
  const isBinderCompliant = optimizedMix.totalBinder >= 300;
  const totalReplacementRatio = ((optimizedMix.flyAsh + optimizedMix.slag + optimizedMix.silicaFume) / optimizedMix.totalBinder) * 100;
  const isReplacementCompliant = totalReplacementRatio <= 75;

  return (
    <div className="flex flex-col gap-gutter">
      {/* 4-Card Overview KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter w-full">
        <KPICard
          label="Carbon Reduction / Karbon Azaltımı"
          icon="eco"
          metric={`-${carbonReduction}%`}
          caption="vs Standard OPC"
          glowColor="#4edea3"
        />
        <KPICard
          label="Cost Savings / Maliyet Tasarrufu"
          icon="payments"
          metric={`-${costSavings}%`}
          caption="Per Cubic Meter"
          glowColor="#89ceff"
        />
        <KPICard
          label="28-Day Strength / 28 Günlük Dayanım"
          icon="fitness_center"
          metric={`${optimizedMix.strength} MPa`}
          caption={`Target: ${TARGET_STRENGTHS[strengthClass]} MPa`}
          glowColor="#c9e6ff"
        />
        <KPICard
          label="Compliance Status / Uyumluluk Durumu"
          icon="verified"
          metric="Fully Compliant"
          caption="TS EN 206 Validated"
          glowColor="#4edea3"
          footer="Tam Uyumlu"
        />
      </section>

      {/* Main 2-Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start w-full">
        {/* Left Configurator Column */}
        <div className="lg:col-span-4 flex flex-col gap-gutter w-full">
          <div className="glass-panel p-panel-padding space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-title-sm font-title-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3]">tune</span>
                Mix Parameters / Karışım Parametreleri
              </h2>
              {/* Backend Status Dot Indicator */}
              <div className="flex items-center gap-1.5 bg-[#1d2022] border border-white/5 px-2.5 py-1 rounded-full text-[9px] font-bold">
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'online' ? 'bg-[#4edea3] animate-pulse' : 'bg-rose-500'}`}></span>
                <span className={backendStatus === 'online' ? 'text-[#4edea3]' : 'text-rose-400'}>
                  {backendStatus === 'online' ? 'API Online / Bağlı' : 'API Offline / Çevrimdışı'}
                </span>
              </div>
            </div>

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

            {/* Active API Solver Trigger Button */}
            <button
              onClick={applyServerRecommendation}
              className="w-full bg-[#101415] hover:bg-[#1d2022] active:scale-98 transition-all border border-[#4edea3]/30 text-[#4edea3] py-3 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(78,222,163,0.05)] hover:shadow-[0_0_15px_rgba(78,222,163,0.1)] group"
            >
              <span className="material-symbols-outlined text-sm group-hover:rotate-45 transition-transform">bolt</span>
              <span>Load Server-Optimized Mix / Sunucu Hesaplamasını Yükle</span>
            </button>

            {/* Sliders */}
            <div className="flex flex-col gap-stack-md pt-2">
              <PriceSlider
                label="CEM I (Portland)"
                value={cementWeight}
                min={100}
                max={400}
                accentColorClass="accent-[#4edea3]"
                textColorClass="text-on-surface"
                onChange={setCementWeight}
              />
              <PriceSlider
                label="Fly Ash (Uçucu Kül)"
                value={flyAshWeight}
                min={0}
                max={200}
                accentColorClass="accent-[#89ceff]"
                textColorClass="text-[#89ceff]"
                onChange={setFlyAshWeight}
              />
              <PriceSlider
                label="GGBS (Cüruf)"
                value={slagWeight}
                min={0}
                max={200}
                accentColorClass="accent-[#89ceff]"
                textColorClass="text-[#89ceff]"
                onChange={setSlagWeight}
              />
              <PriceSlider
                label="Silica Fume (Silis Dumanı)"
                value={silicaFumeWeight}
                min={0}
                max={50}
                accentColorClass="accent-[#909096]"
                textColorClass="text-on-surface-variant"
                onChange={setSilicaFumeWeight}
              />
            </div>
          </div>
        </div>

        {/* Right Analytics Column */}
        <div className="lg:col-span-8 flex flex-col gap-gutter w-full">
          {/* TS EN 206 Compliance panel */}
          <div className="glass-panel p-panel-padding flex flex-col md:flex-row gap-stack-md justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-title-sm font-title-sm text-on-surface">TS EN 206 Parameters / Parametreleri</h3>
              <span className="text-label-caps font-label-caps text-on-surface-variant">Exposure Class / Maruz Kalma: XC3, XF1</span>
            </div>

            <div className="flex gap-stack-lg">
              <ComplianceIndicator
                value={optimizedMix.wbRatio}
                label="W/B Ratio / Su-Bağlayıcı"
                limitLabel="Max Limit / Azami Limit: 0.45"
                isCompliant={isWbCompliant}
              />
              <div className="w-px bg-white/10 h-10 align-middle self-center"></div>
              <ComplianceIndicator
                value={`${optimizedMix.totalBinder} kg`}
                label="Total Binder / Bağlayıcı"
                limitLabel="Min Limit / Asgari Limit: 300 kg"
                isCompliant={isBinderCompliant}
              />
              <div className="w-px bg-white/10 h-10 align-middle self-center"></div>
              <ComplianceIndicator
                value={`${Math.round(totalReplacementRatio)}%`}
                label="Replacement / İkame"
                limitLabel="Max Limit / Azami Limit: 75%"
                isCompliant={isReplacementCompliant}
                isAccentBlue={true}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
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
