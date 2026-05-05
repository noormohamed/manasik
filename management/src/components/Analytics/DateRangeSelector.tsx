'use client';

export interface DateRangeSelectorProps {
  /** Currently selected range in days */
  value: 7 | 30 | 90;
  /** Callback when the user selects a different range */
  onChange: (range: 7 | 30 | 90) => void;
}

const options: { label: string; value: 7 | 30 | 90 }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
];

export default function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-300 bg-white" role="group">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
