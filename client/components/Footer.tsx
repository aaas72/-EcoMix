import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0f10]/40 py-6 text-center text-[10px] text-slate-500">
      <p>
        © {new Date().getFullYear()} EcoMix Optimizer. Designed for Academic Accreditation & MÜDEK Excellence Criteria / MÜDEK Mükemmeliyet Kriterleri.
      </p>
    </footer>
  );
}
