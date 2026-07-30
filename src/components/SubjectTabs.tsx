import { useState } from 'react'
import type { Subject } from '../types'

type Props = {
  subjects: Subject[]
  active: string | 'all'
  counts: Record<string, number>
  totalCount: number
  onSelect: (id: string | 'all') => void
  onAddSubject: (name: string) => void
}

export function SubjectTabs({
  subjects,
  active,
  counts,
  totalCount,
  onSelect,
  onAddSubject,
}: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAddSubject(trimmed)
    setName('')
    setAdding(false)
  }

  return (
    <div className="tabs">
      <div className="tabs-rail">
        <button
          className="tab"
          type="button"
          aria-pressed={active === 'all'}
          onClick={() => onSelect('all')}
        >
          <span className="tab-name">전체</span>
          <span className="tab-count">{totalCount}</span>
        </button>

        {subjects.map((s) => (
          <button
            key={s.id}
            className="tab"
            type="button"
            aria-pressed={active === s.id}
            onClick={() => onSelect(s.id)}
          >
            <span className="tab-code">{s.code}</span>
            <span className="tab-name">{s.name}</span>
            <span className="tab-count">{counts[s.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {adding ? (
        <form className="tabs-add" onSubmit={submit}>
          <input
            className="mebar-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="과목 이름"
            aria-label="새 과목 이름"
            autoFocus
          />
          <button className="btn btn-quiet" type="submit">
            추가
          </button>
          <button
            className="btn btn-quiet"
            type="button"
            onClick={() => {
              setAdding(false)
              setName('')
            }}
          >
            취소
          </button>
        </form>
      ) : (
        <button className="btn btn-quiet" type="button" onClick={() => setAdding(true)}>
          과목 추가
        </button>
      )}
    </div>
  )
}
