// Hashtag extraction types

export type SupportedLanguage = 'ko' | 'en';

export interface HashtagDictionary {
  // Canonical form -> list of aliases that should map to it
  canonical: Record<string, string[]>;
  // Words to always exclude
  blocklist: string[];
  // Emotion words to exclude (hard rule)
  emotionBlocklist: string[];
  // Overly general words to exclude
  generalBlocklist: string[];
}

export interface HashtagCandidate {
  text: string;
  normalizedText: string;
  score: number;
  type: 'event' | 'topic' | 'outcome' | 'unknown';
  position: number; // 0-1, where in the text it appears
  frequency: number;
}

export interface ExtractHashtagsOptions {
  preferredLanguage?: SupportedLanguage;
  minTags?: number;
  maxTags?: number;
}

export interface ExtractHashtagsResult {
  hashtags: string[];
  language: SupportedLanguage;
}
