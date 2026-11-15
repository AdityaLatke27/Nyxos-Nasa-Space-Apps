/**
 * Spacecraft behind every mission in data.ts.
 *
 * Rules for this file:
 *  - A fact appears only if one of the listed sources states it. Sources are listed with the page they were read from.
 *  - A 3D model appears only where a licensed model of that exact spacecraft exists (see `model`). No model is shared between
 *    unrelated missions. Where none was found, `model` is absent and the viewer says so.
 *  - Stages of the story with no documented fact yet are shown as empty, not filled in.
 */

export interface Source { id: string; title: string; url: string }

export const SOURCES: Record<string, Source> = {
  nasa3d: { id: 'nasa3d', title: 'NASA 3D Resources (free and without copyright; see NASA media usage guidelines)', url: 'https://github.com/nasa/NASA-3D-Resources' },
  media: { id: 'media', title: 'NASA media usage guidelines', url: 'https://www.nasa.gov/nasa-brand-center/images-and-media' },
  lmref: { id: 'lmref', title: 'NASA/Grumman Apollo News Reference: Lunar Module, pages LV-1 to LV-17', url: 'https://www.nasa.gov/wp-content/uploads/static/history/alsj//LM04_Lunar_Module_ppLV1-17.pdf' },
  ch45: { id: 'ch45', title: 'NASA SP-4205, Chariots for Apollo, ch. 4, "Fitting the Lunar Module into Apollo" (mirror)', url: 'https://apolloexplorer.co.uk/books/SP-4205/ch4-5.html' },
  ch47: { id: 'ch47', title: 'NASA SP-4205, Chariots for Apollo, ch. 4, "NASA-Grumman Negotiations" (mirror)', url: 'https://apolloexplorer.co.uk/books/SP-4205/ch4-7.html' },
  sp350: { id: 'sp350', title: 'Apollo Expeditions to the Moon (NASA SP-350), ch. 3.2, "Determining Saturn\'s Configuration" (mirror)', url: 'https://solarviews.com/history/SP-350/ch-3-2.html' },
  asme: { id: 'asme', title: 'ASME, "A Landmark Rocket Sent Humanity to the Moon"', url: 'https://asme.org/topics-resources/content/a-landmark-rocket-sent-humanity-to-the-moon' },
  lro: { id: 'lro', title: 'NASA, "15 Years Ago: Lunar Reconnaissance Orbiter Begins Moon Mapping Mission"', url: 'https://www.nasa.gov/history/15-years-ago-lunar-reconnaissance-orbiter-begins-moon-mapping-mission/' },
  sn: { id: 'sn', title: 'Science News, "Artemis 1\'s Orion capsule returned safely to Earth"', url: 'https://www.sciencenews.org/article/artemis-orion-moon-spacecraft-capsule' },
  wjla: { id: 'wjla', title: 'WJLA, "Artemis II success builds momentum for future missions"', url: 'https://wjla.com/news/nation-world/artemis-ii-success-builds-momentum-for-future-missions-to-the-moon-and-mars-nasa-rice-university-space-science-exploration-artemis-iii-artemis-iv-lunar-landing' },
  nyx: { id: 'nyx', title: 'NYXOS mission records (History page); landing positions carry their own sources', url: '/app/history' },
}

export const STAGES = ['Conception', 'Design and engineering', 'Manufacturing and assembly', 'Testing', 'Launch', 'Journey to the Moon', 'Operations', 'Outcome'] as const
export type Stage = (typeof STAGES)[number]
export interface Fact { text: string; src: string[] }

export type Kind = 'Lander' | 'Orbiter' | 'Rover' | 'Impact probe' | 'Sample-return spacecraft' | 'Relay satellite' | 'Crewed spacecraft' | 'Launch vehicle' | 'Flyby spacecraft'

export interface ModelInfo {
  url: string
  /** the model is normalised for viewing; rotate if the file is Z-up */
  rotateX?: number
  credit: string
  licence: string
  sourceUrl: string
  /** what NYXOS did to the file */
  processing: string
  approximate?: boolean
  note?: string
}

export interface Spacecraft {
  id: string
  name: string
  kind: Kind
  agency: string
  /** missions in data.ts this hardware belongs to, with its role there */
  missions: { id: string; role: string }[]
  summary: string
  model?: ModelInfo
  specs: { label: string; value: string; src: string }[]
  stages: Partial<Record<Stage, Fact[]>>
  /** the model's parts are not individually named, so no component highlighting is offered */
  parts?: string
}

const NASA_MODEL = { credit: 'NASA 3D Resources', licence: 'NASA content, no copyright claimed; credit requested', sourceUrl: SOURCES.nasa3d.url }

export const SPACECRAFT: Spacecraft[] = [
  {
    id: 'apollo-lm', name: 'Apollo Lunar Module', kind: 'Lander', agency: 'NASA, built by Grumman',
    missions: [
      { id: 'apollo11', role: 'LM "Eagle", landed with Armstrong and Aldrin' }, { id: 'apollo12', role: 'LM "Intrepid"' }, { id: 'apollo14', role: 'LM "Antares"' },
      { id: 'apollo15', role: 'LM "Falcon"' }, { id: 'apollo16', role: 'LM "Orion"' }, { id: 'apollo17', role: 'LM "Challenger"' },
    ],
    summary: 'The two-stage lander that took two astronauts to the surface and lifted them back to the orbiting Command and Service Module. The model is a generic Apollo LM, not one specific flight article, and the later J-mission LMs differed in detail.',
    model: { url: '/history/models/apollo-lm.glb', ...NASA_MODEL, credit: 'NASA 3D Resources (model by Michael D. Carbajal, NASA HQ, as credited in the Skylumi 3d-moon data licence list)', processing: 'Used unchanged (Draco-compressed GLB, 717 KB).', note: 'Generic Apollo LM, not specific to one mission.' },
    parts: 'The model has 135 nodes with generic names, so no reliable per-component labels are offered.',
    specs: [
      { label: 'Height, legs extended', value: '22 ft 11 in (about 7.0 m)', src: 'lmref' },
      { label: 'Width across extended landing gear', value: '31 ft (about 9.4 m)', src: 'lmref' },
      { label: 'Ascent stage', value: 'height 12 ft 4 in (3.8 m), diameter 14 ft 1 in (4.3 m)', src: 'lmref' },
      { label: 'Descent stage', value: 'height 10 ft 7 in (3.2 m), diameter 13 ft 10 in (4.2 m)', src: 'lmref' },
      { label: 'Mass at Earth launch (approx.)', value: '36,100 lb (about 16.4 t) with crew and propellant', src: 'lmref' },
      { label: 'Dry mass (approx.)', value: '10,800 lb (about 4.9 t): ascent 4,700 lb, descent 6,100 lb', src: 'lmref' },
      { label: 'Propellant (approx.)', value: 'ascent 5,200 lb, descent 19,500 lb, reaction control 600 lb', src: 'lmref' },
      { label: 'Crew', value: 'two: a Commander and an LM Pilot', src: 'lmref' },
      { label: 'Cabin volume', value: '235 cubic feet (about 6.7 m³)', src: 'lmref' },
      { label: 'Landing gear', value: 'four assemblies, 37 in footpads; designed for 10 ft/s vertical, or 7 ft/s with up to 4 ft/s horizontal', src: 'lmref' },
      { label: 'Electrical interface', value: '28 V DC', src: 'lmref' },
    ],
    stages: {
      Conception: [
        { text: 'In 1960 a Grumman study group led by Thomas J. Kelly began to focus on lunar flight. After Grumman lost the late-1960 Apollo feasibility contracts it kept the study going without NASA funding, with about 50 engineers.', src: ['ch47'] },
        { text: 'Grumman presented a feasibility study summary to the Manned Spacecraft Center in mid-May 1961. Its joint proposal for the Apollo spacecraft recommended lunar-orbit rendezvous, the method Apollo later used.', src: ['ch47'] },
        { text: 'NASA issued requests for proposals for the lander on 25 July 1962. Nine companies submitted proposals.', src: ['ch45'] },
        { text: 'On 7 November 1962 NASA announced that Grumman Aircraft Engineering Corporation of Bethpage, New York, would build the lunar excursion module. Grumman\'s facilities were a major factor in the choice.', src: ['ch45'] },
      ],
      'Design and engineering': [
        { text: 'The LM has two stages. The ascent stage is the control centre with the crew compartment. The descent stage is the launching platform for lift-off and carried about two thirds of the LM\'s launch weight.', src: ['lmref'] },
        { text: 'Planners hoped to reuse Mercury, Gemini and Apollo command and service module parts where possible. The lander subsystems were propulsion, guidance and control, reaction control, electrical power and instrumentation.', src: ['ch45'] },
        { text: 'Contract negotiations began on 19 November 1962 in Houston. The cost-plus-fixed-fee contract was set at $385 million, including a fee of just over $25 million. NASA told Grumman to start development on 14 January 1963, and the contract was signed in early March 1963 at $387.9 million.', src: ['ch47'] },
        { text: 'Neither side fully understood the scope of the work at the start. Grumman\'s Kelly called it "an example of ignorance in action".', src: ['ch47'] },
      ],
      Testing: [
        { text: 'NASA decided to test the lander\'s propulsion systems at White Sands. Astronauts trained on the lunar landing research vehicle, nicknamed the "flying bedstead", which NASA\'s Flight Research Center contracted with Bell for in January 1962.', src: ['ch45'] },
      ],
      Operations: [
        { text: 'Six LMs landed on the Moon, on Apollo 11, 12, 14, 15, 16 and 17 (see those missions).', src: ['nyx'] },
      ],
    },
  },
  {
    id: 'saturn-v', name: 'Saturn V', kind: 'Launch vehicle', agency: 'NASA (Marshall Space Flight Center)',
    missions: [
      { id: 'apollo8', role: 'Launch vehicle' }, { id: 'apollo11', role: 'Launch vehicle' }, { id: 'apollo12', role: 'Launch vehicle' }, { id: 'apollo14', role: 'Launch vehicle' },
      { id: 'apollo15', role: 'Launch vehicle' }, { id: 'apollo16', role: 'Launch vehicle' }, { id: 'apollo17', role: 'Launch vehicle' },
    ],
    summary: 'The three-stage rocket that sent Apollo crews to the Moon. Its first stage had five F-1 engines, and its third stage restarted to send the spacecraft toward the Moon.',
    model: { url: '/history/models/saturn-v.glb', ...NASA_MODEL, processing: 'Used unchanged (GLB, 927 KB).', note: 'Generic Saturn V, not a specific flight vehicle.' },
    parts: 'The model\'s 23 parts are not labelled by stage, so no reliable per-stage highlighting is offered.',
    specs: [
      { label: 'Height', value: '363 ft (about 111 m)', src: 'asme' },
      { label: 'Mass', value: '6.2 million lb (about 2,800 t)', src: 'asme' },
      { label: 'First stage (S-IC)', value: 'five Rocketdyne F-1 engines, 7.6 million lb of thrust at launch (SP-350 gives 7.5 million lb)', src: 'asme' },
      { label: 'Second stage (S-II)', value: 'five Rocketdyne J-2 engines (SP-350: just over a million pounds of thrust)', src: 'asme' },
      { label: 'Third stage (S-IVB)', value: 'one J-2 engine, restarted to send the spacecraft to the Moon; up to 230,000 lb of thrust', src: 'asme' },
      { label: 'Record', value: 'largest payload to low Earth orbit: 141 metric tons', src: 'asme' },
    ],
    stages: {
      Conception: [{ text: 'President John F. Kennedy proposed landing a man on the Moon "in this decade" on 25 May 1961. NASA then had to decide how large a rocket it needed.', src: ['sp350'] }],
      'Design and engineering': [
        { text: 'The Saturn V was designed and engineered at NASA\'s Marshall Space Flight Center in Huntsville, Alabama. Its first stage design was based on a ballistic missile.', src: ['asme'] },
        { text: 'Each F-1 engine was 18 ft tall and 12 ft wide and made about 1.5 million lb of thrust. Rocketdyne made both the F-1 and the J-2 engines.', src: ['asme'] },
      ],
      'Manufacturing and assembly': [{ text: 'Rocketdyne built 65 F-1 engines in total and 152 J-2 engines for Apollo, plus 38 J-2 development engines. The sources read do not name the stage-structure contractors.', src: ['asme'] }],
      Launch: [{ text: 'At launch the first stage burned 4.5 million lb of fuel in 2.5 minutes, reaching about 42 miles altitude at Mach 7.', src: ['asme'] }],
      Operations: [{ text: 'The F-1 engines flew on 13 missions: 12 Apollo flights and the Skylab launch. Apollo 11 landed the first people on the Moon and Apollo 17 in 1972 ended the programme. The last Saturn V launch carried Skylab in 1973.', src: ['asme'] }],
    },
  },
  {
    id: 'lro', name: 'Lunar Reconnaissance Orbiter (LRO)', kind: 'Orbiter', agency: 'NASA (Goddard Space Flight Center)',
    missions: [
      { id: 'lcross', role: 'Companion spacecraft: launched together with LCROSS and observed its plumes' },
      { id: 'l25', role: 'Observer: NYXOS\'s Luna-25 crater position is from NASA LRO imaging' },
      { id: 'slim', role: 'Observer: NYXOS\'s SLIM position is from NASA LRO imaging' },
      { id: 'ce4', role: 'Observer: Chang\'e-4 position from the LROC camera team' },
      { id: 'ce6', role: 'Observer: Chang\'e-6 position from the LROC camera team' },
    ],
    summary: 'NASA\'s mapping orbiter of the Moon since 2009. Its laser altimeter (LOLA) and camera (LROC) supply the terrain and positions that NYXOS uses for its analysis.',
    model: { url: '/history/models/lro.glb', ...NASA_MODEL, processing: 'Used unchanged (Draco-compressed GLB, 655 KB).' },
    parts: 'The model\'s parts are layers named Layer_0 to Layer_4, so no instrument labels are offered.',
    specs: [
      { label: 'Instruments (seven)', value: 'CRaTER, Diviner (DLRE), LAMP (LMAP), LEND, LOLA, LROC, Mini-RF', src: 'lro' },
      { label: 'Orbit', value: 'elliptical polar orbit entered on 23 June 2009; science orbit 31 miles above the Moon', src: 'lro' },
      { label: 'Mission management', value: 'NASA Goddard Space Flight Center (LRO); NASA Ames Research Center (LCROSS)', src: 'lro' },
    ],
    stages: {
      Launch: [{ text: 'LRO and LCROSS launched together on 18 June 2009 from Cape Canaveral on an Atlas V.', src: ['lro'] }],
      'Journey to the Moon': [{ text: 'After a four-and-a-half-day journey LRO entered its elliptical polar orbit on 23 June 2009.', src: ['lro'] }],
      Operations: [
        { text: 'LROC returned its first Moon image on 30 June 2009, of an area near Mare Nubium. The primary one-year mapping mission began on 15 September 2009 and ended in September 2010.', src: ['lro'] },
        { text: 'On 17 December 2010 NASA released a topographic map from LOLA data covering more than 98 percent of the surface. By 15 March 2011 LRO had delivered 192 terabytes of primary-mission data to the Planetary Data System.', src: ['lro'] },
        { text: 'LRO has imaged all six Apollo landing sites.', src: ['lro'] },
      ],
      Outcome: [{ text: 'As of the NASA page read, LRO had enough fuel to operate until 2027.', src: ['lro'] }],
    },
  },
  {
    id: 'orion', name: 'Orion crew module', kind: 'Crewed spacecraft', agency: 'NASA',
    missions: [{ id: 'art1', role: 'Flew uncrewed around the Moon' }, { id: 'art2', role: 'Carried four astronauts around the Moon' }],
    summary: 'NASA\'s capsule for deep-space crews. On Artemis I it flew with no one on board; on Artemis II it carried four people.',
    model: { url: '/history/models/orion.glb', ...NASA_MODEL, processing: 'NASA\'s 3D-printing STL "Orion Capsule (no fbc)" converted to GLB and merged; no colours, no detail removed (about 52,000 faces).', note: 'Crew module only, as published (the file name says "no fbc"). It is a printing model, so it has no textures.' },
    specs: [
      { label: 'Heat shield diameter', value: '5 m', src: 'sn' },
      { label: 'Re-entry speed (Artemis I)', value: 'just under 40,000 km/h, heating the spacecraft to nearly 2,700 °C', src: 'sn' },
      { label: 'Artemis I flight', value: '25.5 days; 432,210 km from Earth, farthest for a spacecraft designed for people', src: 'sn' },
    ],
    stages: {
      Launch: [
        { text: 'Artemis I launched on 16 November 2022.', src: ['sn'] },
        { text: 'Artemis II: the crew (Reid Wiseman, Victor Glover, Christina Koch, Jeremy Hansen) completed the translunar injection burn on 2 April 2026.', src: ['wjla'] },
      ],
      'Journey to the Moon': [
        { text: 'Artemis I entered a distant retrograde orbit more than 65,000 km above the Moon on day 10 and flew 129.7 km above the surface on day 20, firing its main engine for nearly three and a half minutes to head home.', src: ['sn'] },
        { text: 'On day 8 (23 November) mission control lost contact for 47 minutes while the capsule was talking to the Deep Space Network.', src: ['sn'] },
      ],
      Operations: [
        { text: 'All 10 CubeSats deployed on day 3, but about half did not turn on or did not operate as expected.', src: ['sn'] },
        { text: 'Artemis II lasted roughly 10 days and the crew returned to Earth, with a return event on 11 April 2026.', src: ['wjla'] },
      ],
      Outcome: [{ text: 'Artemis I splashed down on 11 December 2022 in the Pacific near Guadalupe Island, at 32 km/h, under 11 parachutes deployed in the last four minutes. Recovery teams took the capsule to the USS Portland.', src: ['sn'] }],
    },
  },
  {
    id: 'sls', name: 'Space Launch System (SLS) Block 1', kind: 'Launch vehicle', agency: 'NASA',
    missions: [{ id: 'art1', role: 'Launch vehicle' }, { id: 'art2', role: 'Launch vehicle' }],
    summary: 'The rocket that launches Orion toward the Moon in the Artemis programme. This profile is short because the sources read so far say little about the rocket itself.',
    model: { url: '/history/models/sls.glb', rotateX: -Math.PI / 2, ...NASA_MODEL, processing: 'NASA\'s 3D-printing STL "Space Launch System (SLS) Block 1" converted to GLB and reduced from about 274,000 to 120,000 faces; rotated upright. No colours.', note: 'A printing model, so it has no textures.' },
    specs: [],
    stages: {
      Launch: [{ text: 'Artemis I, the first flight of the programme, launched on 16 November 2022.', src: ['sn'] }],
    },
  },

  // Hardware with no verified open 3D model. Listed so every mission names its spacecraft.
  { id: 'luna-2', name: 'Luna 2', kind: 'Impact probe', agency: 'Soviet Union', missions: [{ id: 'luna2', role: 'The probe itself' }], summary: 'Soviet probe that hit the Moon on 13 September 1959. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'luna-9', name: 'Luna 9', kind: 'Lander', agency: 'Soviet Union', missions: [{ id: 'luna9', role: 'The lander' }], summary: 'First spacecraft to make a soft landing on the Moon, on 3 February 1966. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'apollo-csm', name: 'Apollo Command and Service Module', kind: 'Crewed spacecraft', agency: 'NASA, built by North American',
    missions: [{ id: 'apollo8', role: 'The only spacecraft that flew the crew round the Moon' }, { id: 'apollo11', role: '"Columbia", flown by Michael Collins' }, { id: 'apollo12', role: '"Yankee Clipper"' }, { id: 'apollo14', role: '"Kitty Hawk"' }, { id: 'apollo15', role: '"Endeavour"' }, { id: 'apollo16', role: '"Casper"' }, { id: 'apollo17', role: '"America"' }],
    summary: 'The spacecraft that carried each crew to lunar orbit and home. The NASA collection has no model of it that we could identify, so none is shown. NASA\'s "ESAS Crew Module" is a different, later design and is not used.', specs: [], stages: {} },
  { id: 'luna-16', name: 'Luna 16', kind: 'Sample-return spacecraft', agency: 'Soviet Union', missions: [{ id: 'luna16', role: 'Robot that returned about 100 g of soil' }], summary: 'Robotic spacecraft that returned Moon soil to Earth in September 1970. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'lunokhod-1', name: 'Lunokhod 1', kind: 'Rover', agency: 'Soviet Union', missions: [{ id: 'luna16', role: 'The rover, launched in November 1970' }], summary: 'First rover on another world. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'lcross-ss', name: 'LCROSS Shepherding Spacecraft and Centaur', kind: 'Impact probe', agency: 'NASA (Ames Research Center)', missions: [{ id: 'lcross', role: 'The Centaur stage struck Cabeus on 9 October 2009, followed about five minutes later by the Shepherding Spacecraft' }], summary: 'Two impactors in one mission. The Shepherding Spacecraft carried five cameras, three spectrometers and one photometer (NASA). No licensed 3D model found.', specs: [], stages: { Operations: [{ text: 'The Centaur upper stage struck Cabeus crater near the south pole on 9 October 2009, followed about five minutes later by the Shepherding Spacecraft. The plumes were smaller than expected but instruments detected signs of water.', src: ['lro'] }] } },
  { id: 'ce4-lander', name: "Chang'e-4 lander and Yutu-2 rover", kind: 'Lander', agency: 'China (CNSA)', missions: [{ id: 'ce4', role: 'Lander and the rover Yutu-2' }], summary: 'Far-side lander and rover. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'queqiao', name: 'Queqiao relay satellite', kind: 'Relay satellite', agency: 'China (CNSA)', missions: [{ id: 'ce4', role: 'Relays signals between the far side and Earth' }], summary: 'The satellite that lets the far-side lander talk to Earth. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'luna-25', name: 'Luna-25', kind: 'Lander', agency: 'Russia (Roscosmos)', missions: [{ id: 'l25', role: 'The lander that crashed' }], summary: 'Russian lander lost on 19 August 2023. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'vikram-pragyan', name: 'Vikram lander and Pragyan rover', kind: 'Lander', agency: 'India (ISRO)', missions: [{ id: 'ch3', role: 'Lander Vikram and rover Pragyan' }], summary: 'Chandrayaan-3\'s lander and rover. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'slim', name: 'SLIM lander', kind: 'Lander', agency: 'Japan (JAXA)', missions: [{ id: 'slim', role: 'The lander, "Moon Sniper"' }], summary: 'Japanese precision-landing demonstrator. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'odysseus', name: 'Odysseus', kind: 'Lander', agency: 'Intuitive Machines (USA)', missions: [{ id: 'im1', role: 'The lander' }], summary: 'First private lander on the Moon. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'athena', name: 'Athena', kind: 'Lander', agency: 'Intuitive Machines (USA)', missions: [{ id: 'im2', role: 'The lander' }], summary: 'Second Intuitive Machines lander, near Mons Mouton. No licensed 3D model found.', specs: [], stages: {} },
  { id: 'ce6-set', name: "Chang'e-6 lander, ascender, orbiter and return capsule", kind: 'Sample-return spacecraft', agency: 'China (CNSA)', missions: [{ id: 'ce6', role: 'Far-side sample return' }], summary: 'Four elements that collected and returned far-side samples. No licensed 3D model found.', specs: [], stages: {} },
]

export const spacecraftOf = (missionId: string) =>
  SPACECRAFT.filter((s) => s.missions.some((m) => m.id === missionId))
export const roleIn = (s: Spacecraft, missionId: string) => s.missions.find((m) => m.id === missionId)?.role ?? ''
export const bySource = (id: string) => SOURCES[id]
