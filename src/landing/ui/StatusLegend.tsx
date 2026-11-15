import { STATUS_GLYPH, STATUS_LABEL, STATUS_MEANING } from './format'
import type { Status } from '../engine'

const ORDER: Status[] = ['PASS', 'WARNING', 'FAIL', 'NOT_EVALUATED', 'INFO']

/** Plain-language key for the status chips. The wording matches how engine.ts assigns each status. */
export default function StatusLegend() {
  return (
    <details className="ld-legend">
      <summary>What do Pass, Warning and Fail mean?</summary>
      <p className="ld-legend-lead"><b>Warning is not a failure.</b> It means "this may work, but check it first". The reason is written next to it.</p>
      <dl>
        {ORDER.map((s) => (
          <div key={s}>
            <dt><span className={`ld-chip st-${s}`}><b aria-hidden>{STATUS_GLYPH[s]}</b>{STATUS_LABEL[s]}</span></dt>
            <dd>{STATUS_MEANING[s]}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
