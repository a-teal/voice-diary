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
    const content = fs.readFileSync(promptPath, 'utf-8');
    // Remove markdown title (first line starting with #)
    _cachedPrompt = content.replace(/^#.*\n\n?/, '').trim();
    return _cachedPrompt;
  } catch (error) {
    console.error('Failed to load prompt file:', error);
    // Fallback to inline prompt
    return FALLBACK_PROMPT;
  }
}

// Fallback prompt in case file loading fails
const FALLBACK_PROMPT = `You are an emotion classifier for voice diary transcripts.

Return **ONLY valid JSON**.
No extra text. No markdown. No code fences.

## Output JSON schema (STRICT)
{
  "emotionKey": "happy|grateful|excited|peaceful|neutral|thoughtful|sad|angry|anxious|exhausted",
  "keywords": ["string", "string"],
  "reason": "string"
}

## Rules

### 1) emotionKey (language-invariant)
- emotionKey MUST be exactly one of:
  happy, grateful, excited, peaceful, neutral, thoughtful, sad, angry, anxious, exhausted

### 2) keywords (locale-aware)
- keywords MUST be 2~5 items, unique, each max 14 characters.
- If locale="en": keywords in English.
- If locale="ko": keywords in Korean.

### 3) reason (locale-aware)
- reason MUST be exactly one concise sentence.

### 4) "neutral" is NOT a default
Choose "neutral" ONLY if ALL are true:
- No emotion/evaluation words.
- No interjections/onomatopoeia/sigh markers.
- No causality/reason markers.
- No decision/conflict/uncertainty.
- Mostly factual listing only.

If ANY of the above is violated → DO NOT choose "neutral".

### 5) Mandatory preference rules
- If decision/conflict/uncertainty exists → prefer "thoughtful".
- If fatigue/low condition exists → prefer "exhausted".

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;

// Legacy export for backwards compatibility
export const DIARY_ANALYSIS_PROMPT = getDiaryAnalysisPrompt();
