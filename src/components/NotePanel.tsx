import { useState } from 'react'
import type { Member, Note } from '../types'
import { formatStampTime } from '../lib/deadline'

type Props = {
  notes: Note[]
  members: Member[]
  me: string | null
  onAdd: (body: string) => void
  onRemove: (noteId: string) => void
}

export function NotePanel({ notes, members, me, onAdd, onRemove }: Props) {
  const [body, setBody] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setBody('')
  }

  function nameOf(memberId: string): string {
    return members.find((m) => m.id === memberId)?.name ?? '알 수 없음'
  }

  return (
    <div className="notes">
      <h3 className="detail-heading">메모</h3>

      {notes.length === 0 ? (
        <p className="detail-empty">아직 메모가 없습니다.</p>
      ) : (
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id} className="notes-item">
              <div className="notes-main">
                <p className="notes-meta">
                  <span className="notes-author">{nameOf(n.memberId)}</span>
                  <span className="notes-time">{formatStampTime(n.at)}</span>
                </p>
                <p className="notes-body">{n.body}</p>
              </div>
              <button
                className="btn btn-icon notes-remove"
                type="button"
                onClick={() => onRemove(n.id)}
                aria-label="메모 삭제"
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

      <form className="notes-add" onSubmit={submit}>
        <textarea
          className="notes-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={me ? '메모 남기기' : '먼저 위에서 "나"를 고르세요'}
          aria-label="새 메모"
          rows={2}
          disabled={!me}
        />
        <button className="btn btn-quiet" type="submit" disabled={!me}>
          남기기
        </button>
      </form>
    </div>
  )
}
