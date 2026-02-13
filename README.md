<div align="center">
  <img src="public/logo.png" alt="Bullshit Detector" width="326" height="338" />

  # Bullshit Detector

  AI-powered fact-checker for Twitter/X posts. Paste a tweet URL, get an instant truthfulness score with detailed analysis of claims, bias, manipulation tactics, and image authenticity.

  [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat&logo=vercel)](https://bullshit-detector-psi.vercel.app)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
  [![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

  **[Try it live](https://bullshit-detector-psi.vercel.app)**
</div>

## How It Works

1. **Paste a tweet URL** — any `twitter.com` or `x.com` post link
2. **AI analyzes the post** — Gemini 2.5 Flash with Google Search grounding verifies claims against live web data
3. **Get a score from 0-100%** — with a detailed breakdown of why

### What It Detects

- **Factual accuracy** — individual claims verified against real sources
- **Logical fallacies** — ad hominem, straw man, false dichotomy, appeal to emotion, etc.
- **Manipulation tactics** — fear-mongering, outrage bait, false urgency, tribal signaling
- **Bias indicators** — loaded language, cherry-picked data, omitted context
- **Image analysis** — AI-generated images, manipulated photos, misleading visual context

### Score Ranges

| Score | Verdict | Meaning |
|-------|---------|---------|
| 90-100% | Verified Facts | Claims are substantiated by multiple sources |
| 70-89% | Mostly True | Largely accurate with minor issues |
| 50-69% | Mixed/Misleading | Mix of true and false, or misleading framing |
| 25-49% | Mostly BS | Predominantly misleading, biased, or manipulative |
| 0-24% | Complete BS | Outright lies, fabrications, or pure manipulation |

## Examples

### Factual post (scores high)

```
URL: https://x.com/OpenAI/status/2022009583653576787
Score: 95% — Verified Facts
Reasons: "Factually Accurate", "Source Credibility", "Specific Details Corroborated"
```

A product announcement from an official account about a real rollout — straightforward and verifiable.

### Political spin (scores mid-range)

```
URL: https://x.com/WhiteHouse/status/2016290018248008140
Score: ~50-65% — Mixed/Misleading
Reasons: "Loaded Language", "Cherry-Picked Data", "Implicit Success Bias"
```

Contains some real economic data but mixed with subjective claims ("RESPECTED again") and heavy political framing.

### Confirmed manipulation (scores low)

```
URL: https://x.com/ddale8/status/2014414198583824770
Score: ~15-25% — Mostly BS (analyzing the underlying claim)
Reasons: "Manipulated Image", "Institutional Misinformation", "Deliberately Misleading"
```

Reports on a confirmed AI-altered photo presented as real by an official account.

## Local Development

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key

### Setup

```bash
# Clone the repo
git clone https://github.com/aleksblago/bullshit-detector.git
cd bullshit-detector

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your Gemini API key
```

### Environment Variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste a tweet URL.

### Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `GEMINI_API_KEY` as an environment variable in project settings
4. Deploy

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **AI:** Google Gemini 2.5 Flash via `@google/genai`
- **Fact-checking:** Gemini's Google Search grounding for real-time claim verification
- **Styling:** Tailwind CSS (dark mode)
- **Tweet data:** Twitter Syndication API with FxTwitter fallback
- **Deployment:** Vercel

## Architecture

```
app/
  page.tsx              → Main UI (URL input + results display)
  api/analyze/route.ts  → Server-side API (fetch tweet → Gemini analysis)
components/
  url-input.tsx         → URL input with validation
  score-gauge.tsx       → SVG circular score display
  analysis-result.tsx   → Full results layout
  reason-chip.tsx       → Issue/indicator tag
lib/
  validation.ts         → URL validation, input sanitization
  twitter.ts            → Tweet fetching (syndication + fallback)
  gemini.ts             → Gemini API integration
  prompts.ts            → Analysis prompt with injection defense
```

## Security

- **API key protection** — Gemini key stays server-side in Next.js API routes, never sent to the browser
- **URL validation** — strict regex accepts only `twitter.com` and `x.com` tweet URLs
- **Prompt injection defense** — tweet content is wrapped in delimiters with explicit instructions to treat it as data, not commands
- **Input sanitization** — control characters stripped, max length enforced
- **Rate limiting** — 10 requests per minute per IP
