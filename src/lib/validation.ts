/**
 * URL validation and sanitization for Twitter/X post URLs
 */

export const TWEET_URL_REGEX = /^https?:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/;
const MAX_INPUT_LENGTH = 300;

export interface ValidationResult {
  valid: boolean;
  tweetId?: string;
  error?: string;
}

/**
 * Validates a Twitter/X tweet URL and extracts the tweet ID
 */
export function validateTweetUrl(input: string): ValidationResult {
  const sanitized = sanitizeInput(input);

  if (!sanitized) {
    return {
      valid: false,
      error: 'URL cannot be empty',
    };
  }

  if (sanitized.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      error: 'URL is too long',
    };
  }

  const match = sanitized.match(TWEET_URL_REGEX);

  if (!match) {
    return {
      valid: false,
      error: 'Invalid Twitter/X URL. Must be a tweet URL like https://twitter.com/username/status/123456789',
    };
  }

  const tweetId = match[2];

  // Validate tweet ID is a reasonable numeric value
  if (tweetId.length > 20 || !/^\d+$/.test(tweetId)) {
    return {
      valid: false,
      error: 'Invalid tweet ID in URL',
    };
  }

  return {
    valid: true,
    tweetId,
  };
}

/**
 * Sanitizes user input by removing control characters and trimming
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters (0x00-0x1F and 0x7F-0x9F)
  const cleaned = input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Trim whitespace
  return cleaned.trim();
}
