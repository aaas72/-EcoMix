import React from 'react';
import MixOptimizer from '@/components/MixOptimizer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#101415] relative overflow-hidden">
      {/* Background neon gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Google Material Symbols and Styles */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* TopAppBar */}
      <nav className="bg-[#1d2022]/60 backdrop-blur-md top-0 border-b border-white/10 flex justify-between items-center px-6 py-2 w-full z-50 sticky">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter text-[#89ceff] uppercase drop-shadow-[0_0_8px_rgba(137,206,255,0.5)]">
                EcoMix
              </span>
              <span className="bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#4edea3]/30">
                Optimizer
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#c6c6cc] mt-0.5 tracking-wider">
              Concrete Chemistry & Sustainability Engine / Beton Kimyası ve Sürdürülebilirlik Motoru
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            className="text-[#4edea3] font-bold border-b-2 border-[#4edea3] pb-1 text-sm hover:text-white transition-colors duration-300"
            href="#"
          >
            Dashboard / Panel
          </a>
          <a
            className="text-[#c6c6cc] text-sm hover:text-white transition-colors duration-300"
            href="#"
          >
            Analytics / Analiz
          </a>
          <a
            className="text-[#c6c6cc] text-sm hover:text-white transition-colors duration-300"
            href="#"
          >
            Compliance / Uyumluluk
          </a>
          <a
            className="text-[#c6c6cc] text-sm hover:text-white transition-colors duration-300"
            href="#"
          >
            Reports / Raporlar
          </a>
        </div>

        {/* Right Section: Clean spacer or simple profile placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#1d2022] border border-white/5 flex items-center justify-center text-xs text-[#c6c6cc]">
            EM
          </div>
        </div>
      </nav>

      {/* Main Content Layout Container */}
      <main className="flex-grow p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-gutter">
        {/* Core Bilingual Explanation Section */}
        <section className="glass-panel p-panel-padding relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-[#4edea3]/10">
            <span className="material-symbols-outlined text-[64px]">science</span>
          </div>
          <div className="max-w-4xl space-y-2">
            <h2 className="text-lg font-black text-[#e0e3e5]">
              <span>Constrained Concrete Mixture Optimization / Beton Karışım Optimizasyonu</span>
            </h2>
            <p className="text-xs text-[#c6c6cc] leading-relaxed">
              <strong>EcoMix Optimizer</strong> represents an academic engineering milestone, balancing software mathematical optimizations 
              with civil structural constraints. Through Bolomey calculations and eco-substitute k-factors, it optimizes mixtures 
              for strength requirements (<strong className="text-[#4edea3]">C25 to C40</strong>) under standard{' '}
              <strong className="text-[#89ceff]">TS EN 206</strong> durabilities, minimizing cost and carbon footprint in real-time.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              * EcoMix Optimizer, yazılım matematiksel optimizasyonları ile inşaat yapısal kısıtlamalarını dengeleyen akademik bir mühendislik kilometre taşıdır.
            </p>
          </div>
        </section>

        {/* Dashboard Grid Panel */}
        <section className="w-full">
          <MixOptimizer />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0b0f10]/40 py-6 text-center text-[10px] text-slate-500">
        <p>
          © {new Date().getFullYear()} EcoMix Optimizer. Designed for Academic Accreditation & MÜDEK Excellence Criteria / MÜDEK Mükemmeliyet Kriterleri.
        </p>
      </footer>
    </div>
  );
}
