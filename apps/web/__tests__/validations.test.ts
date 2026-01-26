import {
  isValidEmotion,
  sanitizeTranscript,
  validateTranscript,
} from '@/lib/validations';

describe('validations', () => {
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
