'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="border-t border-white/5 bg-[#0b0f10]/40 py-6 text-center text-[10px] text-slate-500">
      <p>
        © {new Date().getFullYear()} EcoMix Optimizer. {
          language === 'en' 
            ? "Designed for Academic Accreditation & MÜDEK Excellence Criteria."
            : "Akademik Akreditasyon ve MÜDEK Mükemmeliyet Kriterleri için tasarlanmıştır."
        }
      </p>
    </footer>
  );
}
