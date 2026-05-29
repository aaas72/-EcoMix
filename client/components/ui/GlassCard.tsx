import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'teal' | 'blue' | 'amber' | 'none';
}

export default function GlassCard({
  children,
  className = '',
  glowColor = 'none',
}: GlassCardProps) {
  const glowStyles = {
    emerald: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/25',
    teal: 'hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] hover:border-teal-500/25',
    blue: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.1)] hover:border-sky-500/25',
    amber: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:border-amber-500/25',
    none: '',
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${glowStyles[glowColor]} ${className}`}
    >
      {children}
    </div>
  );
}
