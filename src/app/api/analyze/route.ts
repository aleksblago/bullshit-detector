/**
 * API endpoint for tweet analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateTweetUrl } from '@/lib/validation';
import { fetchTweet, TweetData } from '@/lib/twitter';
import { analyzeTweet, AnalysisResult } from '@/lib/gemini';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TRACKED_IPS = 10000;
let lastCleanup = Date.now();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup: remove stale entries every 5 minutes
  if (now - lastCleanup > 300000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (recent.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, recent);
      }
    }
    lastCleanup = now;
  }

  // Hard cap on tracked IPs to prevent memory exhaustion
  if (rateLimitMap.size > MAX_TRACKED_IPS && !rateLimitMap.has(ip)) {
    return true; // Allow but don't track if map is full
  }

  const requests = rateLimitMap.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-real-ip') ||
               request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 requests per minute.' },
        { status: 429 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate and extract tweet ID
    const validation = validateTweetUrl(url);

    if (!validation.valid || !validation.tweetId) {
      return NextResponse.json(
        { error: validation.error || 'Invalid URL' },
        { status: 400 }
      );
    }

    const tweetId = validation.tweetId;

    // Fetch tweet data
    let tweetData: TweetData;
    try {
      tweetData = await fetchTweet(tweetId);
    } catch (error) {
      console.error('Tweet fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tweet. The tweet may not exist or is unavailable.' },
        { status: 502 }
      );
    }

    // Analyze with Gemini
    let analysis: AnalysisResult;
    try {
      const authorInfo = `@${tweetData.author.username} (${tweetData.author.name})${
        tweetData.author.verified ? ' [Verified]' : ''
      }`;

      analysis = await analyzeTweet(
        tweetData.text,
        authorInfo,
        tweetData.images
      );
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze tweet. Please try again.' },
        { status: 500 }
      );
    }

    // Return successful analysis
    return NextResponse.json({
      success: true,
      tweet: {
        text: tweetData.text,
        author: tweetData.author,
        images: tweetData.images,
        createdAt: tweetData.createdAt,
        engagement: tweetData.engagement,
      },
      analysis,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
