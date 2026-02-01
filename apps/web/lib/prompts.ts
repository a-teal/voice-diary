import fs from 'fs';
import path from 'path';

// Load prompt from markdown file
const promptPath = path.join(process.cwd(), 'prompts', 'emotion-analysis.md');

let _cachedPrompt: string | null = null;

export function getDiaryAnalysisPrompt(): string {
  if (_cachedPrompt) {
    return _cachedPrompt;
  }

  try {
    console.log('[Prompt] Loading from:', promptPath);
    const content = fs.readFileSync(promptPath, 'utf-8');
    // Remove markdown title (first line starting with #)
    _cachedPrompt = content.replace(/^#.*\n\n?/, '').trim();
    console.log('[Prompt] Loaded successfully, length:', _cachedPrompt.length);
    return _cachedPrompt;
  } catch (error) {
    console.error('[Prompt] Failed to load file:', error);
    console.log('[Prompt] Using fallback prompt');
    // Fallback to inline prompt
    return FALLBACK_PROMPT;
  }
}

// Fallback prompt in case file loading fails
const FALLBACK_PROMPT = `You are an expert diary emotion analyst. Detect the TRUE underlying emotion.

Return **ONLY valid JSON**. No extra text. No markdown. No code fences.

## Output JSON schema (STRICT)
{
  "emotionKey": "happy|grateful|excited|peaceful|neutral|thoughtful|sad|angry|anxious|exhausted",
  "keywords": ["string", "string", "string"],
  "reason": "string"
}

## Rules

### 1) emotionKey - MUST be one of:
happy, grateful, excited, peaceful, neutral, thoughtful, sad, angry, anxious, exhausted

### 2) keywords - MUST be 3~5 items
Extract meaningful nouns/topics. Korean for locale=ko.

### 3) reason - One concise sentence summary

### 4) CRITICAL: "neutral" is almost NEVER correct
DO NOT choose "neutral" unless text is purely factual with ZERO emotional hints.
- Any interjection (하…, 휴…, 에휴, 아 진짜) → NOT neutral
- Any causality marker (때문에, 그래서) → NOT neutral
- Any uncertainty (해야, 어쩌지, 모르겠) → thoughtful, NOT neutral
- Any fatigue mention (피곤, 지침) → exhausted, NOT neutral
- Any complaint (짜증, 답답) → angry, NOT neutral

### 5) Preference hierarchy
1. Fatigue → exhausted
2. Uncertainty → thoughtful
3. Frustration → angry
4. Worry → anxious
5. Sadness → sad
6. Achievement → grateful/excited
7. Calm → peaceful
8. Joy → happy

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;

// Legacy export for backwards compatibility
export const DIARY_ANALYSIS_PROMPT = getDiaryAnalysisPrompt();
