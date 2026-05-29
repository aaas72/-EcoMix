import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  glow = false,
}: GlassCardProps) {
  return (
    <div
      className={`glass-panel p-6 transition-all duration-300 ${
        glow ? 'glow-accent border-secondary/20' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
