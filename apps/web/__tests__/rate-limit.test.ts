import { checkRateLimit } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    // Clear any previous state by using unique identifiers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-1', { maxRequests: 5, windowMs: 1000 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track request count', () => {
      const id = 'test-2';
      const config = { maxRequests: 3, windowMs: 10000 };

      checkRateLimit(id, config);
      checkRateLimit(id, config);
      const result = checkRateLimit(id, config);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should block when limit exceeded', () => {
      const id = 'test-3';
      const config = { maxRequests: 2, windowMs: 10000 };

      checkRateLimit(id, config);
      checkRateLimit(id, config);
      const result = checkRateLimit(id, config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const id = 'test-4';
      const config = { maxRequests: 2, windowMs: 1000 };

      checkRateLimit(id, config);
      checkRateLimit(id, config);

      // Advance time past the window
      jest.advanceTimersByTime(1500);

      const result = checkRateLimit(id, config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track different identifiers separately', () => {
      const config = { maxRequests: 2, windowMs: 10000 };

      checkRateLimit('user-a', config);
      checkRateLimit('user-a', config);
      checkRateLimit('user-b', config);

      const resultA = checkRateLimit('user-a', config);
      const resultB = checkRateLimit('user-b', config);

      expect(resultA.allowed).toBe(false);
      expect(resultB.allowed).toBe(true);
    });
  });
});
