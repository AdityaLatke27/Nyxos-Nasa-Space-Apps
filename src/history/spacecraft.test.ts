import { describe, expect, it } from 'vitest'
import { MISSIONS } from './data'
import { SOURCES, SPACECRAFT, spacecraftOf } from './spacecraft'

const files = Object.keys(import.meta.glob('../../public/history/models/*.glb', { query: '?url', eager: false }))

describe('spacecraft records', () => {
  it('every mission has at least one spacecraft, and ids are unique', () => {
    for (const m of MISSIONS) expect(spacecraftOf(m.id).length, m.id).toBeGreaterThan(0)
    expect(new Set(SPACECRAFT.map((s) => s.id)).size).toBe(SPACECRAFT.length)
  })
  it('spacecraft only point at real missions', () => {
    const ids = new Set(MISSIONS.map((m) => m.id))
    for (const s of SPACECRAFT) for (const m of s.missions) expect(ids.has(m.id), `${s.id}:${m.id}`).toBe(true)
  })
  it('every cited source exists', () => {
    for (const s of SPACECRAFT) {
      for (const sp of s.specs) expect(SOURCES[sp.src], `${s.id} spec ${sp.label}`).toBeDefined()
      for (const f of Object.values(s.stages).flat()) for (const id of f!.src) expect(SOURCES[id], `${s.id}: ${id}`).toBeDefined()
    }
  })
  it('every model file exists and carries credit and licence; no file is shared between spacecraft', () => {
    const urls = new Set<string>()
    for (const s of SPACECRAFT.filter((x) => x.model)) {
      const m = s.model!
      expect(files.includes('../../public' + m.url), s.id).toBe(true)
      expect(m.credit.length).toBeGreaterThan(3)
      expect(m.licence.length).toBeGreaterThan(3)
      expect(urls.has(m.url), `${s.id} reuses ${m.url}`).toBe(false)
      urls.add(m.url)
    }
  })
})
