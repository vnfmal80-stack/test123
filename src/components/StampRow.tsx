import { useEffect, useRef, useState } from 'react'
import type { Assignment, Member } from '../types'
import { angleFor } from '../lib/stampAngle'
import { formatStampTime } from '../lib/deadline'
import { submitCount } from '../lib/progress'

type Props = {
  assignment: Assignment
  members: Member[]
  me: string | null
  overdue: boolean
  onToggle: (memberId: string) => void
}

/** 이름에서 도장에 찍힐 2글자를 뽑는다. 김문수 → 문수, 정우 → 정우 */
function stampLabel(name: string): string {
  return name.length > 2 ? name.slice(-2) : name
}

export function StampRow({ assignment, members, me, overdue, onToggle }: Props) {
  const [pressed, setPressed] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function handleToggle(memberId: string) {
    const willSubmit = !assignment.submissions[memberId]
    onToggle(memberId)
    if (willSubmit) {
      // 도장을 누르는 순간에만 애니메이션을 붙인다 (취소할 때는 조용히).
      setPressed(memberId)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setPressed(null), 220)
    }
  }

  const { done, total } = submitCount(assignment, members)

  return (
    <div className="stamps">
      <p className="stamps-tally">
        <span className="stamps-tally-label">제출</span>
        <span className="stamps-tally-value">
          {done}/{total}
        </span>
      </p>

      <ul className="stamps-row">
        {members.map((m) => {
          const at = assignment.submissions[m.id]
          const submitted = Boolean(at)
          const angle = angleFor(m.id, assignment.id)
          const state = submitted ? 'done' : overdue ? 'late' : 'todo'

          return (
            <li key={m.id}>
              <button
                type="button"
                className={[
                  'stamp',
                  `stamp-${state}`,
                  m.id === me ? 'is-me' : '',
                  pressed === m.id ? 'is-pressing' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--angle': `${submitted ? angle : 0}deg` } as React.CSSProperties}
                aria-pressed={submitted}
                aria-label={
                  submitted
                    ? `${m.name} 제출함, ${formatStampTime(at!)}. 누르면 제출을 취소합니다.`
                    : `${m.name} 미제출. 누르면 제출로 표시합니다.`
                }
                onClick={() => handleToggle(m.id)}
              >
                <span className="stamp-text">{stampLabel(m.name)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
