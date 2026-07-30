import type { Band } from '../types'

const MS_PER_DAY = 86_400_000

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * 오늘과 마감일 사이의 "날짜" 차. 시각 차가 아니라 자정 경계를 기준으로 센다.
 * 양수 = 남음, 0 = 오늘, 음수 = 지남.
 */
export function dayDiff(dueAt: string, now: Date = new Date()): number {
  return Math.round((startOfDay(new Date(dueAt)) - startOfDay(now)) / MS_PER_DAY)
}

export function band(diff: number): Band {
  if (diff < 0) return 'overdue'
  if (diff <= 1) return 'now'
  if (diff <= 7) return 'week'
  return 'later'
}

export const BAND_ORDER: Band[] = ['overdue', 'now', 'week', 'later']

export const BAND_LABEL: Record<Band, string> = {
  overdue: '지남',
  now: '오늘·내일',
  week: '이번 주',
  later: '이후',
}

export function formatDday(diff: number): string {
  if (diff === 0) return 'D-DAY'
  return diff > 0 ? `D-${diff}` : `D+${-diff}`
}

const dueFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatDue(dueAt: string): string {
  return dueFormat.format(new Date(dueAt))
}

const todayFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

export function formatToday(now: Date = new Date()): string {
  return todayFormat.format(now)
}

const stampFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatStampTime(at: string): string {
  return stampFormat.format(new Date(at))
}

/** <input type="datetime-local"> 왕복용. 로컬 시간대를 유지한다. */
export function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInput(value: string): string {
  return new Date(value).toISOString()
}
