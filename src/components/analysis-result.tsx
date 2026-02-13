'use client';

import { useState, useMemo } from 'react';
import { ScoreGauge } from './score-gauge';
import { ReasonChip } from './reason-chip';
import type { AnalysisResult } from '@/lib/gemini';

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

interface AnalysisResultProps {
  result: AnalysisResult;
}

export function AnalysisResultComponent({ result }: AnalysisResultProps) {
  const [claimsExpanded, setClaimsExpanded] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const safeSources = useMemo(
    () => (result.groundingSources ?? []).filter(s => isSafeUrl(s.url)),
    [result.groundingSources]
  );

  const getClaimBadge = (verdict: string) => {
    switch (verdict) {
      case 'true':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'false':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'misleading':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'unverifiable':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'opinion':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Score Gauge */}
      <div className="relative flex justify-center py-8">
        <ScoreGauge score={result.score} verdict={result.verdict} />
      </div>

      {/* Summary */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
          Summary
        </h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Reason Chips */}
      {result.reasons.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Key Indicators
          </h3>
          <div className="flex flex-wrap gap-3">
            {result.reasons.map((reason, index) => (
              <ReasonChip
                key={index}
                tag={reason.tag}
                type={reason.type}
                explanation={reason.explanation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Claims Analysis */}
      {result.claims.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setClaimsExpanded(!claimsExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors"
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Claims Analysis ({result.claims.length})
            </h3>
            <svg
              className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${
                claimsExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {claimsExpanded && (
            <div className="px-6 pb-6 space-y-4">
              {result.claims.map((claim, index) => (
                <div key={index} className="border-t border-[var(--border)] pt-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getClaimBadge(
                        claim.verdict
                      )}`}
                    >
                      {claim.verdict.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)] mb-2">{claim.claim}</p>
                      <p className="text-sm text-[var(--text-secondary)]">{claim.evidence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Analysis */}
      {result.imageAnalysis && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setImageExpanded(!imageExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors"
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Image Analysis
            </h3>
            <svg
              className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${
                imageExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {imageExpanded && (
            <div className="px-6 pb-6 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                  Description
                </h4>
                <p className="text-[var(--text-primary)]">{result.imageAnalysis.description}</p>
              </div>

              {result.imageAnalysis.concerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                    Concerns
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {result.imageAnalysis.concerns.map((concern, index) => (
                      <li key={index} className="text-[var(--text-primary)]">
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-1">
                  Authenticity Assessment
                </h4>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    result.imageAnalysis.likelyAuthentic
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {result.imageAnalysis.likelyAuthentic ? 'Likely Authentic' : 'Authenticity Concerns'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      {safeSources.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors"
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Verification Sources ({safeSources.length})
            </h3>
            <svg
              className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${
                sourcesExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {sourcesExpanded && (
            <div className="px-6 pb-6 space-y-2">
              {safeSources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-[var(--bg-input)] transition-colors border border-[var(--border)]"
                >
                  <p className="text-[var(--accent)] hover:underline font-medium">
                    {source.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate mt-1">
                    {source.url}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
