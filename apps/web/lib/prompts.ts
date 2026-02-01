import fs from 'fs';
import path from 'path';

// Load rule files from project root
const emotionRulesPath = path.join(process.cwd(), '..', '..', 'rules', 'emotion-rules.md');
const hashtagRulesPath = path.join(process.cwd(), '..', '..', 'rules', 'hashtag-rules.md');

// Alternative paths for different environments
const altEmotionPath = path.join(process.cwd(), 'rules', 'emotion-rules.md');
const altHashtagPath = path.join(process.cwd(), 'rules', 'hashtag-rules.md');

let _cachedPrompt: string | null = null;

function loadFile(primaryPath: string, altPath: string): string | null {
  try {
    if (fs.existsSync(primaryPath)) {
      return fs.readFileSync(primaryPath, 'utf-8');
    }
    if (fs.existsSync(altPath)) {
      return fs.readFileSync(altPath, 'utf-8');
    }
  } catch (error) {
    console.error('[Prompt] Failed to load file:', error);
  }
  return null;
}

export function getDiaryAnalysisPrompt(): string {
  if (_cachedPrompt) {
    return _cachedPrompt;
  }

  const emotionRules = loadFile(emotionRulesPath, altEmotionPath);
  const hashtagRules = loadFile(hashtagRulesPath, altHashtagPath);

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
  "keywords": ["string", "string", "string"],
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

2. **keywords**: Extract 3-5 CONCRETE nouns from the diary content.
   - Focus on: people, places, food, objects, activities
   - DO NOT base keywords on the detected emotion
   - Example: If someone is sad but talked about "coffee" and "meeting", use ["커피", "회의"] not ["슬픔", "우울"]

3. **reason**: One sentence summary in the locale language (Korean if locale=ko)

4. **neutral is almost NEVER correct**: If there's ANY emotional hint, interjection, or uncertainty → NOT neutral.

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;
}

// Fallback prompt in case file loading fails
const FALLBACK_PROMPT = `You are an expert diary analyst. Analyze emotion and extract keywords.

Return **ONLY valid JSON**. No extra text. No markdown. No code fences.

## Output JSON schema (STRICT)
{
  "emotionKey": "happy|excited|proud|peaceful|neutral|sad|angry|anxious|exhausted|surprised",
  "keywords": ["string", "string", "string"],
  "reason": "string"
}

## Rules

### emotionKey - MUST be one of:
happy, excited, proud, peaceful, neutral, sad, angry, anxious, exhausted, surprised

### keywords - MUST be 3~5 concrete nouns
- Extract actual things mentioned: people, places, food, objects, activities
- DO NOT extract emotional words as keywords
- Example: "카페에서 친구 만났다" → ["카페", "친구"] (NOT ["기쁨", "만남"])

### reason - One concise sentence summary

### CRITICAL: "neutral" is almost NEVER correct
- Any interjection (하…, 휴…, 에휴, 아 진짜) → NOT neutral
- Any uncertainty (해야, 어쩌지, 모르겠) → anxious, NOT neutral
- Any fatigue mention (피곤, 지침) → exhausted, NOT neutral
- Any complaint (짜증, 답답) → angry, NOT neutral

### Emotion preference hierarchy
1. Fatigue → exhausted
2. Uncertainty/worry → anxious
3. Frustration → angry
4. Sadness → sad
5. Unexpected → surprised
6. Achievement → proud
7. Anticipation → excited
8. Calm → peaceful
9. Joy → happy
10. Pure factual only → neutral (very rare)

## Now analyze this input
{ "transcript": "{transcript}", "locale": "{locale}" }`;

// Legacy export for backwards compatibility
export const DIARY_ANALYSIS_PROMPT = getDiaryAnalysisPrompt();
