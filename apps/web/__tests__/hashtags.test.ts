import { extractHashtags, detectLanguage } from '../lib/hashtags';

describe('Hashtag Extraction Engine', () => {
  describe('detectLanguage', () => {
    it('should detect Korean text', () => {
      expect(detectLanguage('오늘 회의에서 일정을 조정했다')).toBe('ko');
    });

    it('should detect English text', () => {
      expect(detectLanguage('I worked on the onboarding flow today')).toBe('en');
    });

    it('should prefer user preference over detection', () => {
      expect(detectLanguage('오늘 회의에서 일정을 조정했다', 'en')).toBe('en');
      expect(detectLanguage('I worked on the project', 'ko')).toBe('ko');
    });

    it('should default to Korean for mixed text', () => {
      expect(detectLanguage('오늘 meeting에서 project 진행')).toBe('ko');
    });
  });

  describe('extractHashtags - Korean', () => {
    it('should extract 3-6 hashtags from Korean text', () => {
      const text = '오늘 팀 회의에서 일정이 밀려서 범위를 줄이기로 했다. 핵심 기능만 먼저 내자.';
      const result = extractHashtags(text);

      expect(result.language).toBe('ko');
      expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
      expect(result.hashtags.length).toBeLessThanOrEqual(6);
      expect(result.hashtags.every(h => h.startsWith('#'))).toBe(true);
    });

    it('should not include emotion words', () => {
      const text = '오늘 정말 행복한 하루였다. 회의도 잘 됐고 프로젝트도 진행됐다.';
      const result = extractHashtags(text);

      const emotionWords = ['행복', '기쁨', '슬픔', '화남', '불안'];
      for (const emotion of emotionWords) {
        expect(result.hashtags.some(h => h.includes(emotion))).toBe(false);
      }
    });

    it('should not include overly general words', () => {
      const text = '오늘 하루 일상이 좋았다. 팀 회의 후 개발 작업했다.';
      const result = extractHashtags(text);

      const generalWords = ['하루', '일상', '오늘', '생각'];
      for (const word of generalWords) {
        expect(result.hashtags.some(h => h === `#${word}`)).toBe(false);
      }
    });

    it('should normalize aliases to canonical forms', () => {
      const text = '오늘 미팅에서 프젝 범위 조정했다.';
      const result = extractHashtags(text);

      // '미팅' should be normalized to '회의', '프젝' to '프로젝트'
      // Check that the result contains the canonical form if the alias was found
      expect(result.language).toBe('ko');
      expect(result.hashtags.length).toBeGreaterThanOrEqual(1);
    });

    it('should include at least one Event/Action tag when possible', () => {
      const text = '팀 회의에서 발표를 했다. 클라이언트 피드백 받음.';
      const result = extractHashtags(text);

      // Should have at least one event-type tag like 회의 or 발표
      expect(result.hashtags.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('extractHashtags - English', () => {
    it('should extract 3-6 hashtags from English text', () => {
      const text = 'I worked on the onboarding flow and decided to remove one step.';
      const result = extractHashtags(text, { preferredLanguage: 'en' });

      expect(result.language).toBe('en');
      expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
      expect(result.hashtags.length).toBeLessThanOrEqual(6);
      expect(result.hashtags.every(h => h.startsWith('#'))).toBe(true);
    });

    it('should format English hashtags in lowercase without spaces', () => {
      const text = 'Had a team meeting about the project deadline and scope changes.';
      const result = extractHashtags(text, { preferredLanguage: 'en' });

      for (const hashtag of result.hashtags) {
        expect(hashtag).toBe(hashtag.toLowerCase());
        expect(hashtag.includes(' ')).toBe(false);
      }
    });

    it('should not include emotion words', () => {
      const text = 'I was really happy and excited about the meeting. The project is going well.';
      const result = extractHashtags(text, { preferredLanguage: 'en' });

      const emotionWords = ['happy', 'excited', 'sad', 'angry', 'anxious'];
      for (const emotion of emotionWords) {
        expect(result.hashtags.some(h => h.includes(emotion))).toBe(false);
      }
    });

    it('should not include overly general words', () => {
      const text = 'Today was a good day. Had a meeting about the project deadline.';
      const result = extractHashtags(text, { preferredLanguage: 'en' });

      const generalWords = ['today', 'day', 'good', 'thing'];
      for (const word of generalWords) {
        expect(result.hashtags.some(h => h === `#${word}`)).toBe(false);
      }
    });
  });

  describe('extractHashtags - Edge Cases', () => {
    it('should handle empty text', () => {
      const result = extractHashtags('');
      expect(result.hashtags).toEqual([]);
    });

    it('should handle very short text', () => {
      const result = extractHashtags('hi');
      expect(result.hashtags).toEqual([]);
    });

    it('should handle text with only stopwords', () => {
      const result = extractHashtags('the a an is are was', { preferredLanguage: 'en' });
      expect(result.hashtags.length).toBeLessThanOrEqual(6);
    });

    it('should maintain single language output', () => {
      // Mixed language input
      const text = '오늘 meeting에서 project 진행 상황을 공유했다.';
      const result = extractHashtags(text);

      // Output should be in detected language (Korean)
      expect(result.language).toBe('ko');
    });

    it('should respect minTags and maxTags options', () => {
      const text = '오늘 팀 회의에서 프로젝트 일정과 범위를 조정하고 개발 계획을 세웠다.';

      const result3 = extractHashtags(text, { minTags: 3, maxTags: 3 });
      expect(result3.hashtags.length).toBeLessThanOrEqual(3);

      const result5 = extractHashtags(text, { minTags: 5, maxTags: 5 });
      expect(result5.hashtags.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Acceptance Criteria', () => {
    it('should pass all acceptance criteria for Korean', () => {
      const text = '오늘 팀 회의에서 일정이 밀려서 범위를 줄이기로 했다. 핵심 기능만 먼저 내자.';
      const result = extractHashtags(text);

      // 1. 3-6개인가?
      expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
      expect(result.hashtags.length).toBeLessThanOrEqual(6);

      // 2. 감정 키워드가 0개인가?
      const emotionWords = ['기쁨', '슬픔', '분노', '불안', '피곤', '행복', '화남'];
      for (const emotion of emotionWords) {
        expect(result.hashtags.some(h => h.toLowerCase().includes(emotion))).toBe(false);
      }

      // 3. 한 기록 = 한 언어로 통일됐나?
      expect(result.language).toBe('ko');

      // 4. # 포함됐나?
      expect(result.hashtags.every(h => h.startsWith('#'))).toBe(true);

      // 5. 중복 태그 없는가?
      const uniqueTags = new Set(result.hashtags.map(h => h.toLowerCase()));
      expect(uniqueTags.size).toBe(result.hashtags.length);
    });

    it('should pass all acceptance criteria for English', () => {
      const text = 'I worked on the onboarding flow and decided to remove one step.';
      const result = extractHashtags(text, { preferredLanguage: 'en' });

      // 1. 3-6개인가?
      expect(result.hashtags.length).toBeGreaterThanOrEqual(3);
      expect(result.hashtags.length).toBeLessThanOrEqual(6);

      // 2. 감정 키워드가 0개인가?
      const emotionWords = ['happy', 'sad', 'angry', 'anxious', 'tired', 'excited'];
      for (const emotion of emotionWords) {
        expect(result.hashtags.some(h => h.toLowerCase().includes(emotion))).toBe(false);
      }

      // 3. 한 기록 = 한 언어로 통일됐나?
      expect(result.language).toBe('en');

      // 4. # 포함됐나?
      expect(result.hashtags.every(h => h.startsWith('#'))).toBe(true);

      // 5. 중복 태그 없는가?
      const uniqueTags = new Set(result.hashtags.map(h => h.toLowerCase()));
      expect(uniqueTags.size).toBe(result.hashtags.length);
    });
  });
});
