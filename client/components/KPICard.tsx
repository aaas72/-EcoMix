import React from 'react';

interface KPICardProps {
  label: string;
  icon: string;
  metric: string | number;
  caption: string;
  footer?: string;
  glowColor: string; // e.g. '#4edea3', '#89ceff'
}

export default function KPICard({
  label,
  icon,
  metric,
  caption,
  footer,
  glowColor,
}: KPICardProps) {
  return (
    <div className="glass-panel p-panel-padding flex flex-col gap-stack-sm relative overflow-hidden group">
      {/* Decorative Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-300"
        style={{ backgroundColor: glowColor }}
      />
      
      <div className="flex justify-between items-center z-10">
        <span className="text-label-caps font-label-caps text-on-surface-variant">{label}</span>
        <span className="material-symbols-outlined" style={{ color: glowColor }}>{icon}</span>
      </div>
      
      <div className="text-display-lg font-display-lg z-10" style={{ color: glowColor === '#c9e6ff' ? '#e0e3e5' : glowColor }}>
        {metric}
      </div>
      
      <div className="text-body-md font-body-md text-on-surface-variant z-10">{caption}</div>
      
      {footer && (
        <div 
          className="text-label-caps font-label-caps z-10 mt-auto pt-2 border-t border-white/10"
          style={{ color: glowColor === '#4edea3' ? '#4edea3' : '#89ceff' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
