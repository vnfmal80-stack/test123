import type { ReactNode } from 'react'
import type { Band } from '../types'
import { BAND_LABEL } from '../lib/deadline'

type Props = {
  band: Band
  count: number
  /** 로드 시 스태거 지연에만 쓴다 */
  index: number
  children: ReactNode
}

export function BandSection({ band, count, index, children }: Props) {
  return (
    <section
      className={`band band-${band}`}
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`${BAND_LABEL[band]} ${count}건`}
    >
      <header className="band-head">
        <h2 className="band-label">{BAND_LABEL[band]}</h2>
        <span className="band-rule" aria-hidden="true" />
        <span className="band-count">{count}건</span>
      </header>
      <div className="band-list">{children}</div>
    </section>
  )
}
