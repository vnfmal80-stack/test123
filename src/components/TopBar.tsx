import { formatToday } from '../lib/deadline'

type Props = {
  /** me가 선택되어 있으면 "내가 낼 것", 아니면 "미제출 있는 과제" */
  mineOutstanding: number | null
  boardOutstanding: number
}

export function TopBar({ mineOutstanding, boardOutstanding }: Props) {
  const showMine = mineOutstanding !== null
  const count = showMine ? mineOutstanding : boardOutstanding
  const label = showMine ? '내가 낼 것' : '미제출 있는 과제'

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <h1 className="topbar-title">다했어요</h1>
        <p className="topbar-date">{formatToday()}</p>
        <p className="topbar-count">
          <span className="topbar-count-label">{label}</span>
          <span className="topbar-count-value">{count}</span>
          <span className="topbar-count-unit">건</span>
        </p>
      </div>
    </header>
  )
}
