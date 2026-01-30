import { EMOTION_MAP, EMOTIONS } from '@/constants/emotions';

describe('emotions', () => {
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

    it('should have color for each emotion', () => {
      Object.values(EMOTION_MAP).forEach((emotion) => {
        expect(emotion.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('EMOTIONS array', () => {
    it('should contain all emotion keys', () => {
      expect(EMOTIONS).toEqual(expect.arrayContaining([
        'happy', 'grateful', 'excited', 'peaceful',
        'neutral', 'thoughtful',
        'sad', 'angry', 'anxious', 'exhausted'
      ]));
    });
  });
});
