'use client';

import { useState } from 'react';
import { UrlInput } from '@/components/url-input';
import { AnalysisResultComponent } from '@/components/analysis-result';

const LOADING_MESSAGES = [
  "Sniffing for BS...",
  "Cross-referencing facts...",
  "Analyzing manipulation tactics...",
  "Consulting Google Search...",
  "Detecting logical fallacies...",
  "Checking for emotional manipulation...",
  "Verifying claims...",
  "Evaluating source credibility...",
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const rotateLoadingMessage = () => {
    let index = 0;
    const interval = setInterval(() => {
      setLoadingMessage(LOADING_MESSAGES[index]);
      index = (index + 1) % LOADING_MESSAGES.length;
    }, 2000);
    return interval;
  };

  const handleSubmit = async (submittedUrl: string) => {
    setUrl(submittedUrl);
    setIsLoading(true);
    setError('');
    setResult(null);
    setLoadingMessage(LOADING_MESSAGES[0]);

    const messageInterval = rotateLoadingMessage();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: submittedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze tweet');
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      clearInterval(messageInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">
            Bullshit Detector <span className="text-4xl">🔍</span>
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Paste a tweet. Get the truth.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-12">
          <UrlInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg text-[var(--text-secondary)] animate-pulse">
              {loadingMessage}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-2">
                Error
              </h3>
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="mt-8">
            <AnalysisResultComponent result={result} />
          </div>
        )}

        {/* Footer */}
        {!isLoading && !result && !error && (
          <div className="text-center mt-16">
            <p className="text-sm text-[var(--text-muted)]">
              AI-powered analysis. Not a substitute for critical thinking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
