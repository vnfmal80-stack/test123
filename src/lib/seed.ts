import type { Board } from '../types'

/** 마감일을 상대 계산해서 언제 처음 열어도 네 밴드가 모두 채워지게 한다. */
function dueIn(days: number, hour = 23, minute = 59): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function submittedAgo(hours: number): string {
  const d = new Date()
  d.setHours(d.getHours() - hours)
  return d.toISOString()
}

export function seedBoard(): Board {
  const members = [
    { id: 'm_moonsu', name: '김문수' },
    { id: 'm_jieun', name: '이지은' },
    { id: 'm_haeun', name: '박하은' },
    { id: 'm_min', name: '최민' },
    { id: 'm_woo', name: '정우' },
  ]

  return {
    version: 1,
    members,
    subjects: [
      { id: 's_algo', name: '알고리즘', code: '알고' },
      { id: 's_ds', name: '자료구조', code: '자구' },
      { id: 's_eng', name: '영작문', code: '영작' },
    ],
    assignments: [
      {
        id: 'a_ds_lab2',
        subjectId: 's_ds',
        title: '랩 2 — 이진 탐색 트리 구현',
        dueAt: dueIn(-2),
        steps: [
          { id: 'st1', label: '삽입·삭제 구현', done: true },
          { id: 'st2', label: '순회 3종', done: true },
          { id: 'st3', label: '균형 회전', done: true },
          { id: 'st4', label: '테스트 케이스', done: false },
          { id: 'st5', label: '보고서', done: false },
        ],
        link: 'https://github.com/example/ds-lab2',
        notes: [
          {
            id: 'n1',
            memberId: 'm_jieun',
            body: '회전 부분 헷갈리면 강의자료 12쪽 그림 보면 됩니다.',
            at: submittedAgo(50),
          },
          { id: 'n2', memberId: 'm_moonsu', body: '테스트 케이스는 같이 짜기로 했어요.', at: submittedAgo(26) },
        ],
        submissions: {
          m_moonsu: submittedAgo(60),
          m_jieun: submittedAgo(72),
          m_haeun: null,
          m_min: null,
          m_woo: submittedAgo(55),
        },
      },
      {
        id: 'a_algo_3',
        subjectId: 's_algo',
        title: '과제 3 — 다이나믹 프로그래밍 5문제',
        dueAt: dueIn(0),
        steps: [
          { id: 'st1', label: '1번 계단 오르기', done: true },
          { id: 'st2', label: '2번 배낭', done: true },
          { id: 'st3', label: '3번 LCS', done: false },
          { id: 'st4', label: '4번 편집 거리', done: false },
        ],
        link: 'https://www.acmicpc.net/workbook/view/example',
        notes: [{ id: 'n3', memberId: 'm_min', body: '3번 반례 하나 찾았습니다. 카톡에 올려둘게요.', at: submittedAgo(4) }],
        submissions: {
          m_moonsu: null,
          m_jieun: submittedAgo(8),
          m_haeun: submittedAgo(20),
          m_min: null,
          m_woo: null,
        },
      },
      {
        id: 'a_eng_essay',
        subjectId: 's_eng',
        title: '에세이 1차 초안 (600단어)',
        dueAt: dueIn(1, 18, 0),
        steps: [
          { id: 'st1', label: '주제 확정', done: true },
          { id: 'st2', label: '개요 작성', done: true },
          { id: 'st3', label: '초안', done: false },
        ],
        notes: [],
        submissions: {
          m_moonsu: submittedAgo(2),
          m_jieun: null,
          m_haeun: null,
          m_min: null,
          m_woo: null,
        },
      },
      {
        id: 'a_ds_4',
        subjectId: 's_ds',
        title: '과제 4 — 해시 테이블 충돌 처리 비교',
        dueAt: dueIn(4),
        steps: [
          { id: 'st1', label: '체이닝 측정', done: true },
          { id: 'st2', label: '개방 주소법 측정', done: false },
          { id: 'st3', label: '그래프 정리', done: false },
        ],
        notes: [],
        submissions: {
          m_moonsu: null,
          m_jieun: null,
          m_haeun: submittedAgo(1),
          m_min: null,
          m_woo: null,
        },
      },
      {
        id: 'a_algo_proj',
        subjectId: 's_algo',
        title: '중간 프로젝트 — 최단경로 시각화',
        dueAt: dueIn(12, 18, 0),
        steps: [
          { id: 'st1', label: '팀 역할 분담', done: true },
          { id: 'st2', label: '다익스트라 코어', done: false },
          { id: 'st3', label: '지도 렌더링', done: false },
          { id: 'st4', label: '발표 자료', done: false },
        ],
        link: 'https://www.notion.so/example-plan',
        notes: [{ id: 'n4', memberId: 'm_woo', body: '지도는 OSM 타일 쓰는 쪽으로 정했습니다.', at: submittedAgo(30) }],
        submissions: {
          m_moonsu: null,
          m_jieun: null,
          m_haeun: null,
          m_min: null,
          m_woo: null,
        },
      },
    ],
  }
}
