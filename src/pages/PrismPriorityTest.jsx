import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../styles/tokens";
import useIsMobile from "../hooks/useIsMobile";
import useReveal from "../hooks/useReveal";
import PageLayout from "../components/PageLayout";
import Seo from "../components/Seo";
import { characters } from "../data/characters";
import { EDENCHAT_PLAYER_URL } from "../data/links";

const RESULT_KEYS = [
  "verdict",
  "protector",
  "spark",
  "spotlight",
  "composer",
  "architect",
];

const RESULT_TYPES = {
  verdict: {
    order: 0,
    label: "냉정한 심사위원형",
    en: "Verdict Producer",
    accent: C.charJin,
    characterId: "jinshihyuk",
    short: "박수보다 기준을 먼저 세우는 타입.",
    startSituation:
      "APEX 비공개 심사실. 모두가 박수칠 때, 너만 탈락 사유를 말해야 하는 밤.",
    persona:
      "결과로 말하는 냉정한 심사위원 겸 프로듀서. 애정도 기준을 낮추는 이유가 되지 않는다.",
    characterReason:
      "진시혁과 잘 맞는 선택지는 감정 이입보다 실력, 분위기보다 결과, 가능성보다 증거를 먼저 봅니다.",
    playStyle:
      "초반에는 일부러 까다로운 판단을 내리고, 캐릭터가 그 기준을 깨는 순간을 길게 즐기세요.",
  },
  protector: {
    order: 1,
    label: "마지막 기회의 공동대표형",
    en: "Last Chance Partner",
    accent: C.charHan,
    characterId: "hansori",
    short: "사람과 팀을 동시에 살리려는 타입.",
    startSituation:
      "PRISM Studio 새벽 회의실. 예산도 시간도 바닥인데 마지막 오디션 공고가 올라온다.",
    persona:
      "무너지는 팀을 붙잡는 공동 프로듀서. 감정은 따뜻하지만 의사결정은 실무적으로 한다.",
    characterReason:
      "한소리와 맞는 선택지는 개인 서사, 팀 생존, 책임감, 오래 버티는 관계를 중요하게 봅니다.",
    playStyle:
      "대표와 파트너처럼 회의하고, 예산과 감정 사이에서 어느 쪽도 쉽게 버리지 않는 선택을 해보세요.",
  },
  spark: {
    order: 2,
    label: "원석 발굴 멘토형",
    en: "Rookie Spark Mentor",
    accent: C.charHaram,
    characterId: "kangharam",
    short: "작은 성장 신호를 가장 먼저 알아보는 타입.",
    startSituation:
      "Route 0 연습실. 모두 퇴근한 뒤 혼자 남은 연습생이 아직 한 번 더 춤을 춘다.",
    persona:
      "생활까지 챙기며 기준을 세워주는 밀착 멘토. 칭찬은 아끼지 않지만 연습량은 속이지 않는다.",
    characterReason:
      "강하람과 맞는 선택지는 간절함, 반복, 돌봄, 아직 완성되지 않은 사람의 가능성을 선택합니다.",
    playStyle:
      "작은 성공을 크게 반응해주고, 실패 뒤에 바로 다음 루틴을 제안하는 성장물 흐름으로 즐기세요.",
  },
  spotlight: {
    order: 3,
    label: "화제성 쇼러너형",
    en: "Spotlight Showrunner",
    accent: C.charMimori,
    characterId: "mimori",
    short: "무대를 사건으로 만드는 타입.",
    startSituation:
      "라이브 방송 직전 대기실. 실시간 댓글과 오디션 카메라가 동시에 켜진다.",
    persona:
      "콘텐츠 감각으로 위기를 흥행 포인트로 바꾸는 쇼러너. 장면의 온도와 댓글 흐름을 같이 본다.",
    characterReason:
      "미모리와 맞는 선택지는 화제성, 즉흥 반응, 팬덤의 파동, 보여지는 장면의 힘을 믿습니다.",
    playStyle:
      "SNS 반응, 라이브 해프닝, 대기실 농담을 적극적으로 던져 장면을 더 시끄럽게 만들어보세요.",
  },
  composer: {
    order: 4,
    label: "감정선 작곡가형",
    en: "Emotional Composer",
    accent: C.charSeo,
    characterId: "leeseha",
    short: "말보다 장면과 음악으로 설득하는 타입.",
    startSituation:
      "Blue Moon 지하 작업실. 버려진 데모 한 곡이 참가자의 인생을 바꿀 수 있다.",
    persona:
      "대사를 줄이고 감정선을 편곡하는 조용한 공범. 상처를 직접 묻기보다 장면으로 받아낸다.",
    characterReason:
      "이서하와 맞는 선택지는 느린 회복, 음악적 은유, 말하지 않은 감정, 조용한 신뢰를 고릅니다.",
    playStyle:
      "대화보다 작업실의 소리, 미완성 가사, 데모 파일 같은 소재로 천천히 가까워지는 흐름이 좋습니다.",
  },
  architect: {
    order: 5,
    label: "프리즘 설계자형",
    en: "Prism Architect",
    accent: C.charNaha,
    characterId: "naharin",
    short: "판 전체의 규칙을 다시 쓰는 타입.",
    startSituation:
      "APEX 제작총괄실. 모두가 게임이라 생각하는 판의 규칙을 너만 다시 쓴다.",
    persona:
      "사람, 시스템, 변수까지 관찰하는 흑막형 설계자. 다정함도 장난도 장기전의 일부다.",
    characterReason:
      "나하린과 맞는 선택지는 메타 전략, 숨은 룰, 예측 불가한 변수, 판을 뒤집는 재미를 선택합니다.",
    playStyle:
      "겉으로는 가볍게 웃으면서 뒤에서는 오디션 규칙과 관계 구도를 재배치하는 플레이가 어울립니다.",
  },
};

const QUESTION_ITEMS = [
  {
    id: "q01",
    title: "오디션 첫날, 네가 제일 먼저 보는 건?",
    scene: "문이 열리고 참가자들이 한 줄로 들어온다. 아직 아무도 노래하지 않았다.",
    options: [
      {
        key: "verdict",
        text: "첫 인사에서 숨이 흔들리는지 본다. 긴장도 실력의 일부니까.",
        note: "기준부터 세운다",
      },
      {
        key: "protector",
        text: "대기실에서 누가 누구를 챙기는지 본다. 팀은 무대 밖에서 먼저 보인다.",
        note: "관계의 결을 본다",
      },
      {
        key: "spark",
        text: "운동화 밑창과 연습복 땀자국을 본다. 오늘 전까지의 시간이 궁금하다.",
        note: "노력을 먼저 본다",
      },
    ],
  },
  {
    id: "q02",
    title: "무대 사고가 터졌을 때 네 첫 반응은?",
    scene: "반주가 3초 밀리고 조명이 엉뚱한 참가자를 잡았다. 객석이 술렁인다.",
    options: [
      {
        key: "spotlight",
        text: "카메라가 잡은 표정을 살린다. 이건 망한 장면이 아니라 바이럴 클립이다.",
        note: "사건으로 만든다",
      },
      {
        key: "composer",
        text: "반주가 밀린 박자를 감정선으로 바꾼다. 실수도 곡의 일부가 될 수 있다.",
        note: "분위기를 편곡한다",
      },
      {
        key: "architect",
        text: "누가 당황하고 누가 기회를 잡는지 기록한다. 사고는 숨은 룰을 드러낸다.",
        note: "변수를 읽는다",
      },
    ],
  },
  {
    id: "q03",
    title: "참가자가 '저 못 하겠어요'라고 하면?",
    scene: "연습실 바닥에 앉은 참가자가 물병만 굴리고 있다. 문밖엔 다음 촬영팀이 기다린다.",
    options: [
      {
        key: "protector",
        text: "지금 그만두면 무엇을 잃는지 같이 계산한다. 감정도 예산처럼 관리해야 한다.",
        note: "현실을 같이 본다",
      },
      {
        key: "spark",
        text: "오늘은 8마디만 하자고 말한다. 살아남는 건 대단한 결심보다 작은 반복이다.",
        note: "다음 루틴을 준다",
      },
      {
        key: "verdict",
        text: "못 하겠다는 말과 못 한다는 사실은 다르다고 끊어 말한다.",
        note: "말과 결과를 분리한다",
      },
    ],
  },
  {
    id: "q04",
    title: "새 콘셉트 회의에서 제일 끌리는 자료는?",
    scene: "테이블 위에는 음원 데모, 시청률 그래프, 참가자별 비하인드 메모가 섞여 있다.",
    options: [
      {
        key: "composer",
        text: "제목 없는 데모 파일. 첫 코드만 들어도 누가 불러야 할지 떠오른다.",
        note: "음악에서 시작한다",
      },
      {
        key: "architect",
        text: "시청률이 꺾인 구간. 사람들이 지루해진 순간이 새 규칙을 넣을 자리다.",
        note: "구조를 고친다",
      },
      {
        key: "spotlight",
        text: "비하인드 메모. 팬들이 말싸움하면서도 끝까지 보게 만들 재료가 있다.",
        note: "화제성을 찾는다",
      },
    ],
  },
  {
    id: "q05",
    title: "프라임시티에서 하루만 권한이 생긴다면?",
    scene: "더 코어, 하입 로드, Route 0 어디든 잠깐 문을 열 수 있는 카드키가 손에 있다.",
    options: [
      {
        key: "spark",
        text: "Route 0 연습실을 밤새 열어둔다. 기회는 적어도 연습 시간은 빼앗기면 안 된다.",
        note: "연습 환경을 만든다",
      },
      {
        key: "verdict",
        text: "심사 기준표를 공개한다. 모두에게 잔인해도 공정한 쪽이 낫다.",
        note: "기준을 공개한다",
      },
      {
        key: "protector",
        text: "PRISM Studio의 미납 청구서를 먼저 막는다. 꿈도 전기가 들어와야 돌아간다.",
        note: "팀을 살린다",
      },
    ],
  },
  {
    id: "q06",
    title: "라이벌 팀의 리허설을 우연히 봤다.",
    scene: "커튼 틈으로 상대 팀의 결정적 킬링 파트가 보인다. 네 팀은 아직 방향을 못 잡았다.",
    options: [
      {
        key: "architect",
        text: "훔치지 않는다. 대신 그들이 왜 저 선택을 했는지 역산한다.",
        note: "의도를 해석한다",
      },
      {
        key: "spotlight",
        text: "우리 팀은 정반대 그림으로 간다. 비교되는 순간이 제일 잘 팔린다.",
        note: "대비를 만든다",
      },
      {
        key: "composer",
        text: "킬링 파트보다 앞뒤의 공백을 기억한다. 감정은 빈칸에서 터진다.",
        note: "호흡을 본다",
      },
    ],
  },
  {
    id: "q07",
    title: "네가 좋아하는 서사는?",
    scene: "편집실 모니터에 세 가지 하이라이트가 떠 있다. 하나만 메인 예고편으로 나간다.",
    options: [
      {
        key: "verdict",
        text: "좋아하지만 떨어뜨려야 하는 사람. 기준이 감정을 이기는 장면.",
        note: "잔인한 기준",
      },
      {
        key: "spotlight",
        text: "욕먹던 장면이 다음 날 밈이 되는 사람. 카메라가 구원하는 장면.",
        note: "반전 화제성",
      },
      {
        key: "composer",
        text: "아무 말 못 하던 사람이 노래 한 줄로 전부 말하는 장면.",
        note: "느린 고백",
      },
    ],
  },
  {
    id: "q08",
    title: "새벽 2시, 메시지가 온다.",
    scene: "참가자에게서 '혹시 지금 통화 가능하세요?'라는 메시지가 도착했다.",
    options: [
      {
        key: "protector",
        text: "일단 받는다. 새벽 메시지는 효율보다 안전이 먼저다.",
        note: "곁에 있어준다",
      },
      {
        key: "architect",
        text: "받기 전에 오늘 있었던 사건을 훑는다. 이 메시지는 갑자기 온 게 아니다.",
        note: "맥락을 추적한다",
      },
      {
        key: "spark",
        text: "통화 전에 물부터 마시라고 보낸다. 무너진 사람은 루틴부터 잡아야 한다.",
        note: "작게 붙잡는다",
      },
    ],
  },
  {
    id: "q09",
    title: "팬덤이 둘로 갈라졌다.",
    scene: "한쪽은 실력을, 한쪽은 서사를 밀고 있다. 댓글창은 이미 전쟁터다.",
    options: [
      {
        key: "spotlight",
        text: "둘 다 말하게 둔다. 뜨거운 논쟁은 다음 무대 시청률을 올린다.",
        note: "열기를 이용한다",
      },
      {
        key: "composer",
        text: "다음 무대에서 둘의 감정을 한 곡 안에 넣는다. 말싸움보다 노래가 빠르다.",
        note: "감정을 합친다",
      },
      {
        key: "verdict",
        text: "숫자와 무대 영상으로 정리한다. 좋아하는 마음은 근거가 될 수 없다.",
        note: "증거로 정리한다",
      },
    ],
  },
  {
    id: "q10",
    title: "네가 만드는 첫 장면은?",
    scene: "챗봇 첫 입력창 앞에서 너는 오프닝을 직접 고를 수 있다.",
    options: [
      {
        key: "architect",
        text: "제작진 회의실에서 시작한다. 참가자들이 모르는 규칙부터 정하고 싶다.",
        note: "판부터 설계한다",
      },
      {
        key: "spark",
        text: "연습실 문밖에서 시작한다. 안에서 들리는 발소리가 이야기의 첫 박자다.",
        note: "성장 현장으로 간다",
      },
      {
        key: "protector",
        text: "대표실의 꺼진 조명 아래에서 시작한다. 마지막 기회라는 말이 먼저 와야 한다.",
        note: "절박함을 건다",
      },
    ],
  },
  {
    id: "q11",
    title: "심사평을 한 문장으로 남긴다면?",
    scene: "참가자는 무대 아래에서 네 말을 기다리고 있다. 마이크 불빛이 켜졌다.",
    options: [
      {
        key: "composer",
        text: "방금 네가 놓친 한 음이, 사실 네가 제일 하고 싶던 말 같았어.",
        note: "감정으로 짚는다",
      },
      {
        key: "verdict",
        text: "좋았던 점은 하나, 떨어질 이유는 셋. 다음엔 둘을 지워와.",
        note: "정확히 자른다",
      },
      {
        key: "spotlight",
        text: "이건 잘하면 욕도 먹고 입덕도 시키겠다. 위험한데, 그래서 재밌어.",
        note: "화제성을 본다",
      },
    ],
  },
  {
    id: "q12",
    title: "가장 위험하지만 해보고 싶은 선택은?",
    scene: "생방송 전날, 누구도 권하지 않는 플랜 B가 네 손에 들어왔다.",
    options: [
      {
        key: "spark",
        text: "가장 덜 주목받은 참가자에게 센터를 준다. 오늘 아니면 평생 기회가 없다.",
        note: "원석에 건다",
      },
      {
        key: "protector",
        text: "팀 전체가 망하지 않는 선에서 한 사람의 서사를 살린다.",
        note: "리스크를 나눈다",
      },
      {
        key: "architect",
        text: "규칙의 빈틈을 이용한다. 반칙은 아니지만 모두가 당황할 선택이다.",
        note: "룰을 비튼다",
      },
    ],
  },
  {
    id: "q13",
    title: "상대가 네 약점을 찔렀다.",
    scene: "회의실 공기가 차가워졌다. 누군가 네 판단이 감정적이라고 말한다.",
    options: [
      {
        key: "verdict",
        text: "감정적이었다면 결과가 틀렸다는 증거를 가져오라고 답한다.",
        note: "논점으로 돌린다",
      },
      {
        key: "architect",
        text: "그 말이 왜 지금 나왔는지 본다. 공격도 누군가의 신호다.",
        note: "공격의 의도를 본다",
      },
      {
        key: "protector",
        text: "맞을 수 있다고 인정하고, 대신 책임은 내가 진다고 말한다.",
        note: "책임을 진다",
      },
    ],
  },
  {
    id: "q14",
    title: "무대 뒤에서 들린 한마디는?",
    scene: "커튼이 내려가기 10초 전, 누군가 아주 작게 혼잣말을 했다.",
    options: [
      {
        key: "composer",
        text: "'이번엔 도망 안 가.' 그 한마디를 다음 곡의 제목처럼 기억한다.",
        note: "대사를 곡으로 듣는다",
      },
      {
        key: "spotlight",
        text: "'카메라 어디야?' 긴장 속에서도 화면을 찾는 감각이 좋다.",
        note: "본능적 카메라감",
      },
      {
        key: "spark",
        text: "'한 번만 더.' 그 말이면 충분하다. 오늘은 끝까지 붙어준다.",
        note: "반복을 믿는다",
      },
    ],
  },
  {
    id: "q15",
    title: "팀의 분위기가 가라앉았다.",
    scene: "연습실 거울 앞, 아무도 먼저 음악을 틀지 않는다.",
    options: [
      {
        key: "protector",
        text: "밥부터 먹인다. 배고픈 팀에게 전략 회의는 사치다.",
        note: "기초 체력을 돌본다",
      },
      {
        key: "composer",
        text: "오늘은 말 대신 데모를 튼다. 음악이 먼저 말을 걸게 둔다.",
        note: "감정선을 연다",
      },
      {
        key: "verdict",
        text: "침묵을 끊고 오늘 못 한 걸 정확히 적는다. 모호한 우울은 오래 간다.",
        note: "문제를 특정한다",
      },
    ],
  },
  {
    id: "q16",
    title: "최종화 예고편을 만든다면?",
    scene: "30초 안에 시청자를 붙잡아야 한다. 모든 참가자의 눈빛이 편집 타임라인에 있다.",
    options: [
      {
        key: "spotlight",
        text: "댓글창이 폭발할 표정 세 컷을 맨 앞에 둔다. 설명은 나중이다.",
        note: "즉시 시선을 잡는다",
      },
      {
        key: "spark",
        text: "첫 연습 영상과 지금을 붙인다. 변한 사람의 증거는 강하다.",
        note: "성장을 증명한다",
      },
      {
        key: "architect",
        text: "모든 장면이 마지막 규칙 공개로 이어지게 만든다. 예고편도 장치다.",
        note: "복선을 깐다",
      },
    ],
  },
  {
    id: "q17",
    title: "가장 오래 붙잡는 질문은?",
    scene: "테스트가 끝나가는데, 머릿속에 남는 건 점수보다 어떤 질문이다.",
    options: [
      {
        key: "architect",
        text: "이 판에서 진짜로 선택권을 가진 사람은 누구지?",
        note: "권력 구조를 본다",
      },
      {
        key: "protector",
        text: "내가 살린 선택 때문에 누군가가 더 무거워지진 않았나?",
        note: "책임의 여파를 본다",
      },
      {
        key: "composer",
        text: "그 사람이 말하지 못한 감정은 어디에 남았지?",
        note: "남은 감정을 듣는다",
      },
    ],
  },
  {
    id: "q18",
    title: "마지막 선택 버튼 앞에서 너는?",
    scene: "이제 추천 결과가 나온다. 하지만 프라임시티는 늘 선택 이후가 더 시끄럽다.",
    options: [
      {
        key: "spark",
        text: "결과가 뭐든 일단 첫 장면을 해본다. 이야기는 움직여야 알 수 있다.",
        note: "바로 시작한다",
      },
      {
        key: "verdict",
        text: "내 답변이 일관적이었는지 먼저 확인한다. 추천도 납득돼야 한다.",
        note: "논리를 확인한다",
      },
      {
        key: "spotlight",
        text: "결과명이 웃기거나 멋있으면 바로 캡처할 생각부터 한다.",
        note: "공유각을 본다",
      },
    ],
  },
];

function alpha(color, pct) {
  return `color-mix(in oklch, ${color} ${pct}%, transparent)`;
}

function createEmptyAnswers() {
  return Array.from({ length: QUESTION_ITEMS.length }, () => null);
}

function getAnsweredCount(answers) {
  return answers.filter((answer) => answer !== null).length;
}

function getScoreState(answers) {
  const scores = Object.fromEntries(RESULT_KEYS.map((id) => [id, 0]));
  const tieWeights = Object.fromEntries(RESULT_KEYS.map((id) => [id, 0]));

  answers.forEach((answer, questionIndex) => {
    if (answer === null) return;
    const option = QUESTION_ITEMS[questionIndex]?.options[answer];
    if (!option) return;
    scores[option.key] += 1;
    tieWeights[option.key] += (questionIndex + 1) * (answer + 1);
  });

  const ranked = RESULT_KEYS.map((id) => ({
    id,
    score: scores[id],
    tieWeight: tieWeights[id],
    ...RESULT_TYPES[id],
  })).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.tieWeight !== a.tieWeight) return b.tieWeight - a.tieWeight;
    return a.order - b.order;
  });

  return {
    scores,
    ranked,
    result: ranked[0],
  };
}

function findCharacter(characterId) {
  return characters.find((character) => character.id === characterId);
}

function getFirstUnanswered(answers) {
  return answers.findIndex((answer) => answer === null);
}

function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        color: C.text35,
        textDecoration: "none",
        fontSize: 12,
        letterSpacing: 0,
        cursor: "pointer",
        fontFamily: "var(--f-body)",
      }}
    >
      &larr; PRIME CITY
    </button>
  );
}

function PrismSignal({ activeId, progress, isMobile }) {
  const facets = [
    { id: "verdict", points: "180,18 276,70 224,132 180,108", tx: 230, ty: 72 },
    { id: "protector", points: "180,18 180,108 110,136 82,66", tx: 122, ty: 78 },
    { id: "spark", points: "82,66 110,136 70,218 20,154", tx: 74, ty: 148 },
    { id: "spotlight", points: "276,70 340,154 288,218 224,132", tx: 286, ty: 148 },
    { id: "composer", points: "70,218 110,136 180,178 170,248", tx: 126, ty: 204 },
    { id: "architect", points: "180,178 224,132 288,218 170,248", tx: 222, ty: 204 },
  ];
  const current = RESULT_TYPES[activeId] || RESULT_TYPES.architect;
  const progressText = `${Math.round(progress * 100)}%`;

  return (
    <div
      style={{
        position: "relative",
        padding: isMobile ? "18px 12px" : "24px 18px",
        background: `linear-gradient(145deg, ${alpha(current.accent, 10)}, ${C.bgCard})`,
        border: `1px solid ${alpha(current.accent, 25)}`,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 360 270"
        role="img"
        aria-label="질문 성향을 보여주는 반응형 프리즘"
        style={{
          width: "100%",
          minHeight: isMobile ? 210 : 240,
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          <filter id="priority-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="priority-core" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={alpha(current.accent, 65)} />
            <stop offset="100%" stopColor={alpha(C.primeBlue, 18)} />
          </linearGradient>
        </defs>

        <circle
          cx="180"
          cy="136"
          r="106"
          fill="none"
          stroke={C.border06}
          strokeWidth="2"
        />
        <circle
          cx="180"
          cy="136"
          r="106"
          fill="none"
          stroke={current.accent}
          strokeWidth="3"
          strokeDasharray={`${Math.max(8, Math.round(progress * 666))} 666`}
          strokeLinecap="round"
          transform="rotate(-90 180 136)"
          opacity="0.72"
        />

        {facets.map((facet) => {
          const type = RESULT_TYPES[facet.id];
          const isActive = facet.id === activeId;
          return (
            <g key={facet.id}>
              <polygon
                points={facet.points}
                fill={isActive ? "url(#priority-core)" : C.bgCard}
                stroke={isActive ? type.accent : C.border10}
                strokeWidth={isActive ? 2.4 : 1}
                filter={isActive ? "url(#priority-glow)" : undefined}
                style={{
                  transition:
                    "fill 0.45s cubic-bezier(0.22,1,0.36,1), stroke 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1)",
                }}
                opacity={isActive ? 0.95 : 0.5}
              />
              <text
                x={facet.tx}
                y={facet.ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? C.white : C.text35}
                fontFamily="var(--f-display-en)"
                fontSize={isActive ? 10 : 8}
                letterSpacing="0"
                style={{ pointerEvents: "none" }}
              >
                {type.en.split(" ")[0]}
              </text>
            </g>
          );
        })}

        <polygon
          points="180,108 224,132 180,178 110,136"
          fill={alpha(C.white, 10)}
          stroke={alpha(C.white, 22)}
          strokeWidth="1"
        />
        <text
          x="180"
          y="132"
          textAnchor="middle"
          fill={C.white}
          fontFamily="var(--f-display-kr)"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0"
        >
          {current.label}
        </text>
        <text
          x="180"
          y="153"
          textAnchor="middle"
          fill={current.accent}
          fontFamily="var(--f-display-en)"
          fontSize="12"
          letterSpacing="0"
        >
          {progressText}
        </text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${current.accent}, transparent)`,
          opacity: 0.45,
        }}
      />
    </div>
  );
}

function OptionCard({ option, selected, onSelect, accent }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "18px 18px",
        background: selected
          ? `linear-gradient(135deg, ${alpha(accent, 18)}, ${alpha(C.primeBlue, 8)})`
          : C.bgCard,
        border: `1px solid ${selected ? alpha(accent, 55) : C.border06}`,
        color: C.white,
        cursor: "pointer",
        fontFamily: "var(--f-body)",
        transition:
          "background 0.3s cubic-bezier(0.22,1,0.36,1), border 0.3s cubic-bezier(0.22,1,0.36,1), transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        transform: selected ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: 12,
          color: selected ? accent : C.text25,
          marginBottom: 8,
          letterSpacing: 0,
        }}
      >
        {option.note}
      </span>
      <span
        style={{
          display: "block",
          fontSize: 14,
          lineHeight: 1.75,
          color: selected ? C.text90 : C.text55,
          wordBreak: "keep-all",
        }}
      >
        {option.text}
      </span>
    </button>
  );
}

function QuestionPanel({
  answers,
  currentIndex,
  onSelect,
  onPrevious,
  onNext,
  onRestart,
  isMobile,
}) {
  const question = QUESTION_ITEMS[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const hasSelection = selectedAnswer !== null;
  const selectedKey = hasSelection
    ? question.options[selectedAnswer].key
    : question.options[0].key;
  const activeType = RESULT_TYPES[selectedKey];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === QUESTION_ITEMS.length - 1;

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border06}`,
        padding: isMobile ? "24px 18px" : "34px 32px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${activeType.accent}, transparent 72%)`,
          opacity: 0.7,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 18,
          marginBottom: 20,
        }}
      >
        <div>
          <span
            style={{
              display: "block",
              fontFamily: "var(--f-display-en)",
              fontSize: 11,
              letterSpacing: 0,
              color: activeType.accent,
              marginBottom: 8,
            }}
          >
            Question {String(currentIndex + 1).padStart(2, "0")} / {QUESTION_ITEMS.length}
          </span>
          <h2
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(22px,6vw,30px)" : "clamp(30px,3vw,42px)",
              fontWeight: 700,
              lineHeight: 1.28,
              color: C.white,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            {question.title}
          </h2>
        </div>
        <div
          style={{
            flex: "0 0 auto",
            width: 52,
            height: 52,
            display: "grid",
            placeItems: "center",
            border: `1px solid ${alpha(activeType.accent, 35)}`,
            color: activeType.accent,
            fontFamily: "var(--f-display-en)",
            fontSize: 14,
            background: alpha(activeType.accent, 8),
          }}
        >
          {currentIndex + 1}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--f-body)",
          fontSize: isMobile ? 13 : 14,
          lineHeight: 1.85,
          color: C.text45,
          margin: "0 0 24px",
          wordBreak: "keep-all",
        }}
      >
        {question.scene}
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {question.options.map((option, optionIndex) => (
          <OptionCard
            key={`${question.id}-${option.key}`}
            option={option}
            selected={selectedAnswer === optionIndex}
            onSelect={() => onSelect(optionIndex)}
            accent={RESULT_TYPES[option.key].accent}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 10,
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          marginTop: 24,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirst}
            title={isFirst ? "첫 질문이라 이전으로 이동할 수 없습니다." : "이전 질문으로 이동"}
            style={{
              padding: "12px 16px",
              border: `1px solid ${C.border10}`,
              background: isFirst ? "oklch(0.1 0.005 265 / 0.35)" : C.bgCard,
              color: isFirst ? C.text25 : C.text55,
              cursor: isFirst ? "not-allowed" : "pointer",
              fontFamily: "var(--f-body)",
              fontSize: 12,
            }}
          >
            이전
          </button>
          <button
            type="button"
            onClick={onRestart}
            style={{
              padding: "12px 16px",
              border: `1px solid ${C.border10}`,
              background: C.bgCard,
              color: C.text55,
              cursor: "pointer",
              fontFamily: "var(--f-body)",
              fontSize: 12,
            }}
          >
            처음부터
          </button>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasSelection}
          title={!hasSelection ? "선택지를 하나 고르면 다음으로 이동할 수 있습니다." : "다음 단계로 이동"}
          style={{
            padding: "13px 22px",
            border: `1px solid ${hasSelection ? alpha(activeType.accent, 55) : C.border06}`,
            background: hasSelection
              ? `linear-gradient(135deg, ${alpha(activeType.accent, 24)}, ${alpha(C.primeBlue, 12)})`
              : "oklch(0.1 0.005 265 / 0.35)",
            color: hasSelection ? C.white : C.text25,
            cursor: hasSelection ? "pointer" : "not-allowed",
            fontFamily: "var(--f-body)",
            fontSize: 13,
            fontWeight: 600,
            minWidth: isMobile ? "100%" : 132,
          }}
        >
          {isLast ? "결과 보기" : "다음 질문"}
        </button>
      </div>

      {(isFirst || !hasSelection) && (
        <p
          style={{
            margin: "12px 0 0",
            fontFamily: "var(--f-body)",
            fontSize: 11,
            color: C.text25,
            lineHeight: 1.6,
            wordBreak: "keep-all",
          }}
        >
          {isFirst ? "이전 버튼은 첫 질문이라 비활성화되어 있습니다. " : ""}
          {!hasSelection ? "다음 버튼은 선택지를 하나 고른 뒤 활성화됩니다." : ""}
        </p>
      )}
    </div>
  );
}

function ScoreBars({ ranked, total }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {ranked.map((row) => {
        const pct = total > 0 ? row.score / total : 0;
        return (
          <div key={row.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: 12,
                  color: row.score === ranked[0].score ? row.accent : C.text45,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--f-display-en)",
                  fontSize: 12,
                  color: C.text35,
                }}
              >
                {row.score}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "oklch(0.16 0.01 265 / 0.55)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: row.score === 0 ? 0 : `${Math.max(4, Math.round(pct * 100))}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${row.accent}, ${alpha(row.accent, 22)})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ResultPanel({ scoreState, answeredCount, onReview, onRestart, isMobile }) {
  const result = scoreState.result;
  const character = findCharacter(result.characterId);

  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${alpha(result.accent, 12)}, ${C.bgCard})`,
        border: `1px solid ${alpha(result.accent, 34)}`,
        padding: isMobile ? "26px 18px" : "38px 34px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 80% 0%, ${alpha(result.accent, 22)}, transparent 34%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <span
          style={{
            display: "block",
            fontFamily: "var(--f-display-en)",
            fontSize: 11,
            letterSpacing: 0,
            color: result.accent,
            marginBottom: 10,
          }}
        >
          Your Prism Priority
        </span>
        <h2
          style={{
            fontFamily: "var(--f-display-kr)",
            fontSize: isMobile ? "clamp(26px,7vw,34px)" : "clamp(34px,3.6vw,52px)",
            fontWeight: 700,
            lineHeight: 1.2,
            color: C.white,
            margin: "0 0 12px",
            wordBreak: "keep-all",
          }}
        >
          {result.label}
        </h2>
        <p
          style={{
            fontFamily: "var(--f-body)",
            fontSize: isMobile ? 13 : 15,
            lineHeight: 1.85,
            color: C.text55,
            margin: "0 0 28px",
            wordBreak: "keep-all",
          }}
        >
          {result.short} 총 {answeredCount}개 답변 중 가장 강하게 드러난 성향입니다.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "0.92fr 1.08fr",
            gap: isMobile ? 18 : 24,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              border: `1px solid ${alpha(result.accent, 22)}`,
              background: "oklch(0.09 0.01 265 / 0.62)",
              padding: 18,
            }}
          >
            {character && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "76px 1fr",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: 18,
                }}
              >
                <img
                  src={character.thumbnail}
                  alt={`${character.name} 썸네일`}
                  style={{
                    width: 76,
                    height: 76,
                    objectFit: "cover",
                    border: `1px solid ${alpha(character.color, 45)}`,
                  }}
                />
                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--f-display-en)",
                      fontSize: 10,
                      letterSpacing: 0,
                      color: result.accent,
                      marginBottom: 6,
                    }}
                  >
                    어울리는 캐릭터
                  </span>
                  <strong
                    style={{
                      display: "block",
                      fontFamily: "var(--f-display-kr)",
                      fontSize: 22,
                      color: C.white,
                      marginBottom: 4,
                    }}
                  >
                    {character.name}
                  </strong>
                  <span
                    style={{
                      fontFamily: "var(--f-body)",
                      fontSize: 12,
                      color: C.text35,
                      lineHeight: 1.6,
                    }}
                  >
                    {character.role}
                  </span>
                </div>
              </div>
            )}
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: 13,
                lineHeight: 1.8,
                color: C.text45,
                margin: "0 0 20px",
                wordBreak: "keep-all",
              }}
            >
              {result.characterReason}
            </p>
            <ScoreBars ranked={scoreState.ranked} total={QUESTION_ITEMS.length} />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["시작상황", result.startSituation],
              ["유저 페르소나 컨셉", result.persona],
              ["플레이 추천", result.playStyle],
            ].map(([title, body]) => (
              <div
                key={title}
                style={{
                  border: `1px solid ${C.border06}`,
                  background: C.bgCard,
                  padding: "18px 18px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--f-display-kr)",
                    fontSize: 14,
                    color: result.accent,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </span>
                <p
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: 13,
                    lineHeight: 1.82,
                    color: C.text55,
                    margin: 0,
                    wordBreak: "keep-all",
                  }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 10,
            marginTop: 24,
          }}
        >
          <a
            href={EDENCHAT_PLAYER_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 46,
              padding: "0 24px",
              border: `1px solid ${alpha(result.accent, 65)}`,
              background: `linear-gradient(135deg, ${alpha(result.accent, 32)}, ${alpha(C.gold, 18)})`,
              color: C.white,
              textDecoration: "none",
              fontFamily: "var(--f-body)",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            이 콘셉트로 챗봇 플레이 시작
          </a>
          <button
            type="button"
            onClick={onReview}
            style={{
              minHeight: 46,
              padding: "0 18px",
              border: `1px solid ${C.border10}`,
              background: C.bgCard,
              color: C.text55,
              cursor: "pointer",
              fontFamily: "var(--f-body)",
              fontSize: 13,
            }}
          >
            답변 다시 보기
          </button>
          <button
            type="button"
            onClick={onRestart}
            style={{
              minHeight: 46,
              padding: "0 18px",
              border: `1px solid ${C.border10}`,
              background: C.bgCard,
              color: C.text55,
              cursor: "pointer",
              fontFamily: "var(--f-body)",
              fontSize: 13,
            }}
          >
            처음부터 다시
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PrismPriorityTest() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [ref, visible] = useReveal(0.12);
  const [answers, setAnswers] = useState(createEmptyAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const answeredCount = getAnsweredCount(answers);
  const scoreState = useMemo(() => getScoreState(answers), [answers]);
  const currentQuestion = QUESTION_ITEMS[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const activeId = showResult
    ? scoreState.result.id
    : selectedAnswer === null
      ? currentQuestion.options[0].key
      : currentQuestion.options[selectedAnswer].key;
  const progress = answeredCount / QUESTION_ITEMS.length;

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  function handleSelect(optionIndex) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  }

  function handlePrevious() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    if (answers[currentIndex] === null) return;
    if (currentIndex === QUESTION_ITEMS.length - 1) {
      setShowResult(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(QUESTION_ITEMS.length - 1, prev + 1));
  }

  function handleRestart() {
    setAnswers(createEmptyAnswers());
    setCurrentIndex(0);
    setShowResult(false);
  }

  function handleReview() {
    const firstUnanswered = getFirstUnanswered(answers);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setShowResult(false);
  }

  return (
    <PageLayout>
      <Seo
        title="프로듀스 프리즘 프라이오리티 테스트"
        description="18문답으로 프라임시티 챗봇을 어떤 캐릭터, 시작상황, 유저 페르소나로 즐기면 좋을지 추천합니다."
        path="/prism-priority-test"
      />
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <BackButton onBack={handleBack} />

        <div
          style={{
            textAlign: "center",
            marginTop: isMobile ? 34 : 48,
            marginBottom: isMobile ? 30 : 44,
          }}
        >
          <span
            style={{
              fontFamily: "var(--f-display-en)",
              fontSize: isMobile ? 10 : 12,
              letterSpacing: 0,
              color: C.gold,
              display: "block",
              marginBottom: 12,
            }}
          >
            Produce Prism Priority
          </span>
          <h1
            style={{
              fontFamily: "var(--f-display-kr)",
              fontSize: isMobile ? "clamp(28px,8vw,38px)" : "clamp(42px,5vw,68px)",
              fontWeight: 700,
              lineHeight: 1.16,
              color: C.white,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            프라임시티를 어떻게 시작할까?
          </h1>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: isMobile ? 13 : 15,
              lineHeight: 1.9,
              color: C.text45,
              maxWidth: 700,
              margin: isMobile ? "18px auto 0" : "22px auto 0",
              wordBreak: "keep-all",
              fontWeight: 300,
            }}
          >
            18개의 선택으로 어울리는 캐릭터, 첫 장면, 유저 페르소나를 추천합니다.
            각 결과 유형은 같은 비율로 배치되어 답변 방향에 따라 골고루 나올 수 있습니다.
          </p>
        </div>

        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "0.94fr 1.06fr",
            gap: isMobile ? 18 : 24,
            alignItems: "start",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition:
              "opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <PrismSignal activeId={activeId} progress={progress} isMobile={isMobile} />
            <div
              style={{
                border: `1px solid ${C.border06}`,
                background: C.bgCard,
                padding: "16px 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--f-display-kr)",
                    fontSize: 13,
                    color: C.text55,
                  }}
                >
                  진행 상태
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-display-en)",
                    fontSize: 12,
                    color: C.gold,
                  }}
                >
                  {answeredCount} / {QUESTION_ITEMS.length}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "oklch(0.16 0.01 265 / 0.55)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.round(progress * 100)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.gold}, ${RESULT_TYPES[activeId].accent})`,
                    transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
                  }}
                />
              </div>
            </div>
          </div>

          {showResult ? (
            <ResultPanel
              scoreState={scoreState}
              answeredCount={answeredCount}
              onReview={handleReview}
              onRestart={handleRestart}
              isMobile={isMobile}
            />
          ) : (
            <QuestionPanel
              answers={answers}
              currentIndex={currentIndex}
              onSelect={handleSelect}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRestart={handleRestart}
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}
