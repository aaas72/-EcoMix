'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MixOptimizer from '@/components/MixOptimizer';
import { LanguageProvider, useLanguage } from '@/components/LanguageContext';

function DashboardContent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-[#101415] relative">
      {/* Background neon gradients wrapped to preserve position: sticky scrolling context */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

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
              <span>{t('subtitle')}</span>
            </h2>
            <p className="text-xs text-[#c6c6cc] leading-relaxed">
              {t('academicIntro')}
            </p>
            <p className="text-[11px] text-slate-500 italic">
              {t('academicIntroSub')}
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

export default function Home() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
