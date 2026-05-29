import React from 'react';

interface ComplianceIndicatorProps {
  value: string | number;
  label: string;
  limitLabel: string;
  isCompliant: boolean;
  isAccentBlue?: boolean;
}

export default function ComplianceIndicator({
  value,
  label,
  limitLabel,
  isCompliant,
  isAccentBlue = false,
}: ComplianceIndicatorProps) {
  const textCol = isCompliant 
    ? (isAccentBlue ? 'text-[#89ceff]' : 'text-[#4edea3]')
    : 'text-amber-500';

  return (
    <div className="flex flex-col items-center">
      <span className={`text-headline-md font-headline-md transition-colors duration-300 ${textCol}`}>
        {value}
      </span>
      <span className="text-label-caps font-label-caps text-on-surface-variant uppercase text-center">{label}</span>
      <span className="text-[10px] text-slate-600 mt-1">{limitLabel}</span>
    </div>
  );
}
