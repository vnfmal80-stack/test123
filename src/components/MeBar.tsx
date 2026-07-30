import { useRef, useState } from 'react'
import type { Member } from '../types'

type Props = {
  members: Member[]
  me: string | null
  onSelectMe: (id: string | null) => void
  onAddMember: (name: string) => void
  onExport: () => void
  onImport: (text: string) => void
}

export function MeBar({ members, me, onSelectMe, onAddMember, onExport, onImport }: Props) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function submitMember(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAddMember(trimmed)
    setName('')
    setAdding(false)
  }

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onImport(await file.text())
    // 같은 파일을 다시 고를 수 있게 초기화한다.
    e.target.value = ''
  }

  return (
    <div className="mebar">
      <div className="mebar-me">
        <label className="mebar-label" htmlFor="me-select">
          나
        </label>
        <select
          id="me-select"
          className="mebar-select"
          value={me ?? ''}
          onChange={(e) => onSelectMe(e.target.value || null)}
        >
          <option value="">고르지 않음</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {adding ? (
          <form className="mebar-add" onSubmit={submitMember}>
            <input
              className="mebar-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              aria-label="새 멤버 이름"
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
            멤버 추가
          </button>
        )}
      </div>

      <div className="mebar-io">
        <button className="btn btn-quiet" type="button" onClick={onExport}>
          내보내기
        </button>
        <button className="btn btn-quiet" type="button" onClick={() => fileRef.current?.click()}>
          가져오기
        </button>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept=".json,application/json"
          onChange={pickFile}
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
