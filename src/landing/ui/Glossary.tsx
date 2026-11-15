const TERMS: [string, string][] = [
  ['Gating', 'A check that can change the verdict. Rows marked "not gating" are shown for context only.'],
  ['Horizon', 'The skyline seen from the site. The Moon has no air, so it is set by nearby terrain or by the curve of the Moon itself.'],
  ['Earthset / Earthrise', 'When Earth drops below or climbs above the horizon, as seen from the site. Without a clear view of Earth there is no direct radio link.'],
  ['Direct-to-Earth', 'Radio contact with Earth without a relay satellite. Here it is a geometric line-of-sight check, not a full link calculation.'],
  ['Slope baseline', 'The distance a slope is measured across. The same ground gives different slopes at 100 m and at 1.6 km, so figures are only comparable on the same baseline.'],
  ['DEM (terrain model)', 'A grid of ground heights. Its resolution is how big one grid cell is. Coarse cells can hide small hills and shadows.'],
  ['EVA', 'Extravehicular activity: astronauts or rovers going out from the lander. In NYXOS it is a radius around the landing point.'],
  ['PSR', 'Permanently shadowed region: ground the Sun never reaches. It is very cold, so ice could survive there. Being in one is evidence, not proof, of ice.'],
  ['Cold trap', 'Ground cold enough for water ice to stay stable for a very long time.'],
  ['LOLA', 'The laser altimeter on NASA\'s Lunar Reconnaissance Orbiter. It measured the Moon\'s heights, which most of the terrain data comes from.'],
  ['Diviner', 'The heat-measuring instrument on the same orbiter. It gives surface temperatures.'],
  ['Libration', 'The Moon\'s slow wobble, which changes where Earth appears in the sky from a given site.'],
]

/** Plain-language definitions of the technical terms used on the Landing and Compare pages. */
export default function Glossary() {
  return (
    <details className="ld-legend ld-gloss">
      <summary>Glossary: what do these terms mean?</summary>
      <dl>
        {TERMS.map(([t, d]) => (
          <div key={t}><dt><b>{t}</b></dt><dd>{d}</dd></div>
        ))}
      </dl>
    </details>
  )
}
