import { NextRequest, NextResponse } from 'next/server';
import { DIARY_ANALYSIS_PROMPT } from '@/lib/prompts';
import { AnalysisResult } from '@/types';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { validateTranscript, sanitizeTranscript, normalizeEmotion } from '@/lib/validations';
import { EMOTION_MAP } from '@/constants/emotions';
import { detectLanguage, hashtagsToKeywords, extractHashtags } from '@/lib/hashtags';

// 감정 단어 블랙리스트 (키워드에서 제외)
const EMOTION_BLACKLIST = new Set([
  // 한국어
  '행복', '기쁨', '즐거움', '슬픔', '우울', '불안', '걱정', '화남',
  '짜증', '분노', '피곤', '지침', '설렘', '뿌듯', '감사', '평온',
  '무난', '놀람', '충격', '기대', '두려움', '긴장', '외로움',
  // 영어
  'happy', 'sad', 'angry', 'anxious', 'worried', 'tired', 'exhausted',
  'excited', 'nervous', 'stressed', 'frustrated', 'depressed', 'upset',
  'grateful', 'thankful', 'peaceful', 'calm', 'surprised', 'shocked',
  // 일반어 (과잉 일반적)
  '하루', '일상', '기록', '생각', '느낌', '오늘', '내일', '어제',
  'today', 'daily', 'life', 'thoughts', 'feeling', 'day',
]);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, {
      maxRequests: 20,    // 20 requests
      windowMs: 60 * 1000, // per minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
          },
        }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateTranscript(body.transcript);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const transcript = sanitizeTranscript(body.transcript);
    const locale = body.locale === 'en' ? 'en' : 'ko'; // default: ko

    console.log('[ANALYZE] === Request received ===');
    console.log('[ANALYZE] Transcript length:', transcript.length);
    console.log('[ANALYZE] Transcript:', transcript.slice(0, 100));

    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const prompt = DIARY_ANALYSIS_PROMPT
      .replace('{transcript}', transcript)
      .replace('{locale}', locale);

    console.log('[ANALYZE] Prompt length:', prompt.length);

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { error: 'AI 분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'AI 응답이 비어있습니다.' },
        { status: 500 }
      );
    }

    // Parse JSON response with robust fallback
    let result: AnalysisResult & { emoji?: string };

    // Safe JSON parsing function
    const safeParseJSON = (text: string): Record<string, unknown> | null => {
      try {
        // Try to extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[ANALYZE] JSON not found. Full content:', text);
          return null;
        }
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('[ANALYZE] JSON.parse failed:', e);
        return null;
      }
    };

    // Log raw response for debugging
    console.log('[ANALYZE] Claude raw response:', content.slice(0, 300));

    const parsed = safeParseJSON(content);

    if (parsed) {
      console.log('[ANALYZE] Parsed emotionKey:', parsed.emotionKey);
      console.log('[ANALYZE] Parsed keywords:', parsed.keywords);
      console.log('[ANALYZE] Parsed reason:', parsed.reason);

      // Map new response format to AnalysisResult
      // emotionKey → emotion, reason → summary
      let keywords: string[] = [];
      if (Array.isArray(parsed.keywords)) {
        keywords = (parsed.keywords as unknown[]).filter((k): k is string => typeof k === 'string' && k.trim() !== '');
      }

      const emotion = normalizeEmotion(String(parsed.emotionKey || parsed.emotion || ''));
      const emoji = EMOTION_MAP[emotion]?.emoji || '😐';

      console.log('[ANALYZE] Normalized emotion:', emotion);
      console.log('[ANALYZE] Mapped emoji:', emoji);

      result = {
        keywords,
        emotion,
        emoji,
        summary: String(parsed.reason || parsed.summary || '오늘의 기록'),
      };
    } else {
      // Fallback result - 앱이 튕기지 않도록 기본값 반환
      console.warn('[ANALYZE] Using fallback result due to parse failure');
      result = {
        keywords: [],
        emotion: 'neutral',
        emoji: '😐',
        summary: transcript.slice(0, 30) + '...',
      };
    }

    // Validate and sanitize result - ensure 2-6 keywords
    // Filter out emotion words and generic words
    const lang = detectLanguage(transcript);

    if (!Array.isArray(result.keywords) || result.keywords.length === 0) {
      // Use hashtag engine as fallback
      const extracted = extractHashtags(transcript, lang);
      result.keywords = hashtagsToKeywords(extracted);
    } else {
      // Filter and sanitize AI-provided keywords
      result.keywords = result.keywords
        .map(k => String(k).replace(/^#/, '').trim().slice(0, 20)) // Remove # prefix, limit length
        .filter(k => k.length > 0 && !EMOTION_BLACKLIST.has(k.toLowerCase()))
        .slice(0, 6); // Max 6 keywords

      // Ensure minimum 2 keywords
      if (result.keywords.length < 2) {
        const extracted = extractHashtags(transcript, lang);
        const extraKeywords = hashtagsToKeywords(extracted)
          .filter(k => !result.keywords.includes(k));
        while (result.keywords.length < 2 && extraKeywords.length > 0) {
          result.keywords.push(extraKeywords.shift()!);
        }
      }
    }
    console.log('[ANALYZE] Final keywords:', result.keywords);

    // Summary 검증
    if (!result.summary || typeof result.summary !== 'string') {
      result.summary = '오늘의 기록';
    } else {
      result.summary = result.summary.slice(0, 50);
    }

    console.log('[ANALYZE] === Final result ===');
    console.log('[ANALYZE] emotion:', result.emotion);
    console.log('[ANALYZE] emoji:', result.emoji);
    console.log('[ANALYZE] keywords:', result.keywords);
    console.log('[ANALYZE] summary:', result.summary);

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
