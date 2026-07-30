import type { Assignment, Member, Step } from '../types'

export function stepProgress(steps: Step[]): { done: number; total: number; pct: number } {
  const total = steps.length
  const done = steps.filter((s) => s.done).length
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) }
}

export function submitCount(
  assignment: Assignment,
  members: Member[],
): { done: number; total: number } {
  const done = members.filter((m) => assignment.submissions[m.id]).length
  return { done, total: members.length }
}

export function hasSubmitted(assignment: Assignment, memberId: string | null): boolean {
  return memberId ? Boolean(assignment.submissions[memberId]) : false
}
