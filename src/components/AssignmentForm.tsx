import { useEffect, useRef, useState } from 'react'
import type { Assignment, Subject } from '../types'
import { fromLocalInput, toLocalInput } from '../lib/deadline'

export type AssignmentDraft = {
  title: string
  subjectId: string
  dueAt: string
  link?: string
}

type Props = {
  open: boolean
  subjects: Subject[]
  /** null이면 새 과제 */
  editing: Assignment | null
  onSave: (draft: AssignmentDraft) => void
  onClose: () => void
}

function defaultDue(): string {
  const d = new Date()
  d.setHours(23, 59, 0, 0)
  return toLocalInput(d.toISOString())
}

export function AssignmentForm({ open, subjects, editing, onSave, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [due, setDue] = useState(defaultDue)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')

  // 열릴 때마다 편집 대상으로 폼을 초기화한다.
  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setSubjectId(editing?.subjectId ?? subjects[0]?.id ?? '')
    setDue(editing ? toLocalInput(editing.dueAt) : defaultDue())
    setLink(editing?.link ?? '')
    setError('')
  }, [open, editing, subjects])

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('제목을 입력해 주세요.')
      return
    }
    if (!due) {
      setError('마감일을 입력해 주세요.')
      return
    }
    onSave({
      title: trimmedTitle,
      subjectId,
      dueAt: fromLocalInput(due),
      link: link.trim() || undefined,
    })
  }

  return (
    // Esc는 cancel 후 close로 이어지므로 close 하나만 듣는다 (onClose 중복 호출 방지).
    <dialog className="dialog" ref={dialogRef} onClose={onClose}>
      <form className="dialog-form" onSubmit={submit}>
        <h2 className="dialog-title">{editing ? '과제 편집' : '과제 추가'}</h2>

        <label className="field">
          <span className="field-label">제목</span>
          <input
            className="field-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 과제 3 — 다이나믹 프로그래밍 5문제"
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field-label">과목</span>
          <select
            className="field-input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.length === 0 && <option value="">과목을 먼저 추가하세요</option>}
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field-label">마감일</span>
          <input
            className="field-input"
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">제출 링크</span>
          <input
            className="field-input"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
          />
        </label>

        {error && (
          <p className="dialog-error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button className="btn btn-quiet" type="button" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-solid" type="submit">
            {editing ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
