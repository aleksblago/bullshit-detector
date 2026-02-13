'use client';

import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  verdict: string;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // green
  if (score >= 70) return '#84cc16'; // lime
  if (score >= 50) return '#eab308'; // yellow
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function ScoreGauge({ score, verdict }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [score]);

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 70; // radius = 70
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" className="absolute inset-0 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--border)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-out',
            }}
          />
        </svg>

        {/* Score only in center */}
        <div className="text-6xl font-bold z-10" style={{ color }}>
          {animatedScore}
        </div>
      </div>

      {/* Verdict label below the gauge */}
      <div className="text-xl text-[var(--text-secondary)] mt-4 font-medium">
        {verdict}
      </div>
    </div>
  );
}
