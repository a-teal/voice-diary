import { NextRequest, NextResponse } from 'next/server';
import { AnalysisResult, EmotionWeight } from '@/types';
import { Emotion } from '@/types';

// ============================================================
// 상수
// ============================================================

const VALID_EMOTIONS: Emotion[] = [
  'happy', 'excited', 'proud', 'peaceful',
  'neutral',
  'sad', 'angry', 'anxious', 'exhausted',
  'surprised'
];

const EMOTION_EMOJI: Record<Emotion, string> = {
  happy: '😊',
  excited: '🤩',
  proud: '🥰',
  peaceful: '😌',
  neutral: '😐',
  sad: '😢',
  angry: '😡',
  anxious: '😰',
  exhausted: '😫',
  surprised: '😲',
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
  "primaryEmotion": "가장 강한 감정 (영어 키)",
  "secondaryEmotions": ["두번째 감정", "세번째 감정"],
  "emotionWeights": [
    {"emotion": "primaryEmotion과 동일", "weight": 0.6},
    {"emotion": "secondaryEmotions[0]", "weight": 0.25},
    {"emotion": "secondaryEmotions[1]", "weight": 0.15}
  ],
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "summary": "친구처럼 위트있게 한마디 (15자 이내)"
}

## 감정 가중치 규칙
- primaryEmotion: 가장 강한 감정 1개 (weight 0.4~0.8)
- secondaryEmotions: 부가 감정 0~2개 (없으면 빈 배열)
- emotionWeights: 모든 감정의 가중치 합 = 1.0
- 단일 감정만 느껴지면 secondaryEmotions: [], emotionWeights: [{"emotion": "...", "weight": 1.0}]

## summary 규칙
- 독후감 금지 ("~를 토로하고 있다", "~한 하루였다" 같은 딱딱한 표현 X)
- 친구가 공감하듯 가볍게 한마디
- 예시:
  - "피곤해" → "오늘 빡셌구나 😮‍💨"
  - "맛있는 거 먹었다" → "먹방 성공 👍"
  - "짜증나" → "에휴... 고생했다"
  - "좋은 일 있었다" → "오 뭔데뭔데?"

## 감정 규칙

### 10가지 감정 (영어 키만 사용)
- 긍정: happy(기쁨), excited(설렘), proud(뿌듯), peaceful(평온)
- 중립: neutral (거의 사용 안 함)
- 부정: sad(슬픔), angry(짜증/분노), anxious(불안/걱정), exhausted(피곤/지침)
- 기타: surprised(놀람)

### neutral은 거의 틀린 선택
다음이 모두 충족될 때만 neutral:
- 감정/평가 단어 없음
- 감탄사/한숨 없음 (하…, 휴, 에휴, 아 진짜)
- 불확실/갈등 없음 (해야, 모르겠, 어쩌지)
- 순수한 사실 나열만 ("12시에 점심 먹었다")

### 감정 우선순위 (이 순서대로 판단)
1. 피곤/지침 → exhausted
2. 걱정/불안/해야/모르겠 → anxious
3. 짜증/답답 → angry
4. 슬픔/우울 → sad
5. 놀람/충격 → surprised
6. 성취/뿌듯/감사 → proud
7. 기대/설렘 → excited
8. 편안/안도 → peaceful
9. 기쁨/행복 → happy
10. 순수 사실만 → neutral

## 키워드 규칙

### 3-5개 구체적 명사 추출
- Event/Action: 회의, 출장, 운동, 약속
- Topic/Entity: 팀장, 프로젝트, 카페
- Outcome: 결정, 연기, 완료

### 절대 제외
- 감정 단어: 행복, 슬픔, 불안, 피곤, 걱정
- 일반어: 하루, 일상, 기록, 생각, 오늘

### 예시
- "강남역에서 친구랑 떡볶이 먹었다" → ["강남역", "친구", "떡볶이"]
- "팀 회의에서 일정 조정했다" → ["회의", "일정", "조정"]

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
    console.log('[Analyze] Parsed:', parsed);

    // 6. 결과 검증 및 정리
    const primaryEmotion: Emotion = VALID_EMOTIONS.includes(parsed.primaryEmotion)
      ? parsed.primaryEmotion
      : 'neutral';

    // secondaryEmotions 검증 (최대 2개)
    const secondaryEmotions: Emotion[] = Array.isArray(parsed.secondaryEmotions)
      ? parsed.secondaryEmotions
          .filter((e: unknown) => typeof e === 'string' && VALID_EMOTIONS.includes(e as Emotion))
          .slice(0, 2) as Emotion[]
      : [];

    // emotionWeights 검증
    const emotionWeights: EmotionWeight[] = Array.isArray(parsed.emotionWeights)
      ? parsed.emotionWeights
          .filter((w: { emotion?: unknown; weight?: unknown }) =>
            typeof w.emotion === 'string' &&
            VALID_EMOTIONS.includes(w.emotion as Emotion) &&
            typeof w.weight === 'number' &&
            w.weight >= 0 && w.weight <= 1
          )
          .map((w: { emotion: string; weight: number }) => ({
            emotion: w.emotion as Emotion,
            weight: w.weight,
          }))
      : [{ emotion: primaryEmotion, weight: 1.0 }];

    const keywords: string[] = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k: unknown) => typeof k === 'string').slice(0, 6)
      : [];

    const summary: string = String(parsed.summary || '').slice(0, 50) || '오늘의 기록';

    const result: AnalysisResult & { emoji: string } = {
      emotion: primaryEmotion,  // 하위 호환용
      primaryEmotion,
      secondaryEmotions: secondaryEmotions.length > 0 ? secondaryEmotions : undefined,
      emotionWeights,
      emoji: EMOTION_EMOJI[primaryEmotion],
      keywords,
      summary,
    };

    console.log('[Analyze] Final result:', result);

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
