'use client';

import { useState } from 'react';

interface ReasonChipProps {
  tag: string;
  type: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export function ReasonChip({ tag, type, explanation }: ReasonChipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    positive: 'bg-green-500/20 text-green-400 border-green-500/30',
    negative: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
          hover:scale-105 cursor-help ${colorClasses[type]}`}
      >
        {tag}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 shadow-xl max-w-xs">
            <p className="text-sm text-[var(--text-primary)]">{explanation}</p>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-8 border-transparent border-t-[var(--border)]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
