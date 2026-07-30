import { useEffect, useMemo, useState } from 'react'
import type { Assignment, Band, Board } from './types'
import { BAND_ORDER, band, dayDiff } from './lib/deadline'
import { newId } from './lib/id'
import { exportFilename, fromJson, loadBoard, loadMe, saveBoard, saveMe, toJson } from './lib/storage'
import { TopBar } from './components/TopBar'
import { MeBar } from './components/MeBar'
import { SubjectTabs } from './components/SubjectTabs'
import { BandSection } from './components/BandSection'
import { AssignmentCard } from './components/AssignmentCard'
import { AssignmentForm, type AssignmentDraft } from './components/AssignmentForm'

type Notice = { kind: 'ok' | 'error'; text: string } | null

export default function App() {
  const [board, setBoard] = useState<Board>(loadBoard)
  const [me, setMe] = useState<string | null>(loadMe)
  const [filter, setFilter] = useState<string | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => saveBoard(board), [board])
  useEffect(() => saveMe(me), [me])

  /* ---------- 과제 갱신 ---------- */

  function patch(assignmentId: string, fn: (a: Assignment) => Assignment) {
    setBoard((b) => ({
      ...b,
      assignments: b.assignments.map((a) => (a.id === assignmentId ? fn(a) : a)),
    }))
  }

  function toggleSubmission(assignmentId: string, memberId: string) {
    patch(assignmentId, (a) => ({
      ...a,
      submissions: {
        ...a.submissions,
        [memberId]: a.submissions[memberId] ? null : new Date().toISOString(),
      },
    }))
  }

  function toggleStep(assignmentId: string, stepId: string) {
    patch(assignmentId, (a) => ({
      ...a,
      steps: a.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
    }))
  }

  function addStep(assignmentId: string, label: string) {
    patch(assignmentId, (a) => ({
      ...a,
      steps: [...a.steps, { id: newId('st'), label, done: false }],
    }))
  }

  function removeStep(assignmentId: string, stepId: string) {
    patch(assignmentId, (a) => ({ ...a, steps: a.steps.filter((s) => s.id !== stepId) }))
  }

  function addNote(assignmentId: string, body: string) {
    if (!me) return
    patch(assignmentId, (a) => ({
      ...a,
      notes: [...a.notes, { id: newId('n'), memberId: me, body, at: new Date().toISOString() }],
    }))
  }

  function removeNote(assignmentId: string, noteId: string) {
    patch(assignmentId, (a) => ({ ...a, notes: a.notes.filter((n) => n.id !== noteId) }))
  }

  function deleteAssignment(assignment: Assignment) {
    if (!window.confirm(`"${assignment.title}"을 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBoard((b) => ({ ...b, assignments: b.assignments.filter((a) => a.id !== assignment.id) }))
  }

  function saveAssignment(draft: AssignmentDraft) {
    setBoard((b) => {
      if (editingId) {
        return {
          ...b,
          assignments: b.assignments.map((a) => (a.id === editingId ? { ...a, ...draft } : a)),
        }
      }
      const fresh: Assignment = {
        id: newId('a'),
        ...draft,
        steps: [],
        notes: [],
        submissions: Object.fromEntries(b.members.map((m) => [m.id, null])),
      }
      return { ...b, assignments: [...b.assignments, fresh] }
    })
    setFormOpen(false)
    setEditingId(null)
  }

  /* ---------- 멤버 · 과목 ---------- */

  function addMember(name: string) {
    const member = { id: newId('m'), name }
    setBoard((b) => ({
      ...b,
      members: [...b.members, member],
      // 새 멤버는 모든 과제에서 미제출로 시작한다.
      assignments: b.assignments.map((a) => ({
        ...a,
        submissions: { ...a.submissions, [member.id]: null },
      })),
    }))
  }

  function addSubject(name: string) {
    setBoard((b) => ({
      ...b,
      subjects: [...b.subjects, { id: newId('s'), name, code: name.slice(0, 2) }],
    }))
  }

  /* ---------- 내보내기 · 가져오기 ---------- */

  function exportBoard() {
    const filename = exportFilename()
    const blob = new Blob([toJson(board)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setNotice({ kind: 'ok', text: `${filename} 으로 내보냈습니다.` })
  }

  function importBoard(text: string) {
    try {
      const next = fromJson(text)
      setBoard(next)
      // 가져온 보드에 없는 멤버를 "나"로 남겨두면 메모를 남길 수 없다.
      setMe((current) => (next.members.some((m) => m.id === current) ? current : null))
      setFilter('all')
      setNotice({
        kind: 'ok',
        text: `과제 ${next.assignments.length}건, 멤버 ${next.members.length}명을 가져왔습니다.`,
      })
    } catch (e) {
      setNotice({ kind: 'error', text: e instanceof Error ? e.message : '가져오지 못했습니다.' })
    }
  }

  /* ---------- 파생 ---------- */

  const visible = useMemo(
    () =>
      board.assignments
        .filter((a) => filter === 'all' || a.subjectId === filter)
        .slice()
        .sort((x, y) => new Date(x.dueAt).getTime() - new Date(y.dueAt).getTime()),
    [board.assignments, filter],
  )

  const grouped = useMemo(() => {
    const out = new Map<Band, Assignment[]>(BAND_ORDER.map((b) => [b, []]))
    for (const a of visible) out.get(band(dayDiff(a.dueAt)))!.push(a)
    return out
  }, [visible])

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of board.assignments) counts[a.subjectId] = (counts[a.subjectId] ?? 0) + 1
    return counts
  }, [board.assignments])

  const mineOutstanding = useMemo(
    () => (me ? board.assignments.filter((a) => !a.submissions[me]).length : null),
    [board.assignments, me],
  )

  const boardOutstanding = useMemo(
    () => board.assignments.filter((a) => board.members.some((m) => !a.submissions[m.id])).length,
    [board.assignments, board.members],
  )

  const editing = editingId ? (board.assignments.find((a) => a.id === editingId) ?? null) : null
  const filledBands = BAND_ORDER.filter((b) => grouped.get(b)!.length > 0)

  return (
    <div className="page">
      <TopBar mineOutstanding={mineOutstanding} boardOutstanding={boardOutstanding} />

      <main className="page-inner">
        <MeBar
          members={board.members}
          me={me}
          onSelectMe={setMe}
          onAddMember={addMember}
          onExport={exportBoard}
          onImport={importBoard}
        />

        {notice && (
          <p
            className={notice.kind === 'error' ? 'notice is-error' : 'notice'}
            role={notice.kind === 'error' ? 'alert' : 'status'}
          >
            <span className="notice-text">{notice.text}</span>
            <button
              className="btn btn-icon"
              type="button"
              onClick={() => setNotice(null)}
              aria-label="알림 닫기"
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
          </p>
        )}

        <SubjectTabs
          subjects={board.subjects}
          active={filter}
          counts={subjectCounts}
          totalCount={board.assignments.length}
          onSelect={setFilter}
          onAddSubject={addSubject}
        />

        <div className="page-add">
          <button
            className="btn btn-solid"
            type="button"
            onClick={() => {
              setEditingId(null)
              setFormOpen(true)
            }}
          >
            과제 추가
          </button>
        </div>

        {filledBands.length === 0 ? (
          <p className="page-empty">
            {board.assignments.length === 0
              ? '과제를 추가하면 마감일 순으로 정렬됩니다.'
              : '이 과목에는 과제가 없습니다. 전체를 보거나 과제를 추가하세요.'}
          </p>
        ) : (
          filledBands.map((b, i) => (
            <BandSection key={b} band={b} count={grouped.get(b)!.length} index={i}>
              {grouped.get(b)!.map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  subject={board.subjects.find((s) => s.id === a.subjectId)}
                  members={board.members}
                  me={me}
                  onToggleSubmission={(memberId) => toggleSubmission(a.id, memberId)}
                  onToggleStep={(stepId) => toggleStep(a.id, stepId)}
                  onAddStep={(label) => addStep(a.id, label)}
                  onRemoveStep={(stepId) => removeStep(a.id, stepId)}
                  onAddNote={(body) => addNote(a.id, body)}
                  onRemoveNote={(noteId) => removeNote(a.id, noteId)}
                  onEdit={() => {
                    setEditingId(a.id)
                    setFormOpen(true)
                  }}
                  onDelete={() => deleteAssignment(a)}
                />
              ))}
            </BandSection>
          ))
        )}
      </main>

      <AssignmentForm
        open={formOpen}
        subjects={board.subjects}
        editing={editing}
        onSave={saveAssignment}
        onClose={() => {
          setFormOpen(false)
          setEditingId(null)
        }}
      />
    </div>
  )
}
