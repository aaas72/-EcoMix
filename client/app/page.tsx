import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

      {/* Modular Header Navigation */}
      <Navbar />

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

      {/* Modular Footer */}
      <Footer />
    </div>
  );
}
