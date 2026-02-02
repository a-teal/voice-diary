/**
 * Hashtag Engine for Voice Diary
 *
 * 일기/음성전사 텍스트에서 주제/요약 해시태그 3-6개를 추출
 * 감정 해시태그는 생성하지 않음 (감정은 이모지로 별도 처리)
 */

export type SupportedLanguage = 'ko' | 'en';

// 정규화 사전 타입
interface NormalizationDict {
  canonical: Record<string, string>;  // 별칭 → 대표 태그
  blocklist: Set<string>;             // 제외할 단어
}

// 한국어 정규화 사전
const DICT_KO: NormalizationDict = {
  canonical: {
    // 업무 관련
    '회사일': '업무',
    '직장': '업무',
    '일': '업무',
    '미팅': '회의',
    '미팅룸': '회의',
    // 감정 관련 → 제거 대상이지만 혹시 들어오면 매핑
    '짜증': '분노',
    '화남': '분노',
    // 일반 정규화
    '아침식사': '아침',
    '점심식사': '점심',
    '저녁식사': '저녁',
  },
  blocklist: new Set([
    // 과잉 일반어
    '하루', '일상', '기록', '생각', '느낌', '오늘', '내일', '어제',
    '것', '수', '때', '중', '뭔가', '그냥', '좀', '많이',
    // 감정 단어 (해시태그에서 제외)
    '행복', '기쁨', '즐거움', '슬픔', '우울', '불안', '걱정', '화남',
    '짜증', '분노', '피곤', '지침', '설렘', '뿌듯', '감사', '평온',
    '무난', '놀람', '충격', '기대', '두려움', '긴장',
    // 서술형/문장형 방지용
    '했다', '했음', '함', '됨', '임', '인듯',
  ]),
};

// 영어 정규화 사전
const DICT_EN: NormalizationDict = {
  canonical: {
    'meeting': 'work',
    'office': 'work',
    'coworker': 'colleague',
    'coworkers': 'colleague',
    'teammate': 'colleague',
    'breakfast': 'morning',
    'lunch': 'meal',
    'dinner': 'meal',
  },
  blocklist: new Set([
    // 과잉 일반어
    'today', 'daily', 'life', 'thoughts', 'feeling', 'day', 'thing', 'stuff',
    'something', 'someone', 'just', 'really', 'very', 'much', 'lot',
    // 감정 단어
    'happy', 'sad', 'angry', 'anxious', 'worried', 'tired', 'exhausted',
    'excited', 'nervous', 'stressed', 'frustrated', 'depressed', 'upset',
    'grateful', 'thankful', 'peaceful', 'calm', 'surprised', 'shocked',
    // 서술형 방지
    'was', 'were', 'did', 'done', 'been', 'being',
  ]),
};

/**
 * 텍스트의 지배적 언어를 감지
 */
export function detectLanguage(
  text: string,
  preferredLanguage?: SupportedLanguage
): SupportedLanguage {
  // 1) 사용자 설정 언어가 있으면 우선
  if (preferredLanguage) {
    return preferredLanguage;
  }

  // 2) 한글 비율로 판단
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'ko'; // 기본값

  const koreanRatio = koreanChars / totalChars;
  return koreanRatio > 0.3 ? 'ko' : 'en';
}

/**
 * 텍스트에서 후보 키워드 추출 (명사 위주)
 */
function extractCandidates(text: string, lang: SupportedLanguage): string[] {
  const candidates: string[] = [];

  if (lang === 'ko') {
    // 한국어: 명사 패턴 추출
    // 조사 제거 + 명사 추출 (간단한 규칙 기반)
    const cleaned = text
      .replace(/[은는이가을를의에서로도만까지부터]/g, ' ')
      .replace(/했[다어요습니다]/g, ' ')
      .replace(/[.,!?~…·""''「」『』【】\(\)\[\]]/g, ' ');

    // 2-6글자 한글 단어 추출
    const words = cleaned.match(/[가-힣]{2,6}/g) || [];
    candidates.push(...words);

    // 고유명사 패턴 (대문자로 시작하거나 영어+한글 조합)
    const properNouns = text.match(/[A-Z][a-z]+|[a-zA-Z]+(?=[가-힣])/g) || [];
    candidates.push(...properNouns.map(n => n.toLowerCase()));

  } else {
    // 영어: stopword 제거 후 명사 추출
    const stopwords = new Set([
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'am', 'are', 'was', 'were', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'can', 'may', 'might', 'must', 'that', 'this', 'these',
      'those', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
      'so', 'if', 'then', 'than', 'too', 'also', 'about', 'into', 'through',
      'during', 'before', 'after', 'above', 'below', 'between', 'under',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopwords.has(w));

    candidates.push(...words);
  }

  return candidates;
}

/**
 * 후보 키워드에 점수 부여
 */
function scoreCandidates(
  candidates: string[],
  text: string,
  lang: SupportedLanguage
): Map<string, number> {
  const scores = new Map<string, number>();
  const textLower = text.toLowerCase();
  const textLength = text.length;

  // 빈도 계산
  const frequency = new Map<string, number>();
  for (const word of candidates) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  for (const [word, freq] of frequency) {
    let score = 0;

    // 1) 빈도 점수 (1-3회가 최적)
    score += Math.min(freq, 3) * 2;

    // 2) 위치 점수 (앞부분에 나올수록 높음)
    const firstIndex = textLower.indexOf(word.toLowerCase());
    if (firstIndex !== -1) {
      const positionScore = 1 - (firstIndex / textLength);
      score += positionScore * 3;
    }

    // 3) 길이 점수 (적당한 길이 선호)
    const idealLength = lang === 'ko' ? 3 : 6;
    const lengthDiff = Math.abs(word.length - idealLength);
    score += Math.max(0, 3 - lengthDiff);

    // 4) 구체성 점수 (고유명사 패턴)
    if (/^[A-Z]/.test(word) || /[0-9]/.test(word)) {
      score += 2; // 고유명사/숫자 포함 = 구체적
    }

    scores.set(word, score);
  }

  return scores;
}

/**
 * 정규화 및 필터링
 */
function normalizeAndFilter(
  candidates: string[],
  scores: Map<string, number>,
  dict: NormalizationDict
): string[] {
  const normalized = new Map<string, number>(); // 정규화된 태그 → 점수

  for (const word of candidates) {
    // blocklist 체크
    if (dict.blocklist.has(word.toLowerCase())) {
      continue;
    }

    // 정규화 (별칭 → 대표 태그)
    const canonical = dict.canonical[word.toLowerCase()] || word.toLowerCase();

    // blocklist 재체크 (정규화 후)
    if (dict.blocklist.has(canonical)) {
      continue;
    }

    // 점수 합산 (같은 canonical이면 합산)
    const existingScore = normalized.get(canonical) || 0;
    const wordScore = scores.get(word) || 0;
    normalized.set(canonical, existingScore + wordScore);
  }

  // 점수 순 정렬
  return Array.from(normalized.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/**
 * 해시태그 추출 메인 함수
 *
 * @param text 일기 텍스트
 * @param preferredLanguage 선호 언어 (없으면 자동 감지)
 * @returns 해시태그 배열 (# 포함, 3-6개)
 */
export function extractHashtags(
  text: string,
  preferredLanguage?: SupportedLanguage
): string[] {
  if (!text || text.trim().length < 5) {
    return preferredLanguage === 'en'
      ? ['#note', '#diary']
      : ['#메모', '#기록'];
  }

  // 1) 언어 감지
  const lang = detectLanguage(text, preferredLanguage);
  const dict = lang === 'ko' ? DICT_KO : DICT_EN;

  // 2) 후보 추출
  const candidates = extractCandidates(text, lang);

  // 3) 점수 계산
  const scores = scoreCandidates(candidates, text, lang);

  // 4) 정규화 및 필터링
  const filtered = normalizeAndFilter(candidates, scores, dict);

  // 5) 상위 3-6개 선택
  const selected = filtered.slice(0, 6);

  // 6) 최소 2개 보장 (fallback)
  if (selected.length < 2) {
    const fallbacks = lang === 'ko'
      ? ['일기', '하루']
      : ['diary', 'note'];
    while (selected.length < 2) {
      const fallback = fallbacks.shift();
      if (fallback && !selected.includes(fallback)) {
        selected.push(fallback);
      }
    }
  }

  // 7) # 포함하여 반환
  return selected.map(tag => `#${tag}`);
}

/**
 * 해시태그에서 # 제거하여 키워드로 변환
 */
export function hashtagsToKeywords(hashtags: string[]): string[] {
  return hashtags.map(tag => tag.replace(/^#/, ''));
}

/**
 * 키워드를 해시태그로 변환
 */
export function keywordsToHashtags(keywords: string[]): string[] {
  return keywords.map(kw => kw.startsWith('#') ? kw : `#${kw}`);
}
