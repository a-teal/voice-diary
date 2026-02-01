import { NextRequest, NextResponse } from 'next/server';
import { DIARY_ANALYSIS_PROMPT } from '@/lib/prompts';
import { AnalysisResult } from '@/types';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { validateTranscript, sanitizeTranscript, normalizeEmotion } from '@/lib/validations';
import { EMOTION_MAP } from '@/constants/emotions';

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

    // Parse JSON response
    let result: AnalysisResult & { emoji?: string };
    try {
      // Log raw response for debugging (first 300 chars)
      console.log('[ANALYZE] Claude raw response:', content.slice(0, 300));

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('[ANALYZE] JSON not found. Full content:', content);
        throw new Error('JSON not found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[ANALYZE] Parsed emotionKey:', parsed.emotionKey);
      console.log('[ANALYZE] Parsed keywords:', parsed.keywords);
      console.log('[ANALYZE] Parsed reason:', parsed.reason);

      // Map new response format to AnalysisResult
      // emotionKey → emotion, reason → summary
      let keywords: string[] = [];
      if (Array.isArray(parsed.keywords)) {
        keywords = parsed.keywords.filter((k: unknown) => typeof k === 'string' && k.trim());
      }

      const emotion = normalizeEmotion(parsed.emotionKey || parsed.emotion || '');
      const emoji = EMOTION_MAP[emotion]?.emoji || '😐';

      console.log('[ANALYZE] Normalized emotion:', emotion);
      console.log('[ANALYZE] Mapped emoji:', emoji);

      result = {
        keywords,
        emotion,
        emoji,
        summary: parsed.reason || parsed.summary || '오늘의 기록',
      };
    } catch (parseError) {
      console.error('[ANALYZE] Parse failed:', content);
      console.error('[ANALYZE] Parse error:', parseError);
      return NextResponse.json(
        { error: 'AI 응답을 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    // Validate and sanitize result - ensure at least 3 keywords
    const fallbackKeywords = ['일상', '기록', '오늘'];
    if (!Array.isArray(result.keywords) || result.keywords.length === 0) {
      result.keywords = fallbackKeywords;
    } else {
      // Limit to 5 keywords, sanitize each
      result.keywords = result.keywords
        .slice(0, 5)
        .map(k => String(k).slice(0, 20));
      // Ensure at least 3 keywords
      while (result.keywords.length < 3) {
        const fallback = fallbackKeywords[result.keywords.length];
        if (!result.keywords.includes(fallback)) {
          result.keywords.push(fallback);
        } else {
          result.keywords.push('메모');
        }
      }
    }
    console.log('Final keywords:', result.keywords);

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
