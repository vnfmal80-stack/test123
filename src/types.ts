export type Member = { id: string; name: string }

/** code: 탭과 카드에서 과목을 구분하는 2글자 모노 코드 (색 대신 글자로 구분한다) */
export type Subject = { id: string; name: string; code: string }

export type Step = { id: string; label: string; done: boolean }

export type Note = { id: string; memberId: string; body: string; at: string }

export type Assignment = {
  id: string
  subjectId: string
  title: string
  /** ISO. 마감 시각까지 보관하되 밴드·D-day는 날짜 단위로 계산한다. */
  dueAt: string
  steps: Step[]
  link?: string
  notes: Note[]
  /** memberId -> 제출 ISO | null(미제출) */
  submissions: Record<string, string | null>
}

export type Board = {
  version: 1
  members: Member[]
  subjects: Subject[]
  assignments: Assignment[]
}

export type Band = 'overdue' | 'now' | 'week' | 'later'
