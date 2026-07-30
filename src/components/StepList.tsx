import { useState } from 'react'
import type { Step } from '../types'

type Props = {
  steps: Step[]
  onToggle: (stepId: string) => void
  onAdd: (label: string) => void
  onRemove: (stepId: string) => void
}

export function StepList({ steps, onToggle, onAdd, onRemove }: Props) {
  const [label, setLabel] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setLabel('')
  }

  return (
    <div className="steps">
      <h3 className="detail-heading">단계</h3>

      {steps.length === 0 ? (
        <p className="detail-empty">단계를 추가하면 진행률이 계산됩니다.</p>
      ) : (
        <ul className="steps-list">
          {steps.map((s) => (
            <li key={s.id} className="steps-item">
              <label className="steps-check">
                <input type="checkbox" checked={s.done} onChange={() => onToggle(s.id)} />
                <span className={s.done ? 'steps-label is-done' : 'steps-label'}>{s.label}</span>
              </label>
              <button
                className="btn btn-icon"
                type="button"
                onClick={() => onRemove(s.id)}
                aria-label={`단계 "${s.label}" 삭제`}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="steps-add" onSubmit={submit}>
        <input
          className="mebar-input"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="단계 추가"
          aria-label="새 단계 이름"
        />
        <button className="btn btn-quiet" type="submit">
          추가
        </button>
      </form>
    </div>
  )
}
