import {
  EMOTION_MAP,
  EMOTIONS,
  MOOD_VALUES,
  isValidEmotion,
  normalizeEmotion,
  sanitizeTranscript,
  validateTranscript,
} from '@/lib/emotion';

describe('emotion module', () => {
  describe('EMOTION_MAP', () => {
    it('should have 10 emotions', () => {
      expect(Object.keys(EMOTION_MAP).length).toBe(10);
    });

    it('should have emoji for each emotion', () => {
      Object.values(EMOTION_MAP).forEach((emotion) => {
        expect(emotion.emoji).toBeTruthy();
        expect(typeof emotion.emoji).toBe('string');
      });
    });

    it('should have label for each emotion', () => {
      Object.values(EMOTION_MAP).forEach((emotion) => {
        expect(emotion.label).toBeTruthy();
        expect(typeof emotion.label).toBe('string');
      });
    });

    it('should have labelKo for each emotion', () => {
      Object.values(EMOTION_MAP).forEach((emotion) => {
        expect(emotion.labelKo).toBeTruthy();
        expect(typeof emotion.labelKo).toBe('string');
      });
    });

    it('should have color for each emotion', () => {
      Object.values(EMOTION_MAP).forEach((emotion) => {
        expect(emotion.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('EMOTIONS array', () => {
    it('should contain all emotion keys', () => {
      expect(EMOTIONS).toEqual(expect.arrayContaining([
        'happy', 'excited', 'proud', 'peaceful',
        'neutral',
        'sad', 'angry', 'anxious', 'exhausted',
        'surprised'
      ]));
    });
  });

  describe('MOOD_VALUES', () => {
    it('should have values for all emotions', () => {
      EMOTIONS.forEach((emotion) => {
        expect(MOOD_VALUES[emotion]).toBeDefined();
        expect(typeof MOOD_VALUES[emotion]).toBe('number');
      });
    });

    it('should have values between 1 and 10', () => {
      Object.values(MOOD_VALUES).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('isValidEmotion', () => {
    it('should return true for valid emotions', () => {
      expect(isValidEmotion('happy')).toBe(true);
      expect(isValidEmotion('sad')).toBe(true);
      expect(isValidEmotion('neutral')).toBe(true);
    });

    it('should return false for invalid emotions', () => {
      expect(isValidEmotion('invalid')).toBe(false);
      expect(isValidEmotion('')).toBe(false);
      expect(isValidEmotion('HAPPY')).toBe(false);
    });
  });

  describe('normalizeEmotion', () => {
    it('should return English key for English input', () => {
      expect(normalizeEmotion('happy')).toBe('happy');
      expect(normalizeEmotion('anxious')).toBe('anxious');
    });

    it('should normalize Korean to English', () => {
      expect(normalizeEmotion('행복')).toBe('happy');
      expect(normalizeEmotion('슬픔')).toBe('sad');
      expect(normalizeEmotion('불안')).toBe('anxious');
      expect(normalizeEmotion('피곤')).toBe('exhausted');
    });

    it('should handle partial Korean matches', () => {
      expect(normalizeEmotion('기쁨이 넘침')).toBe('happy');
    });

    it('should return neutral for unknown emotion', () => {
      expect(normalizeEmotion('알수없음')).toBe('neutral');
      expect(normalizeEmotion('')).toBe('neutral');
    });
  });

  describe('sanitizeTranscript', () => {
    it('should trim whitespace', () => {
      expect(sanitizeTranscript('  hello world  ')).toBe('hello world');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeTranscript('<script>alert("xss")</script>hello')).toBe('alert("xss")hello');
    });

    it('should remove javascript: URLs', () => {
      expect(sanitizeTranscript('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should handle non-string input', () => {
      expect(sanitizeTranscript(null as unknown as string)).toBe('');
      expect(sanitizeTranscript(undefined as unknown as string)).toBe('');
    });

    it('should limit length to 10000 characters', () => {
      const longText = 'a'.repeat(15000);
      expect(sanitizeTranscript(longText).length).toBe(10000);
    });
  });

  describe('validateTranscript', () => {
    it('should reject empty transcript', () => {
      expect(validateTranscript('')).toEqual({
        valid: false,
        error: '텍스트가 필요합니다.',
      });
    });

    it('should reject null transcript', () => {
      expect(validateTranscript(null)).toEqual({
        valid: false,
        error: '텍스트가 필요합니다.',
      });
    });

    it('should reject short transcript', () => {
      expect(validateTranscript('abc')).toEqual({
        valid: false,
        error: '텍스트가 너무 짧습니다. (최소 5자)',
      });
    });

    it('should reject long transcript', () => {
      const longText = 'a'.repeat(10001);
      expect(validateTranscript(longText)).toEqual({
        valid: false,
        error: '텍스트가 너무 깁니다. (최대 10000자)',
      });
    });

    it('should accept valid transcript', () => {
      expect(validateTranscript('오늘 하루도 수고했다')).toEqual({
        valid: true,
      });
    });
  });
});
