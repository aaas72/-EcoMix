import React from 'react';

interface PriceSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  accentColorClass: string; // e.g. 'accent-[#4edea3]' or 'accent-[#89ceff]'
  textColorClass: string; // e.g. 'text-[#89ceff]' or 'text-on-surface'
  onChange: (val: number) => void;
}

export default function PriceSlider({
  label,
  value,
  min,
  max,
  accentColorClass,
  textColorClass,
  onChange,
}: PriceSliderProps) {
  return (
    <div className="group">
      <div className="flex justify-between items-end mb-1">
        <label className="text-label-caps font-label-caps text-on-surface">{label}</label>
        <span className={`bg-[#323537] px-2 py-0.5 rounded text-label-caps font-label-caps font-mono ${textColorClass}`}>
          {value} kg
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-1 bg-[#323537] rounded-lg appearance-none cursor-pointer ${accentColorClass}`}
      />
    </div>
  );
}
