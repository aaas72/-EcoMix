'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <nav className="bg-[#1d2022]/60 backdrop-blur-md top-0 border-b border-white/10 flex justify-between items-center px-6 py-2 w-full z-50 sticky">
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#89ceff] uppercase drop-shadow-[0_0_8px_rgba(137,206,255,0.5)]">
              {t('logo')}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#c6c6cc] mt-0.5 tracking-wider">
            {language === 'en' 
              ? "Concrete Chemistry & Sustainability Engine" 
              : "Beton Kimyası ve Sürdürülebilirlik Motoru"}
          </span>
        </div>
      </div>

      {/* Right Section: Language Toggle & Profile Spacer */}
      <div className="flex items-center gap-3">
        {/* Language selector button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 bg-[#1d2022] hover:bg-[#323537] active:scale-95 border border-white/10 rounded-full px-3 py-1 text-xs font-bold text-[#89ceff] transition-all cursor-pointer shadow-[0_0_10px_rgba(137,206,255,0.05)]"
        >
          <span className="material-symbols-outlined text-[14px]">language</span>
          <span>{language === 'en' ? 'TR' : 'EN'}</span>
        </button>
      </div>
    </nav>
  );
}
