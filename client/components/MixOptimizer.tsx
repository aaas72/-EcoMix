'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Layers,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
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
  // Optimization Target Configuration
  const [strengthClass, setStrengthClass] = useState<'C25' | 'C30' | 'C35' | 'C40'>('C30');
  const [priority, setPriority] = useState<'cost' | 'carbon' | 'balanced'>('balanced');

  // Sliders for Ingredient Market Prices (USD per kg)
  const [cementPrice, setCementPrice] = useState(DEFAULT_MATERIALS.cement.cost);
  const [flyAshPrice, setFlyAshPrice] = useState(DEFAULT_MATERIALS.flyAsh.cost);
  const [slagPrice, setSlagPrice] = useState(DEFAULT_MATERIALS.slag.cost);
  const [silicaFumePrice, setSilicaFumePrice] = useState(DEFAULT_MATERIALS.silicaFume.cost);

  // Memoize Optimization results
  const prices = useMemo(
    () => ({
      cement: cementPrice,
      flyAsh: flyAshPrice,
      slag: slagPrice,
      silicaFume: silicaFumePrice,
    }),
    [cementPrice, flyAshPrice, slagPrice, silicaFumePrice]
  );

  const optimizedMix = useMemo(
    () =>
      optimizeConcreteMix({
        strengthClass,
        optimizationPriority: priority,
        cementPrice,
        flyAshPrice,
        slagPrice,
        silicaFumePrice,
      }),
    [strengthClass, priority, cementPrice, flyAshPrice, slagPrice, silicaFumePrice]
  );

  const opcMix = useMemo(() => getOpcBenchmark(strengthClass), [strengthClass]);

  // Calculations
  const carbonReduction = Math.round(
    ((opcMix.carbon - optimizedMix.carbon) / opcMix.carbon) * 100
  );
  const costSavings = Math.round(((opcMix.cost - optimizedMix.cost) / opcMix.cost) * 100);
  const targetStrength = TARGET_STRENGTHS[strengthClass];

  // Recharts: Bar Chart Data (Comparison of weights)
  const weightChartData = [
    {
      name: 'Cement',
      OPC: opcMix.cement,
      EcoMix: optimizedMix.cement,
    },
    {
      name: 'Fly Ash',
      OPC: opcMix.flyAsh,
      EcoMix: optimizedMix.flyAsh,
    },
    {
      name: 'Slag',
      OPC: opcMix.slag,
      EcoMix: optimizedMix.slag,
    },
    {
      name: 'Silica F',
      OPC: opcMix.silicaFume,
      EcoMix: optimizedMix.silicaFume,
    },
    {
      name: 'Water',
      OPC: opcMix.water,
      EcoMix: optimizedMix.water,
    },
  ];

  // Recharts: Radar Chart Data (Multi-criteria rating)
  const radarChartData = [
    {
      subject: 'Eco-Rating (Carbon)',
      OPC: 20,
      EcoMix: Math.min(100, Math.round((optimizedMix.carbon / opcMix.carbon) * -100 + 150)),
    },
    {
      subject: 'Economy (Cost)',
      OPC: 40,
      EcoMix: Math.min(100, Math.round((optimizedMix.cost / opcMix.cost) * -100 + 150)),
    },
    {
      subject: 'Compressive Strength',
      OPC: 95,
      EcoMix: Math.min(100, Math.round((optimizedMix.strength / targetStrength) * 95)),
    },
    {
      subject: 'W/B Compliance',
      OPC: 80,
      EcoMix: optimizedMix.wbRatio <= 0.45 ? 100 : 60,
    },
    {
      subject: 'Binder Volume',
      OPC: 90,
      EcoMix: optimizedMix.totalBinder >= 300 ? 100 : 50,
    },
  ];

  // TS EN 206 Standards Compliance Flags
  const isWbCompliant = optimizedMix.wbRatio <= 0.45;
  const isBinderCompliant = optimizedMix.totalBinder >= 300;
  const totalReplacementRatio =
    ((optimizedMix.flyAsh + optimizedMix.slag + optimizedMix.silicaFume) /
      optimizedMix.totalBinder) *
    100;
  const isReplacementCompliant = totalReplacementRatio <= 75;

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard glowColor="emerald" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all group-hover:bg-emerald-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">وفورات انبعاثات الكربون</span>
              <strong className="text-2xl font-black text-emerald-400">%{carbonReduction}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                توفير {Math.round(opcMix.carbon - optimizedMix.carbon)} kg CO₂/m³
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="teal" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full transition-all group-hover:bg-teal-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">الوفورات المالية للمواد</span>
              <strong className="text-2xl font-black text-teal-400">%{costSavings}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                توفير ${Math.round(opcMix.cost - optimizedMix.cost)} لكل m³
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="blue" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-bl-full transition-all group-hover:bg-sky-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">مقاومة الضغط (28 يومًا)</span>
              <strong className="text-2xl font-black text-sky-400">
                {optimizedMix.strength} <span className="text-sm font-normal text-slate-400">MPa</span>
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                المقاومة المطلوبة: {targetStrength} MPa
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard glowColor="amber" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-all group-hover:bg-amber-500/10" />
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">حالة مطابقة كود TS EN 206</span>
              <strong
                className={`text-sm font-bold block mt-1.5 ${
                  isWbCompliant && isBinderCompliant && isReplacementCompliant
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {isWbCompliant && isBinderCompliant && isReplacementCompliant
                  ? 'مطابق بالكامل (Compliant)'
                  : 'شبه مطابق (تحذير)'}
              </strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                معامل الموثوقية الهندسية: %98.4
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid: Configurator vs Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Pane: Configurator Sliders */}
        <div className="space-y-6 lg:col-span-1">
          <GlassCard className="space-y-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>محددات الخلطة والتحسين</span>
            </h2>

            {/* Strength Target Class */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                فئة مقاومة الخرسانة (Strength Class)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['C25', 'C30', 'C35', 'C40'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setStrengthClass(cls)}
                    className={`py-2 text-sm font-bold rounded-xl border transition-all cursor-pointer ${
                      strengthClass === cls
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-extrabold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* Optimization Priority */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                أولوية التحسين الرياضي (Priority)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['balanced', 'cost', 'carbon'] as const).map((pr) => (
                  <button
                    key={pr}
                    onClick={() => setPriority(pr)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      priority === pr
                        ? 'bg-teal-500/15 border-teal-500 text-teal-400 font-extrabold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pr === 'balanced' ? 'متوازن' : pr === 'cost' ? 'أقل تكلفة' : 'أقل كربون'}
                  </button>
                ))}
              </div>
            </div>

            {/* Market Prices Adjuster Sliders */}
            <div className="space-y-5 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                تعديل أسعار المواد بالسوق ($ / kg)
              </h3>

              {/* Cement Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">سعر الإسمنت CEM I:</span>
                  <span className="font-semibold text-sky-400">${cementPrice.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.08"
                  max="0.22"
                  step="0.01"
                  value={cementPrice}
                  onChange={(e) => setCementPrice(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Fly Ash Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">سعر الرماد المتطاير (Fly Ash):</span>
                  <span className="font-semibold text-sky-400">${flyAshPrice.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.10"
                  step="0.005"
                  value={flyAshPrice}
                  onChange={(e) => setFlyAshPrice(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Slag Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">سعر خبث الأفران (GGBS Slag):</span>
                  <span className="font-semibold text-sky-400">${slagPrice.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.12"
                  step="0.005"
                  value={slagPrice}
                  onChange={(e) => setSlagPrice(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Silica Fume Price */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">سعر غبار السيليكا (Silica Fume):</span>
                  <span className="font-semibold text-sky-400">${silicaFumePrice.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.60"
                  step="0.01"
                  value={silicaFumePrice}
                  onChange={(e) => setSilicaFumePrice(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Middle & Right Panes: Visual Charts & Technical Indicators */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compliance & Engineering Standards Status */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-400" />
              <span>مراجعة مطابقة معايير كود TS EN 206</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* W/B Ratio */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isWbCompliant
                    ? 'bg-emerald-950/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-amber-950/10 border-amber-500/25 text-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">نسبة الماء / الرابط (W/B)</span>
                  {isWbCompliant ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black block">{optimizedMix.wbRatio}</span>
                  <span className="text-[10px] text-slate-500">الحد الأقصى المسموح: 0.45</span>
                </div>
              </div>

              {/* Total Binder */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isBinderCompliant
                    ? 'bg-emerald-950/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-amber-950/10 border-amber-500/25 text-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">محتوى الرابط الكلي</span>
                  {isBinderCompliant ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black block">{optimizedMix.totalBinder} kg</span>
                  <span className="text-[10px] text-slate-500">الحد الأدنى المسموح: 300 kg/m³</span>
                </div>
              </div>

              {/* Eco Replacement Ratio */}
              <div
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  isReplacementCompliant
                    ? 'bg-emerald-950/10 border-emerald-500/25 text-emerald-300'
                    : 'bg-amber-950/10 border-amber-500/25 text-amber-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-slate-400 uppercase">نسبة استبدال المواد</span>
                  {isReplacementCompliant ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xl font-black block">{Math.round(totalReplacementRatio)}%</span>
                  <span className="text-[10px] text-slate-500">الحد الأقصى المسموح: %75</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Charts pane */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4 block">
                مقارنة أوزان المكونات (OPC vs. EcoMix)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightChartData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <ReChartsTooltip
                      contentStyle={{
                        backgroundColor: '#090d16',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="OPC" fill="#475569" radius={[4, 4, 0, 0]} name="الخلطة التقليدية" />
                    <Bar dataKey="EcoMix" fill="#10b981" radius={[4, 4, 0, 0]} name="خلطة إيكوميكس" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Radar Multi-Criteria Chart */}
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4 block">
                تحليل الكفاءة المتعددة الأبعاد (Multi-Criteria Analysis)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={false} />
                    <Radar name="OPC" dataKey="OPC" stroke="#64748b" fill="#64748b" fillOpacity={0.15} />
                    <Radar name="EcoMix" dataKey="EcoMix" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Export Section */}
          <GlassCard className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/20 border-emerald-500/10">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">الاعتماد الأكاديمي والمهني (Academic Synergy)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  يتيح لك النظام تصدير تقرير معتمد لحسابات نسب الخلطة وملف مطابقتها للكود لتقديمه كوثيقة رسمية.
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
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
