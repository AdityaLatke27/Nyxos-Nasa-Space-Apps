import type { Status } from '../engine'

export const STATUS_LABEL: Record<Status, string> = {
  PASS: 'Pass',
  WARNING: 'Warning',
  FAIL: 'Fail',
  NOT_EVALUATED: 'Not evaluated',
  INFO: 'Info',
}
/** One-line plain-language meaning of each status (also used as the chip tooltip). */
export const STATUS_MEANING: Record<Status, string> = {
  PASS: 'Meets the limit, with margin, and the data is good enough to say so.',
  WARNING: 'Not a failure. It may work, but only just, only part of the time, or the data is too coarse to be sure. Read the reason next to it.',
  FAIL: 'Does not meet the limit.',
  NOT_EVALUATED: 'There is no data for this, so NYXOS gives no verdict. It does not mean good or bad.',
  INFO: 'Context to help you decide. It is not graded.',
}
/** Shape glyph so status never depends on colour alone. */
export const STATUS_GLYPH: Record<Status, string> = { PASS: '✓', WARNING: '▲', FAIL: '✕', NOT_EVALUATED: '–', INFO: 'i' }

export const fmtLat = (v: number) => `${Math.abs(v).toFixed(3)}°${v < 0 ? 'S' : 'N'}`
export const fmtLon = (v: number) => `${Math.abs(v).toFixed(3)}°${v < 0 ? 'W' : 'E'}`
export const fmtUtc = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ') + 'Z'
export function fmtDur(h: number) {
  if (h >= 48) return `${(h / 24).toFixed(1)} d`
  return `${h.toFixed(1)} h`
}

export function windowLines(a: { windows: { litOnly: { start: number; end: number }[]; litAndEarth: { start: number; end: number }[] }; timeline: { startMs: number; stepMs: number } }, which: 'litOnly' | 'litAndEarth', limit = 6) {
  const t = a.timeline
  return a.windows[which].slice(0, limit).map((r) => `${fmtUtc(t.startMs + r.start * t.stepMs)} → ${fmtUtc(t.startMs + (r.end - 1) * t.stepMs)}`)
}
