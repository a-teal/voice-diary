// Language-specific normalization dictionaries for hashtag extraction
import { HashtagDictionary } from './types';

export const dictionaryKo: HashtagDictionary = {
  // Canonical form -> aliases that should map to it
  canonical: {
    // Event/Action
    '회의': ['미팅', '회의록', '팀회의', '정기회의', '주간회의'],
    '출근': ['출퇴근', '퇴근'],
    '운동': ['헬스', '러닝', '조깅', '산책', '걷기', '달리기', '웨이트'],
    '공부': ['학습', '스터디', '독서'],
    '여행': ['출장', '휴가', '나들이'],
    '식사': ['점심', '저녁', '아침', '브런치', '회식'],
    '프로젝트': ['프로젝트관리', 'PJ', '프젝'],
    '개발': ['코딩', '프로그래밍', '개발업무'],
    '디자인': ['UI', 'UX', '디자인작업'],
    '발표': ['PT', '프레젠테이션', '발표준비'],
    '면접': ['인터뷰', '채용면접'],

    // Topic/Entity
    '가족': ['부모님', '엄마', '아빠', '형제', '자매', '배우자', '아이'],
    '친구': ['친구들', '지인'],
    '동료': ['팀원', '직장동료', '회사동료'],
    '상사': ['팀장', '매니저', '리더'],
    '고객': ['클라이언트', '거래처', '파트너사'],
    '건강': ['컨디션', '몸상태', '체력'],
    '업무': ['일', '작업', '태스크'],
    '계획': ['플랜', '기획', '계획수립'],

    // Outcome/Decision/Issue
    '결정': ['의사결정', '결론'],
    '변경': ['수정', '변경사항', '업데이트'],
    '완료': ['마무리', '종료', '끝'],
    '시작': ['착수', '시작점', '킥오프'],
    '문제': ['이슈', '트러블', '장애'],
    '해결': ['해결책', '솔루션'],
    '조정': ['범위조정', '일정조정', '스코프조정'],
    '연기': ['지연', '딜레이', '미뤄짐'],
    '성공': ['성과', '달성'],
    '실패': ['실수', '오류'],
  },

  // Always exclude these words
  blocklist: [
    // Personal identifiers (use category instead)
    '홍길동', '김철수', '이영희',
    // Internal codes
    '내부코드', '비밀번호',
  ],

  // Emotion words - ALWAYS exclude
  emotionBlocklist: [
    '기쁨', '기쁜', '행복', '행복한', '즐거움', '즐거운', '만족', '만족스러운',
    '슬픔', '슬픈', '우울', '우울한', '외로움', '외로운', '아쉬움', '아쉬운',
    '분노', '화남', '화난', '짜증', '짜증나는', '불만', '불만족',
    '불안', '불안한', '걱정', '걱정되는', '초조', '초조한', '긴장', '긴장되는',
    '평온', '평온한', '차분', '차분한', '편안', '편안한', '안정', '안정된',
    '피곤', '피곤한', '지침', '지친', '무기력', '무기력한', '힘듦', '힘든',
    '고민', '복잡', '복잡한', '혼란', '혼란스러운',
    '자신감', '뿌듯', '뿌듯한', '성취감', '보람',
    '사랑', '애정', '감사', '감사한', '따뜻', '따뜻한',
    '무덤덤', '덤덤', '무감각',
    '스트레스', '압박', '부담', '두려움', '두려운', '공포',
    '설렘', '설레는', '기대', '기대되는', '흥분', '흥분되는',
  ],

  // Overly general words - exclude
  generalBlocklist: [
    '하루', '일상', '기록', '생각', '느낌', '마음', '감정',
    '오늘', '내일', '어제', '이번주', '다음주', '지난주',
    '것', '일', '때', '곳', '사람', '나', '우리', '자신',
    '정말', '진짜', '너무', '매우', '아주', '완전',
    '그냥', '약간', '조금', '많이', '별로',
    '좋은', '나쁜', '괜찮은', '이상한',
    '모든', '어떤', '무슨', '이런', '저런', '그런',
  ],
};

export const dictionaryEn: HashtagDictionary = {
  canonical: {
    // Event/Action
    'meeting': ['meetings', 'team meeting', 'weekly meeting', 'standup', 'sync'],
    'workout': ['exercise', 'gym', 'running', 'jogging', 'training', 'fitness'],
    'study': ['studying', 'learning', 'reading', 'research'],
    'travel': ['trip', 'vacation', 'journey', 'commute'],
    'meal': ['lunch', 'dinner', 'breakfast', 'brunch', 'eating'],
    'project': ['projects', 'project management'],
    'development': ['coding', 'programming', 'dev', 'engineering'],
    'design': ['designing', 'ui', 'ux', 'ui/ux'],
    'presentation': ['presenting', 'pitch', 'demo'],
    'interview': ['interviewing', 'job interview'],
    'call': ['phone call', 'video call', 'conference call'],

    // Topic/Entity
    'family': ['parents', 'mom', 'dad', 'siblings', 'spouse', 'kids', 'children'],
    'friend': ['friends', 'buddy', 'buddies'],
    'colleague': ['coworker', 'coworkers', 'teammates', 'team member'],
    'manager': ['boss', 'supervisor', 'lead', 'leader'],
    'client': ['customer', 'clients', 'customers', 'partner'],
    'health': ['wellness', 'condition', 'fitness'],
    'work': ['job', 'task', 'tasks', 'assignment'],
    'plan': ['planning', 'strategy', 'roadmap'],

    // Outcome/Decision/Issue
    'decision': ['decided', 'conclusion', 'verdict'],
    'change': ['changes', 'modification', 'update', 'revision'],
    'completion': ['completed', 'finished', 'done', 'complete'],
    'start': ['started', 'beginning', 'kickoff', 'launch'],
    'problem': ['issue', 'issues', 'trouble', 'bug', 'bugs'],
    'solution': ['fix', 'resolution', 'solved', 'resolved'],
    'adjustment': ['scope change', 'reschedule', 'pivot'],
    'delay': ['delayed', 'postponed', 'pushed back'],
    'success': ['achievement', 'accomplished', 'win'],
    'failure': ['failed', 'mistake', 'error'],
  },

  blocklist: [
    // Personal identifiers
    'john doe', 'jane doe',
    // Internal codes
    'password', 'secret',
  ],

  emotionBlocklist: [
    'happy', 'happiness', 'joy', 'joyful', 'pleased', 'satisfied', 'content',
    'sad', 'sadness', 'unhappy', 'depressed', 'depression', 'lonely', 'loneliness',
    'angry', 'anger', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated',
    'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'tense', 'stressed',
    'calm', 'peaceful', 'relaxed', 'comfortable', 'serene', 'tranquil',
    'tired', 'exhausted', 'fatigued', 'drained', 'weary', 'sleepy',
    'confused', 'overwhelmed', 'uncertain', 'conflicted',
    'confident', 'proud', 'accomplished', 'fulfilled',
    'love', 'loving', 'grateful', 'thankful', 'appreciative', 'warm',
    'indifferent', 'neutral', 'numb', 'apathetic',
    'fear', 'scared', 'afraid', 'terrified', 'frightened',
    'excited', 'thrilled', 'eager', 'anticipation',
  ],

  generalBlocklist: [
    'today', 'tomorrow', 'yesterday', 'day', 'daily', 'week', 'weekly',
    'life', 'living', 'thing', 'things', 'stuff', 'something',
    'thought', 'thoughts', 'feeling', 'feelings', 'mind',
    'really', 'very', 'quite', 'pretty', 'just', 'actually',
    'good', 'bad', 'okay', 'fine', 'nice', 'great',
    'some', 'any', 'all', 'every', 'many', 'much', 'lot',
    'this', 'that', 'these', 'those', 'what', 'which',
    'i', 'me', 'my', 'myself', 'we', 'our', 'us',
    'it', 'its', 'itself', 'they', 'them', 'their',
  ],
};
