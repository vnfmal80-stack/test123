import type { Board } from '../types'
import { seedBoard } from './seed'

/**
 * 이 파일이 유일한 영속성 접점이다.
 * 컴포넌트는 localStorage를 직접 부르지 않는다 — 나중에 백엔드를 붙일 때
 * 이 파일의 네 함수만 교체하면 되도록 격리해 둔다.
 */
const BOARD_KEY = 'checkcheck.board.v1'
const ME_KEY = 'checkcheck.me.v1'

export function loadBoard(): Board {
  try {
    const raw = localStorage.getItem(BOARD_KEY)
    if (!raw) return seedBoard()
    return parseBoard(JSON.parse(raw))
  } catch {
    // 손상된 데이터로 빈 화면을 보여주는 대신 시드로 복구한다.
    return seedBoard()
  }
}

export function saveBoard(board: Board): void {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board))
  } catch {
    // 저장 용량 초과 등. 화면 상태는 유지되므로 조용히 넘긴다.
  }
}

export function loadMe(): string | null {
  try {
    return localStorage.getItem(ME_KEY)
  } catch {
    return null
  }
}

export function saveMe(memberId: string | null): void {
  try {
    if (memberId) localStorage.setItem(ME_KEY, memberId)
    else localStorage.removeItem(ME_KEY)
  } catch {
    // 무시
  }
}

/* ---------- 내보내기 · 가져오기 ---------- */

export function exportFilename(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `과제판_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.json`
}

export function toJson(board: Board): string {
  return JSON.stringify(board, null, 2)
}

/** 검증에 실패하면 사유를 담아 던진다. 호출부가 사용자에게 그대로 보여준다. */
export function fromJson(text: string): Board {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('JSON 형식이 아닙니다. 내보내기로 받은 파일인지 확인해 주세요.')
  }
  return parseBoard(data)
}

function parseBoard(data: unknown): Board {
  if (!isRecord(data)) throw new Error('파일 내용이 보드 데이터가 아닙니다.')
  if (data.version !== 1) throw new Error(`지원하지 않는 버전입니다: ${String(data.version)}`)

  const members = asArray(data.members, '멤버 목록').map((m, i) => {
    if (!isRecord(m) || typeof m.id !== 'string' || typeof m.name !== 'string') {
      throw new Error(`${i + 1}번째 멤버에 id 또는 이름이 없습니다.`)
    }
    return { id: m.id, name: m.name }
  })

  const subjects = asArray(data.subjects, '과목 목록').map((s, i) => {
    if (!isRecord(s) || typeof s.id !== 'string' || typeof s.name !== 'string') {
      throw new Error(`${i + 1}번째 과목에 id 또는 이름이 없습니다.`)
    }
    return { id: s.id, name: s.name, code: typeof s.code === 'string' ? s.code : s.name.slice(0, 2) }
  })

  const assignments = asArray(data.assignments, '과제 목록').map((a, i) => {
    if (!isRecord(a) || typeof a.id !== 'string' || typeof a.title !== 'string') {
      throw new Error(`${i + 1}번째 과제에 id 또는 제목이 없습니다.`)
    }
    if (typeof a.dueAt !== 'string' || Number.isNaN(new Date(a.dueAt).getTime())) {
      throw new Error(`과제 "${a.title}"의 마감일을 읽을 수 없습니다.`)
    }
    return {
      id: a.id,
      subjectId: typeof a.subjectId === 'string' ? a.subjectId : '',
      title: a.title,
      dueAt: a.dueAt,
      steps: asArray(a.steps ?? [], '하위 항목')
        .filter(isRecord)
        .map((s, j) => ({
          id: typeof s.id === 'string' ? s.id : `st${j}`,
          label: typeof s.label === 'string' ? s.label : '',
          done: Boolean(s.done),
        })),
      link: typeof a.link === 'string' && a.link ? a.link : undefined,
      notes: asArray(a.notes ?? [], '메모')
        .filter(isRecord)
        .map((n, j) => ({
          id: typeof n.id === 'string' ? n.id : `n${j}`,
          memberId: typeof n.memberId === 'string' ? n.memberId : '',
          body: typeof n.body === 'string' ? n.body : '',
          at: typeof n.at === 'string' ? n.at : new Date().toISOString(),
        })),
      submissions: normalizeSubmissions(a.submissions, members.map((m) => m.id)),
    }
  })

  return { version: 1, members, subjects, assignments }
}

function normalizeSubmissions(value: unknown, memberIds: string[]): Record<string, string | null> {
  const source = isRecord(value) ? value : {}
  const out: Record<string, string | null> = {}
  // 멤버 목록을 기준으로 채운다 — 누락된 멤버는 미제출로, 없는 멤버 항목은 버린다.
  for (const id of memberIds) {
    const v = source[id]
    out[id] = typeof v === 'string' && v ? v : null
  }
  return out
}

function asArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label}이 배열이 아닙니다.`)
  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
