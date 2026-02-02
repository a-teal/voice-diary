// Hashtag Extraction Engine for Voice Diary
// Extracts 3-6 topic/summary hashtags (no emotion tags)

import {
  SupportedLanguage,
  HashtagDictionary,
  HashtagCandidate,
  ExtractHashtagsOptions,
  ExtractHashtagsResult,
} from './types';
import { dictionaryKo, dictionaryEn } from './dictionaries';

// ============================================
// Language Detection
// ============================================

const KOREAN_REGEX = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g;
const ENGLISH_REGEX = /[a-zA-Z]/g;

/**
 * Detect the language of the input text
 * Priority: preferredLanguage > dominant language in text
 */
export function detectLanguage(
  text: string,
  preferredLanguage?: SupportedLanguage
): SupportedLanguage {
  // If preferred language is set and valid, use it
  if (preferredLanguage && ['ko', 'en'].includes(preferredLanguage)) {
    return preferredLanguage;
  }

  // Count Korean and English characters
  const koreanMatches = text.match(KOREAN_REGEX) || [];
  const englishMatches = text.match(ENGLISH_REGEX) || [];

  const koreanCount = koreanMatches.length;
  const englishCount = englishMatches.length;

  // Determine dominant language (Korean takes precedence if close)
  if (koreanCount > 0 && koreanCount >= englishCount * 0.3) {
    return 'ko';
  }

  return englishCount > 0 ? 'en' : 'ko';
}

// ============================================
// Text Preprocessing
// ============================================

// Korean stopwords (particles, common endings)
const KO_STOPWORDS = new Set([
  '은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과',
  '의', '도', '만', '부터', '까지', '처럼', '같이', '보다', '라고', '라는',
  '다', '요', '습니다', '합니다', '입니다', '됩니다', '있다', '없다', '하다',
  '그', '저', '이것', '그것', '저것', '여기', '거기', '저기',
  '수', '것', '등', '및', '또는', '그리고', '하지만', '그러나', '때문',
]);

// English stopwords
const EN_STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
  'about', 'against', 'again', 'further', 'then', 'once', 'here', 'there',
  'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'any', 'if', 'because', 'until', 'while',
]);

function preprocessText(text: string, lang: SupportedLanguage): string {
  // Remove URLs
  let processed = text.replace(/https?:\/\/\S+/g, '');
  // Remove email addresses
  processed = processed.replace(/\S+@\S+\.\S+/g, '');
  // Remove numbers (but keep if attached to words)
  processed = processed.replace(/\b\d+\b/g, '');
  // Normalize whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  return processed;
}

// ============================================
// Candidate Generation
// ============================================

interface Token {
  text: string;
  position: number; // 0-1 relative position
}

function tokenizeKorean(text: string): Token[] {
  const tokens: Token[] = [];
  const textLength = text.length;

  // Simple Korean tokenization: split by spaces and punctuation
  // Extract noun-like segments (sequences of Korean characters)
  const segments = text.split(/[\s,.!?;:'"()\[\]{}]+/);

  let currentPos = 0;
  for (const segment of segments) {
    if (!segment) continue;

    const position = currentPos / textLength;

    // Remove common particles/endings from the end of words
    let word = segment;
    const particlesToRemove = ['은', '는', '이', '가', '을', '를', '에서', '에', '으로', '로', '와', '과', '의', '도'];
    for (const particle of particlesToRemove) {
      if (word.endsWith(particle) && word.length > particle.length + 1) {
        word = word.slice(0, -particle.length);
        break;
      }
    }

    // Only add if it contains Korean characters and is meaningful length
    if (KOREAN_REGEX.test(word) && word.length >= 2) {
      tokens.push({ text: word, position });
    }

    currentPos += segment.length + 1;
  }

  return tokens;
}

function tokenizeEnglish(text: string): Token[] {
  const tokens: Token[] = [];
  const textLength = text.length;
  const words = text.toLowerCase().split(/[\s,.!?;:'"()\[\]{}]+/);

  let currentPos = 0;
  for (const word of words) {
    if (!word) continue;

    const position = currentPos / textLength;

    // Skip stopwords and very short words
    if (!EN_STOPWORDS.has(word) && word.length >= 3) {
      tokens.push({ text: word, position });
    }

    currentPos += word.length + 1;
  }

  return tokens;
}

function generateNgrams(tokens: Token[], maxN: number = 3): Token[] {
  const ngrams: Token[] = [...tokens];

  for (let n = 2; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const ngramTokens = tokens.slice(i, i + n);
      const ngramText = ngramTokens.map(t => t.text).join('');
      const avgPosition = ngramTokens.reduce((sum, t) => sum + t.position, 0) / n;

      ngrams.push({
        text: ngramText,
        position: avgPosition,
      });
    }
  }

  return ngrams;
}

function generateCandidates(text: string, lang: SupportedLanguage): Token[] {
  const processed = preprocessText(text, lang);

  if (lang === 'ko') {
    const tokens = tokenizeKorean(processed);
    return generateNgrams(tokens, 2); // Max 2-gram for Korean
  } else {
    const tokens = tokenizeEnglish(processed);
    return generateNgrams(tokens, 3); // Max 3-gram for English
  }
}

// ============================================
// Scoring & Ranking
// ============================================

function calculateTermFrequency(tokens: Token[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    const key = token.text.toLowerCase();
    freq.set(key, (freq.get(key) || 0) + 1);
  }
  return freq;
}

function scoreCandidate(
  token: Token,
  frequency: number,
  totalTokens: number,
  lang: SupportedLanguage
): number {
  // Base TF score (normalized)
  const tfScore = Math.log(1 + frequency) / Math.log(1 + totalTokens);

  // Position score: beginning and end are more important
  const positionScore = token.position < 0.3 || token.position > 0.7 ? 1.2 : 1.0;

  // Length score: prefer medium-length terms
  const length = token.text.length;
  let lengthScore = 1.0;
  if (lang === 'ko') {
    lengthScore = length >= 2 && length <= 6 ? 1.2 : (length > 6 ? 0.8 : 0.6);
  } else {
    lengthScore = length >= 4 && length <= 12 ? 1.2 : (length > 12 ? 0.8 : 0.7);
  }

  // Specificity bonus for compound words
  const isCompound = lang === 'ko' ? length > 3 : token.text.includes(' ') || length > 8;
  const specificityScore = isCompound ? 1.3 : 1.0;

  return tfScore * positionScore * lengthScore * specificityScore;
}

function scoreCandidates(
  tokens: Token[],
  lang: SupportedLanguage
): HashtagCandidate[] {
  const freq = calculateTermFrequency(tokens);
  const totalTokens = tokens.length;

  // Deduplicate tokens first
  const uniqueTokens = new Map<string, Token>();
  for (const token of tokens) {
    const key = token.text.toLowerCase();
    if (!uniqueTokens.has(key) || token.position < uniqueTokens.get(key)!.position) {
      uniqueTokens.set(key, token);
    }
  }

  const candidates: HashtagCandidate[] = [];

  for (const [key, token] of uniqueTokens) {
    const frequency = freq.get(key) || 1;
    const score = scoreCandidate(token, frequency, totalTokens, lang);

    candidates.push({
      text: token.text,
      normalizedText: key,
      score,
      type: 'unknown', // Will be classified later
      position: token.position,
      frequency,
    });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

// ============================================
// Normalization & Filtering
// ============================================

function isBlocklisted(
  text: string,
  dict: HashtagDictionary
): boolean {
  const lower = text.toLowerCase();

  // Check direct blocklist
  if (dict.blocklist.some(b => lower.includes(b.toLowerCase()))) {
    return true;
  }

  // Check emotion blocklist
  if (dict.emotionBlocklist.some(e => lower === e.toLowerCase() || lower.includes(e.toLowerCase()))) {
    return true;
  }

  // Check general blocklist
  if (dict.generalBlocklist.some(g => lower === g.toLowerCase())) {
    return true;
  }

  return false;
}

function normalizeToCanonical(
  text: string,
  dict: HashtagDictionary
): string {
  const lower = text.toLowerCase();

  // Check if it matches any alias and return canonical
  for (const [canonical, aliases] of Object.entries(dict.canonical)) {
    if (lower === canonical.toLowerCase()) {
      return canonical;
    }
    for (const alias of aliases) {
      if (lower === alias.toLowerCase() || lower.includes(alias.toLowerCase())) {
        return canonical;
      }
    }
  }

  return text;
}

function classifyTagType(
  text: string,
  dict: HashtagDictionary
): 'event' | 'topic' | 'outcome' | 'unknown' {
  const lower = text.toLowerCase();

  // Event/Action indicators
  const eventIndicators = ['meeting', 'workout', 'study', 'travel', 'meal', 'call', 'interview', 'presentation',
    '회의', '운동', '공부', '여행', '식사', '출근', '발표', '면접', '개발', '디자인'];

  // Topic/Entity indicators
  const topicIndicators = ['family', 'friend', 'colleague', 'manager', 'client', 'health', 'work', 'project', 'plan',
    '가족', '친구', '동료', '상사', '고객', '건강', '업무', '프로젝트', '계획'];

  // Outcome/Decision indicators
  const outcomeIndicators = ['decision', 'change', 'completion', 'start', 'problem', 'solution', 'delay', 'success', 'failure', 'adjustment',
    '결정', '변경', '완료', '시작', '문제', '해결', '연기', '성공', '실패', '조정'];

  for (const indicator of eventIndicators) {
    if (lower.includes(indicator.toLowerCase())) return 'event';
  }

  for (const indicator of outcomeIndicators) {
    if (lower.includes(indicator.toLowerCase())) return 'outcome';
  }

  for (const indicator of topicIndicators) {
    if (lower.includes(indicator.toLowerCase())) return 'topic';
  }

  return 'unknown';
}

function normalizeCandidates(
  candidates: HashtagCandidate[],
  dict: HashtagDictionary
): HashtagCandidate[] {
  const normalized: HashtagCandidate[] = [];
  const seenCanonical = new Set<string>();

  for (const candidate of candidates) {
    // Skip if blocklisted
    if (isBlocklisted(candidate.text, dict)) {
      continue;
    }

    // Normalize to canonical form
    const canonical = normalizeToCanonical(candidate.text, dict);
    const canonicalLower = canonical.toLowerCase();

    // Skip duplicates (same canonical form)
    if (seenCanonical.has(canonicalLower)) {
      continue;
    }
    seenCanonical.add(canonicalLower);

    // Classify type
    const type = classifyTagType(canonical, dict);

    normalized.push({
      ...candidate,
      text: canonical,
      normalizedText: canonicalLower,
      type,
    });
  }

  return normalized;
}

// ============================================
// Final Selection
// ============================================

function selectFinalHashtags(
  candidates: HashtagCandidate[],
  minTags: number,
  maxTags: number
): string[] {
  // Ensure at least one Event/Action tag
  const eventTags = candidates.filter(c => c.type === 'event');
  const topicTags = candidates.filter(c => c.type === 'topic');
  const outcomeTags = candidates.filter(c => c.type === 'outcome');
  const unknownTags = candidates.filter(c => c.type === 'unknown');

  const selected: HashtagCandidate[] = [];

  // Add at least 1 event tag (required)
  if (eventTags.length > 0) {
    selected.push(eventTags[0]);
    if (eventTags.length > 1 && selected.length < maxTags) {
      selected.push(eventTags[1]);
    }
  }

  // Add topic tags (1-2)
  for (const tag of topicTags) {
    if (selected.length >= maxTags) break;
    if (!selected.find(s => s.normalizedText === tag.normalizedText)) {
      selected.push(tag);
    }
  }

  // Add outcome tags (0-2)
  for (const tag of outcomeTags) {
    if (selected.length >= maxTags) break;
    if (!selected.find(s => s.normalizedText === tag.normalizedText)) {
      selected.push(tag);
    }
  }

  // Fill remaining with highest scored unknown tags
  for (const tag of unknownTags) {
    if (selected.length >= maxTags) break;
    if (!selected.find(s => s.normalizedText === tag.normalizedText)) {
      selected.push(tag);
    }
  }

  // Fallback: if we still don't have enough tags, relax criteria
  if (selected.length < minTags) {
    for (const candidate of candidates) {
      if (selected.length >= minTags) break;
      if (!selected.find(s => s.normalizedText === candidate.normalizedText)) {
        selected.push(candidate);
      }
    }
  }

  // If still no event tag and we have candidates, use the highest scored one
  if (!selected.find(s => s.type === 'event') && candidates.length > 0) {
    const fallbackEvent = candidates[0];
    if (!selected.find(s => s.normalizedText === fallbackEvent.normalizedText)) {
      selected.unshift({ ...fallbackEvent, type: 'event' });
      if (selected.length > maxTags) {
        selected.pop();
      }
    }
  }

  // Sort by importance (score)
  selected.sort((a, b) => b.score - a.score);

  return selected.slice(0, maxTags).map(c => c.text);
}

function formatHashtag(text: string, lang: SupportedLanguage): string {
  if (lang === 'ko') {
    // Korean: remove spaces, keep as-is
    return '#' + text.replace(/\s+/g, '');
  } else {
    // English: lowercase, remove spaces
    return '#' + text.toLowerCase().replace(/\s+/g, '');
  }
}

// ============================================
// Main Export Functions
// ============================================

/**
 * Extract hashtags from text
 * Returns 3-6 topic/summary hashtags (no emotion tags)
 */
export function extractHashtags(
  text: string,
  options: ExtractHashtagsOptions = {}
): ExtractHashtagsResult {
  const {
    preferredLanguage,
    minTags = 3,
    maxTags = 6,
  } = options;

  // Handle empty or very short text
  if (!text || text.trim().length < 5) {
    return {
      hashtags: [],
      language: preferredLanguage || 'en',
    };
  }

  // Step 1: Detect language
  const lang = detectLanguage(text, preferredLanguage);
  const dict = lang === 'ko' ? dictionaryKo : dictionaryEn;

  // Step 2: Generate candidates
  const candidates = generateCandidates(text, lang);

  // Step 3: Score and rank
  const scored = scoreCandidates(candidates, lang);

  // Step 4: Normalize (apply dictionary)
  const normalized = normalizeCandidates(scored, dict);

  // Step 5: Select final hashtags
  const selectedTexts = selectFinalHashtags(normalized, minTags, maxTags);

  // Step 6: Format as hashtags
  const hashtags = selectedTexts.map(t => formatHashtag(t, lang));

  return {
    hashtags,
    language: lang,
  };
}

// Re-export types
export type { SupportedLanguage, ExtractHashtagsOptions, ExtractHashtagsResult };
export { dictionaryKo, dictionaryEn };
