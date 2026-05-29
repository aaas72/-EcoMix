import React from 'react';
import { Shield, Sparkles, Cpu, Award } from 'lucide-react';
import MixOptimizer from '@/components/MixOptimizer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] relative overflow-hidden">
      {/* Background neon gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Header section */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                <span>EcoMix</span>
                <span className="text-xs font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-md">
                  Optimizer
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                Concrete Chemistry & Sustainability Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>مطابق لمعايير جودة الاعتماد الأكاديمي (MÜDEK)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Shield className="w-4 h-4" />
              <span>TS EN 206 Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Academic Synergy Presentation */}
        <section className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/20">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="max-w-3xl space-y-2">
            <h2 className="text-xl font-black text-slate-200 flex items-center gap-2">
              <span>التكامل المعرفي بين هندسة البرمجيات والهندسة المدنية</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-sky-500/15 text-sky-400 rounded">
                Interdisciplinary Synergy
              </span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              يقدم مشروع <strong>EcoMix Optimizer</strong> نموذجاً ذكياً لحل مسألة تحسين الخواص الإنشائية والبيئية
              للخرسانة. من خلال صياغة العلاقات الرياضية لكفاءة استبدال المواد الإسمنتية بمخلفات صديقة للبيئة (الرماد المتطاير،
              خبث أفران الحديد، غبار السيليكا)، نضمن مطابقة رتب الخرسانة (<strong className="text-emerald-400 font-semibold">C30 / C35</strong>) بالكامل لمعيار{' '}
              <strong className="text-sky-400 font-semibold">TS EN 206</strong> مع خفض البصمة الكربونية والميزانية بنسب قياسية.
            </p>
          </div>
        </section>

        {/* Core Optimizer Engine Dashboard */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-black text-slate-200">لوحة التحكم في الخلطة الذكية</h3>
              <p className="text-xs text-slate-500">عدل أسعار السوق وفئة المقاومة لمشاهدة التحسين الرياضي الفوري</p>
            </div>
          </div>
          <MixOptimizer />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EcoMix Optimizer. Built for Academic Accreditation (MÜDEK Excellence Standard).</p>
      </footer>
    </div>
  );
}
