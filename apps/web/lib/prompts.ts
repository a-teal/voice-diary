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
  "emotionKey": "happy|excited|proud|peaceful|neutral|sad|angry|anxious|exhausted|surprised",
  "keywords": ["string", "string", "string"],
  "reason": "string"
}

## Rules

### 1) emotionKey - MUST be one of:
happy, excited, proud, peaceful, neutral, sad, angry, anxious, exhausted, surprised

### 2) keywords - MUST be 3~5 items
Extract meaningful nouns/topics. Korean for locale=ko.

### 3) reason - One concise sentence summary

### 4) CRITICAL: "neutral" is almost NEVER correct
DO NOT choose "neutral" unless text is purely factual with ZERO emotional hints.
- Any interjection (하…, 휴…, 에휴, 아 진짜) → NOT neutral
- Any uncertainty (해야, 어쩌지, 모르겠) → anxious, NOT neutral
- Any fatigue mention (피곤, 지침) → exhausted, NOT neutral
- Any complaint (짜증, 답답) → angry, NOT neutral

### 5) Preference hierarchy
1. Fatigue → exhausted
2. Uncertainty/worry → anxious
3. Frustration → angry
4. Sadness → sad
5. Unexpected → surprised
6. Achievement → proud
7. Anticipation → excited
8. Calm → peaceful
9. Joy → happy

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;

// Legacy export for backwards compatibility
export const DIARY_ANALYSIS_PROMPT = getDiaryAnalysisPrompt();
