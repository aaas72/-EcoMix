import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-[#1d2022]/60 backdrop-blur-md top-0 border-b border-white/10 flex justify-between items-center px-6 py-2 w-full z-50 sticky">
      {/* Left: Brand */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tighter text-[#89ceff] uppercase drop-shadow-[0_0_8px_rgba(137,206,255,0.5)]">
              EcoMix
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
          className="text-[#4edea3] font-bold text-sm hover:text-white transition-colors duration-300"
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
  );
}
