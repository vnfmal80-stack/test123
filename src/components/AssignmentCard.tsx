import { useState } from 'react'
import type { Assignment, Member, Subject } from '../types'
import { dayDiff, formatDday, formatDue } from '../lib/deadline'
import { stepProgress } from '../lib/progress'
import { StampRow } from './StampRow'
import { StepList } from './StepList'
import { NotePanel } from './NotePanel'

type Props = {
  assignment: Assignment
  subject: Subject | undefined
  members: Member[]
  me: string | null
  onToggleSubmission: (memberId: string) => void
  onToggleStep: (stepId: string) => void
  onAddStep: (label: string) => void
  onRemoveStep: (stepId: string) => void
  onAddNote: (body: string) => void
  onRemoveNote: (noteId: string) => void
  onEdit: () => void
  onDelete: () => void
}

export function AssignmentCard({
  assignment,
  subject,
  members,
  me,
  onToggleSubmission,
  onToggleStep,
  onAddStep,
  onRemoveStep,
  onAddNote,
  onRemoveNote,
  onEdit,
  onDelete,
}: Props) {
  const [open, setOpen] = useState(false)
  const diff = dayDiff(assignment.dueAt)
  const overdue = diff < 0
  const { done, total, pct } = stepProgress(assignment.steps)
  const detailId = `detail-${assignment.id}`

  return (
    <article className={overdue ? 'card is-overdue' : 'card'}>
      <div className="card-head">
        {subject && <span className="card-code">{subject.code}</span>}
        <h2 className="card-title">{assignment.title}</h2>
        <span className={overdue ? 'card-dday is-overdue' : 'card-dday'}>{formatDday(diff)}</span>
      </div>

      <p className="card-due">{formatDue(assignment.dueAt)}</p>

      {total > 0 && (
        <div className="card-progress">
          <div className="bar" role="img" aria-label={`단계 ${done}개 중 ${total}개 완료`}>
            <div className="bar-fill" style={{ inlineSize: `${pct}%` }} />
          </div>
          <p className="bar-tally">
            {done}/{total} 단계
          </p>
        </div>
      )}

      <StampRow
        assignment={assignment}
        members={members}
        me={me}
        overdue={overdue}
        onToggle={onToggleSubmission}
      />

      <div className="card-actions">
        {assignment.link && (
          <a className="card-link" href={assignment.link} target="_blank" rel="noopener noreferrer">
            제출 링크
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path
                d="M6 3h7v7M13 3L4 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}

        <button
          className="btn btn-quiet"
          type="button"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '접기' : '단계·메모'}
          {!open && assignment.notes.length > 0 && (
            <span className="card-notecount">{assignment.notes.length}</span>
          )}
        </button>

        <button className="btn btn-quiet" type="button" onClick={onEdit}>
          편집
        </button>
        <button className="btn btn-quiet" type="button" onClick={onDelete}>
          삭제
        </button>
      </div>

      {open && (
        <div className="card-detail" id={detailId}>
          <StepList
            steps={assignment.steps}
            onToggle={onToggleStep}
            onAdd={onAddStep}
            onRemove={onRemoveStep}
          />
          <NotePanel
            notes={assignment.notes}
            members={members}
            me={me}
            onAdd={onAddNote}
            onRemove={onRemoveNote}
          />
        </div>
      )}
    </article>
  )
}
