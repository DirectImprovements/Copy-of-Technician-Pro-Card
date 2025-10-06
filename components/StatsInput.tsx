import React from 'react';

interface StatsInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  hideLabel?: boolean;
  min?: number;
  max?: number;
}

export const StatsInput: React.FC<StatsInputProps> = ({ label, value, onChange, type = 'text', hideLabel = false, min, max }) => {
  return (
    <div>
      {!hideLabel && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
      />
    </div>
  );
};
