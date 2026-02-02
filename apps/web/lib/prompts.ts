import fs from 'fs';
import path from 'path';

// Multiple path candidates for different environments
const RULE_PATHS = [
  // Vercel/Next.js production: rules in same directory as app
  path.join(process.cwd(), 'rules'),
  // Local development: monorepo root
  path.join(process.cwd(), '..', '..', 'rules'),
  // Alternative: relative to __dirname (if available)
  path.join(__dirname, '..', 'rules'),
];

let _cachedPrompt: string | null = null;

function loadFile(filename: string): string | null {
  console.log('[Prompt] Loading file:', filename);
  console.log('[Prompt] process.cwd():', process.cwd());

  for (const basePath of RULE_PATHS) {
    const fullPath = path.join(basePath, filename);
    console.log('[Prompt] Trying path:', fullPath);

    try {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        console.log('[Prompt] ✓ Loaded from:', fullPath, '- length:', content.length);
        return content;
      }
    } catch (error) {
      console.error('[Prompt] Failed to read:', fullPath, error);
    }
  }

  console.error('[Prompt] ✗ File not found in any path:', filename);
  return null;
}

export function getDiaryAnalysisPrompt(): string {
  if (_cachedPrompt) {
    return _cachedPrompt;
  }

  const emotionRules = loadFile('emotion-rules.md');
  const hashtagRules = loadFile('hashtag-rules.md');

  if (emotionRules && hashtagRules) {
    console.log('[Prompt] Loaded emotion rules, length:', emotionRules.length);
    console.log('[Prompt] Loaded hashtag rules, length:', hashtagRules.length);

    // Combine rules into unified prompt
    _cachedPrompt = buildPromptFromRules(emotionRules, hashtagRules);
    console.log('[Prompt] Combined prompt built, length:', _cachedPrompt.length);
    return _cachedPrompt;
  }

  console.log('[Prompt] Using fallback prompt');
  _cachedPrompt = FALLBACK_PROMPT;
  return _cachedPrompt;
}

function buildPromptFromRules(emotionRules: string, hashtagRules: string): string {
  // Remove markdown titles from rule files
  const cleanEmotion = emotionRules.replace(/^#.*\n+/, '').trim();
  const cleanHashtag = hashtagRules.replace(/^#.*\n+/, '').trim();

  return `You are an expert diary analyst. You analyze voice diary transcripts for emotion and extract meaningful hashtag keywords.

Return **ONLY valid JSON**. No extra text. No markdown. No code fences.

## Output JSON schema (STRICT)
{
  "emotionKey": "happy|excited|proud|peaceful|neutral|sad|angry|anxious|exhausted|surprised",
  "keywords": ["string", "string", "string", "string"],
  "reason": "string"
}

---

## PART 1: Emotion Analysis

${cleanEmotion}

---

## PART 2: Hashtag/Keyword Extraction

${cleanHashtag}

---

## CRITICAL REMINDERS

1. **emotionKey**: MUST be exactly one of the 10 English keys. Never output Korean or emoji.
   - Priority: exhausted > anxious > angry > sad > surprised > proud > excited > peaceful > happy > neutral
   - neutral은 거의 사용하지 않음 (순수한 사실 나열만 있을 때만)

2. **keywords**: Extract 3-6 CONCRETE nouns from the diary content.
   - NO # symbol (just the words)
   - Focus on: Event/Action(필수), Topic/Entity, Outcome/Decision
   - NEVER include emotion words (행복, 슬픔, 불안, happy, sad, etc.)
   - NEVER include generic words (하루, 일상, 기록, today, daily, life)
   - Example: "오늘 강남역에서 친구랑 떡볶이 먹었다" → ["강남역", "친구", "떡볶이"]
   - NOT: ["기쁨", "만남", "일상"]

3. **reason**: One sentence summary in the locale language (Korean if locale=ko)

4. **Language consistency**: All keywords must be in the same language as the transcript.

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;
}

// Fallback prompt in case file loading fails
const FALLBACK_PROMPT = `You are an expert diary analyst. Analyze emotion and extract keywords.

Return **ONLY valid JSON**. No extra text. No markdown. No code fences.

## Output JSON schema (STRICT)
{
  "emotionKey": "happy|excited|proud|peaceful|neutral|sad|angry|anxious|exhausted|surprised",
  "keywords": ["string", "string", "string", "string"],
  "reason": "string"
}

## Rules

### emotionKey - MUST be one of (priority order):
exhausted > anxious > angry > sad > surprised > proud > excited > peaceful > happy > neutral
- neutral은 거의 사용하지 않음 (순수한 사실 나열만 있을 때만)

### keywords - MUST be 3-6 concrete nouns
- NO # symbol, NO emotion words, NO generic words
- Focus on: Event/Action(필수 1개 이상), Topic/Entity, Outcome/Decision
- Example: "카페에서 친구 만났다" → ["카페", "친구"] (NOT ["기쁨", "만남"])
- NEVER: 하루, 일상, 기록, 행복, 슬픔, 불안, today, daily, life

### reason - One concise sentence summary

### CRITICAL: "neutral" is almost NEVER correct
- Any interjection (하…, 휴…, 에휴, 아 진짜) → NOT neutral
- Any uncertainty (해야, 어쩌지, 모르겠) → anxious, NOT neutral
- Any fatigue mention (피곤, 지침) → exhausted, NOT neutral
- Any complaint (짜증, 답답) → angry, NOT neutral

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;

// Legacy export for backwards compatibility
export const DIARY_ANALYSIS_PROMPT = getDiaryAnalysisPrompt();
