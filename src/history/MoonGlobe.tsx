import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { moonState } from '../astro/ephemeris'

export interface GlobeMarker { id: string; title: string; lat: number; lon: number; color: string }

const DEG = Math.PI / 180
/** the same convention as src/astro: x toward 90°E, y toward the north pole, z toward 0° longitude */
export const toVec = (lat: number, lon: number, r = 1) => new THREE.Vector3(Math.cos(lat * DEG) * Math.sin(lon * DEG) * r, Math.sin(lat * DEG) * r, Math.cos(lat * DEG) * Math.cos(lon * DEG) * r)

const HOME = new THREE.Vector3(0.15, 0.25, 1).normalize()
const HOME_DIST = 3.2
const FALLBACK_SUN = new THREE.Vector3(1, 0.35, 0.8).normalize()

function useTexture(url: string, srgb: boolean) {
  const [tex, setTex] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    let live = true
    let t: THREE.Texture | null = null
    new THREE.TextureLoader().load(url, (x) => {
      if (!live) return x.dispose()
      if (srgb) x.colorSpace = THREE.SRGBColorSpace
      x.anisotropy = 4
      t = x
      setTex(x)
    })
    return () => {
      live = false
      t?.dispose()
    }
  }, [url, srgb])
  return tex
}

function Moon({ sun, onReliefState }: { sun: THREE.Vector3; onReliefState: (s: 'loading' | 'ready' | 'failed') => void }) {
  const color = useTexture('/moon/color_4k.webp', true)
  // Precomputed offline from NASA LOLA elevation (tools/make-history-normal.py), so nothing is decoded or computed at load.
  const normal = useTexture('/history/moon_normal_2k.webp', false)
  useEffect(() => {
    onReliefState(normal ? 'ready' : 'loading')
  }, [normal, onReliefState])
  return (
    <>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshStandardMaterial key={`${!!color}${!!normal}`} map={color ?? undefined} color={color ? '#ffffff' : '#555a66'} normalMap={normal ?? undefined} normalScale={new THREE.Vector2(1, 1)} roughness={1} metalness={0} />
      </mesh>
      <directionalLight position={sun.clone().multiplyScalar(10)} intensity={1.5} />
      <ambientLight intensity={0.1} />
    </>
  )
}

function Stars() {
  const tex = useTexture('/moon/stars_4k.webp', true)
  if (!tex) return null
  return (
    <mesh>
      <sphereGeometry args={[60, 48, 24]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Markers({ markers, selected, onSelect }: { markers: GlobeMarker[]; selected: string | null; onSelect: (id: string) => void }) {
  const ring = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ring.current) ring.current.scale.setScalar(1 + 0.25 * Math.sin(clock.elapsedTime * 3))
  })
  return (
    <>
      {markers.map((m) => {
        const pos = toVec(m.lat, m.lon, 1.004)
        const on = m.id === selected
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize())
        return (
          <group key={m.id} position={pos} quaternion={q}>
            <mesh onClick={(e) => (e.stopPropagation(), onSelect(m.id))} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[on ? 0.017 : 0.011, 16, 16]} />
              <meshBasicMaterial color={m.color} toneMapped={false} />
            </mesh>
            {on && (
              <>
                <mesh ref={ring}>
                  <ringGeometry args={[0.03, 0.036, 48]} />
                  <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} toneMapped={false} transparent opacity={0.9} />
                </mesh>
              </>
            )}
          </group>
        )
      })}
    </>
  )
}

/** Moves the camera over the chosen marker, or home. The target stays at the Moon's centre, so rotation, zoom and pan keep working after a flight. */
function Rig({ focus, resetKey, markers }: { focus: string | null; resetKey: number; markers: GlobeMarker[] }) {
  const { camera } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const flight = useRef<{ t: number; qFull: THREE.Quaternion; from: THREE.Vector3; d0: number; d1: number } | null>(null)

  const start = (dir: THREE.Vector3, dist: number) => {
    const from = camera.position.clone().normalize()
    flight.current = { t: 0, from, qFull: new THREE.Quaternion().setFromUnitVectors(from, dir.clone().normalize()), d0: camera.position.length(), d1: dist }
  }
  useEffect(() => {
    const m = markers.find((x) => x.id === focus)
    if (m) start(toVec(m.lat, m.lon), 2.05)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    controls.current?.target.set(0, 0, 0)
    start(HOME, HOME_DIST)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  useFrame((_, dt) => {
    const f = flight.current
    if (!f) return
    f.t = Math.min(1, f.t + dt / 1.3)
    const e = f.t < 0.5 ? 4 * f.t ** 3 : 1 - (-2 * f.t + 2) ** 3 / 2
    const q = new THREE.Quaternion().slerp(f.qFull, e)
    camera.position.copy(f.from.clone().applyQuaternion(q).multiplyScalar(f.d0 + (f.d1 - f.d0) * e))
    controls.current?.target.lerp(new THREE.Vector3(0, 0, 0), 0.2)
    camera.lookAt(controls.current?.target ?? new THREE.Vector3())
    if (f.t >= 1) flight.current = null
  })
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} enablePan minDistance={1.12} maxDistance={8} rotateSpeed={0.6} zoomSpeed={0.7} onStart={() => (flight.current = null)} />
}

export default function MoonGlobe({ markers, selected, onSelect, lightIso }: { markers: GlobeMarker[]; selected: string | null; onSelect: (id: string) => void; lightIso: string | null }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [resetKey, setResetKey] = useState(0)
  const [missionLight, setMissionLight] = useState(true)
  const [relief, setRelief] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [full, setFull] = useState(false)

  const sun = useMemo(() => {
    if (!missionLight || !lightIso) return FALLBACK_SUN
    const d = moonState(new Date(lightIso)).sunDir
    return new THREE.Vector3(d[0], d[1], d[2]).normalize()
  }, [missionLight, lightIso])

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrap.current?.requestFullscreen?.()
  }

  return (
    <div ref={wrap} className={`mg-wrap${full ? ' full' : ''}`}>
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ fov: 40, near: 0.05, far: 200, position: HOME.clone().multiplyScalar(HOME_DIST).toArray() }} onCreated={({ gl }) => gl.setClearColor('#000')}>
        <Suspense fallback={null}>
          <Stars />
          <Moon sun={sun} onReliefState={setRelief} />
          <Markers markers={markers} selected={selected} onSelect={onSelect} />
          <Rig focus={selected} resetKey={resetKey} markers={markers} />
        </Suspense>
      </Canvas>
      <div className="mg-bar">
        <button onClick={() => setResetKey((k) => k + 1)} title="Back to the starting view">Reset view</button>
        <button onClick={toggleFull} aria-pressed={full}>{full ? 'Exit full screen' : 'Full screen'}</button>
        {lightIso && <button onClick={() => setMissionLight((v) => !v)} aria-pressed={missionLight} title="Light the Moon as the Sun lit it at the selected mission's moment">{missionLight ? 'Light: mission time' : 'Light: fixed'}</button>}
      </div>
      <p className="mg-hint">Drag to turn, scroll to zoom, right-drag or two fingers to pan. Terrain shading uses NASA LOLA elevation, exaggerated for visibility.{relief === 'loading' ? ' Loading relief…' : relief === 'failed' ? ' Relief could not load, showing colour only.' : ''}</p>
    </div>
  )
}
