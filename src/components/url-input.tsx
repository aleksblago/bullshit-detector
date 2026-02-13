'use client';

import { useState, useEffect } from 'react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear error when user starts typing
    if (error && url) {
      setError('');
    }
  }, [url, error]);

  const validateUrl = (input: string): boolean => {
    const tweetUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
    return tweetUrlRegex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please paste a Twitter/X URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Invalid URL. Must be a Twitter/X post link');
      return;
    }

    setError('');
    onSubmit(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setUrl(pastedText);
    setError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="Paste a Twitter/X post URL..."
            disabled={isLoading}
            className={`w-full px-6 py-4 bg-[var(--bg-input)] text-[var(--text-primary)] border rounded-xl text-lg
              focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-[var(--error)]' : 'border-[var(--border)]'}`}
          />
          {error && (
            <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full px-6 py-4 bg-[var(--accent)] text-white font-semibold rounded-xl
            hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-[var(--accent)] text-lg"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Post'}
        </button>
      </form>
    </div>
  );
}
