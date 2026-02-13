/**
 * Gemini API integration for tweet analysis with Google Search grounding
 */

import { GoogleGenAI } from "@google/genai";
import { buildAnalysisPrompt } from "./prompts";

export interface AnalysisResult {
  score: number;
  verdict: string;
  summary: string;
  reasons: Array<{
    tag: string;
    type: 'positive' | 'negative' | 'neutral';
    explanation: string;
  }>;
  claims: Array<{
    claim: string;
    verdict: 'true' | 'false' | 'misleading' | 'unverifiable' | 'opinion';
    evidence: string;
  }>;
  imageAnalysis: {
    description: string;
    concerns: string[];
    likelyAuthentic: boolean;
  } | null;
  groundingSources?: Array<{
    title: string;
    url: string;
  }>;
}

/**
 * Fetch image and convert to base64 for Gemini multimodal input
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = response.headers.get('content-type') || 'image/jpeg';

    return { data: base64, mimeType };
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

/**
 * Extract and parse JSON from Gemini's response, handling various output formats
 */
function parseJsonResponse(text: string): AnalysisResult {
  // 1. Try direct parse
  try {
    return JSON.parse(text);
  } catch { /* continue */ }

  // 2. Try extracting from markdown code fences
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeFenceMatch) {
    try {
      return JSON.parse(codeFenceMatch[1]);
    } catch { /* continue */ }
  }

  // 3. Try finding a JSON object in the text (first { to last })
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  // 4. Nothing worked — log what we got and throw
  console.error('Raw Gemini response (first 500 chars):', text.slice(0, 500));
  throw new Error('Failed to parse Gemini response as JSON');
}

/**
 * Analyze tweet with Gemini AI using Google Search grounding
 */
export async function analyzeTweet(
  tweetText: string,
  authorInfo: string,
  imageUrls: string[]
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const genAI = new GoogleGenAI({ apiKey });

  // Build the prompt
  const prompt = buildAnalysisPrompt(tweetText, authorInfo, imageUrls.length > 0);

  // Prepare content parts
  const parts: any[] = [{ text: prompt }];

  // Add images if present
  if (imageUrls.length > 0) {
    for (const imageUrl of imageUrls) {
      const imageData = await fetchImageAsBase64(imageUrl);
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.data,
            mimeType: imageData.mimeType,
          },
        });
      }
    }
  }

  try {
    // Generate content with Google Search grounding enabled
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        temperature: 0.2, // Lower temperature for more consistent analysis
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });

    const response = result;
    const text = response.text;

    if (!text) {
      throw new Error('No response text from Gemini API');
    }

    // Parse JSON response — Gemini can return JSON wrapped in various ways
    const analysisData = parseJsonResponse(text);

    // Extract grounding sources if available
    const groundingSources: Array<{ title: string; url: string }> = [];

    // Check for grounding metadata in the response
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const chunks = response.candidates[0].groundingMetadata.groundingChunks;
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          groundingSources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
          });
        }
      }
    }

    return {
      ...analysisData,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to analyze tweet with Gemini API');
  }
}
