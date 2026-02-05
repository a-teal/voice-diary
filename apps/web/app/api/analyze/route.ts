import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResult } from '@/types';
import { Emotion } from '@/types';

// ============================================================
// 상수
// ============================================================

const VALID_EMOTIONS: Emotion[] = [
  'happy', 'grateful', 'excited', 'peaceful',
  'neutral', 'thoughtful',
  'sad', 'angry', 'anxious', 'exhausted'
];

const EMOTION_EMOJI: Record<Emotion, string> = {
  happy: '😊',
  grateful: '🥰',
  excited: '🤩',
  peaceful: '😌',
  neutral: '😐',
  thoughtful: '🤔',
  sad: '😢',
  angry: '😡',
  anxious: '😰',
  exhausted: '😫',
};

// Rate limiting (간단 버전)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1분
  const maxRequests = 20;

  const record = rateLimitMap.get(clientId);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// ============================================================
// 프롬프트 (emotion-rules.md + hashtag-rules.md 통합)
// ============================================================

const ANALYSIS_PROMPT = `일기 텍스트를 분석해서 감정과 키워드를 추출해.

## 출력 형식
JSON만 반환. 다른 텍스트 없이.
{
  "summary": "한 문장 요약",
  "primaryEmotionKey": "감정키",
  "secondaryEmotionKeys": [],
  "keywords": ["키워드1", "키워드2"]
}

## 10가지 감정 (영어 키만 사용)
- 긍정: happy(기쁨), grateful(감사), excited(설렘), peaceful(평온)
- 중립: neutral(무난), thoughtful(고민/갈등)
- 부정: sad(슬픔), angry(분노), anxious(불안), exhausted(지침)

## summary 규칙 (중요!)
- 금지: 캐주얼/나이브 표현 ("오늘 ~했네요", "좋은 하루예요", "~구나!", "~했군요", 이모지)
- 필수: 따스한 시선으로 마음을 읽어주는 한 문장
- 톤: "당신의 하루를 바라보는 따뜻한 친구"처럼
- 은유와 서정적 표현 적극 사용

좋은 예시:
- "오늘도 묵묵히 자기 자리를 지킨 하루였다"
- "작은 기쁨 하나가 마음에 온기를 남겼다"
- "고민의 무게 속에서도 앞을 향해 걸어가고 있다"
- "지친 마음에도 내일을 준비하는 당신이 대견하다"
- "소소한 일상이 모여 당신만의 하루가 되었다"
- "갈림길에서 잠시 멈춰 생각하는 시간도 필요하다"

나쁜 예시 (절대 금지):
- "오늘 회의했네요!" (캐주얼)
- "피곤한 하루였구나" (나이브)
- "좋은 일이 있었네요 😊" (이모지)
- "힘든 하루였군요" (진단적)

## 감정 선택 규칙
- 갈등/의사결정 언급 → thoughtful 우선
- 피로/컨디션 저하 → exhausted 우선
- neutral 기본값 금지 (명확한 근거 없으면 다른 감정 선택)

### 감정 우선순위
1. 피로/지침/컨디션 저하 → exhausted
2. 갈등/선택/결정/고민 → thoughtful
3. 걱정/불안 → anxious
4. 짜증/답답/분노 → angry
5. 슬픔/우울 → sad
6. 감사/고마움 → grateful
7. 기대/설렘 → excited
8. 편안/안도 → peaceful
9. 기쁨/행복 → happy
10. 순수 사실 나열만 → neutral (거의 사용 안 함)

## secondaryEmotionKeys 규칙 (중요!)
- 대부분의 일기는 복합 감정을 담고 있음
- 1~2개 적극 추출 (0개는 아주 단순한 경우만)
- primaryEmotionKey와 중복 금지
- 예: 피곤하지만 뿌듯 → primary: exhausted, secondary: [grateful]
- 예: 걱정되지만 설렘 → primary: anxious, secondary: [excited]

## keywords 규칙
- 2~5개, unique
- 구체적 명사: 고유명사 > 행위 > 사물 > 맥락
- 절대 제외: 감정 단어(행복, 슬픔), 일반어(하루, 오늘)

## 분석할 텍스트
"{transcript}"`;

// ============================================================
// API 핸들러
// ============================================================

export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit
    const clientId = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimit = checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 2. 입력 검증
    const body = await request.json();
    const transcript = String(body.transcript || '').trim();

    if (!transcript || transcript.length < 5) {
      return NextResponse.json(
        { error: '텍스트가 너무 짧습니다.' },
        { status: 400 }
      );
    }

    // 3. API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 4. Claude API 호출
    const prompt = ANALYSIS_PROMPT.replace('{transcript}', transcript.slice(0, 2000));

    console.log('[Analyze] Transcript:', transcript.slice(0, 100));

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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('[Analyze] API error:', await response.text());
      return NextResponse.json(
        { error: 'AI 분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 5. 응답 파싱
    const data = await response.json();
    const content = data.content[0]?.text || '';

    console.log('[Analyze] Raw response:', content);

    // JSON 추출
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Analyze] JSON not found in response');
      return NextResponse.json(
        { error: 'AI 응답 파싱 실패' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    console.log('[Analyze] Parsed JSON:', JSON.stringify(parsed, null, 2));

    // 6. 결과 검증 및 정리
    const primaryEmotionKey: Emotion = VALID_EMOTIONS.includes(parsed.primaryEmotionKey)
      ? parsed.primaryEmotionKey
      : 'peaceful'; // neutral 기본값 금지

    // secondaryEmotionKeys 검증 (최대 2개, primary와 중복 금지)
    const secondaryEmotionKeys: Emotion[] = Array.isArray(parsed.secondaryEmotionKeys)
      ? parsed.secondaryEmotionKeys
          .filter((e: unknown) =>
            typeof e === 'string' &&
            VALID_EMOTIONS.includes(e as Emotion) &&
            e !== primaryEmotionKey // primary와 중복 금지
          )
          .slice(0, 2) as Emotion[]
      : [];

    // keywords 검증 (2-5개, unique)
    const rawKeywords: string[] = Array.isArray(parsed.keywords)
      ? (parsed.keywords as unknown[]).filter((k): k is string => typeof k === 'string')
      : [];
    const keywords = Array.from(new Set(rawKeywords)).slice(0, 5);

    const summary: string = String(parsed.summary || '').slice(0, 100) || '오늘 하루의 기록';

    const result: AnalysisResult & { emoji: string } = {
      summary,
      primaryEmotionKey,
      secondaryEmotionKeys: secondaryEmotionKeys.length > 0 ? secondaryEmotionKeys : undefined,
      keywords,
      emoji: EMOTION_EMOJI[primaryEmotionKey],
    };

    // 검증용 로그
    console.log('[Analyze] Final result:', JSON.stringify({
      summary: result.summary,
      primaryEmotionKey: result.primaryEmotionKey,
      secondaryEmotionKeys: result.secondaryEmotionKeys,
      keywords: result.keywords,
    }, null, 2));

    return NextResponse.json(result, {
      headers: { 'X-RateLimit-Remaining': String(rateLimit.remaining) },
    });

  } catch (error) {
    console.error('[Analyze] Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
