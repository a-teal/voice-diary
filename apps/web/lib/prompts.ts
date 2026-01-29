export const DIARY_ANALYSIS_PROMPT = `당신은 일기 분석 전문가입니다.
사용자의 일기를 읽고 다음을 JSON 형식으로 추출해주세요:

1. keywords: 핵심 키워드 3-5개 (명사 위주, 한국어)
2. emotion: 대표 감정 1개 (아래 10개 중 선택)
   [긍정]
   - happy (행복, 기쁨, 즐거움, 만족)
   - grateful (감사, 사랑, 고마움, 따뜻함)
   - excited (신남, 설렘, 기대, 흥분)
   - peaceful (평온, 여유, 편안함, 안도)
   [중립]
   - neutral (무난, 보통, 특별한 감정 없음)
   - thoughtful (고민, 생각, 깊은 생각, 회상)
   [부정]
   - sad (슬픔, 우울, 외로움, 아쉬움)
   - angry (화남, 짜증, 분노, 불만)
   - anxious (불안, 걱정, 초조, 긴장)
   - exhausted (지침, 스트레스, 피곤, 무기력)
3. summary: 한 줄 요약 (15자 이내, 한국어)

일기 내용:
{transcript}

JSON 형식으로만 응답해주세요. 다른 설명은 필요 없습니다.
예시 응답:
{"keywords": ["회의", "프로젝트", "동료"], "emotion": "excited", "summary": "프로젝트 성공으로 신나는 하루"}`;
