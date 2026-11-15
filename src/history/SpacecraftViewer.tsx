import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { SOURCES, STAGES, roleIn, type ModelInfo, type Spacecraft } from './spacecraft'

const DRACO = '/history/draco/'

class Boundary extends Component<{ children: ReactNode; onError: () => void }, { bad: boolean }> {
  state = { bad: false }
  static getDerivedStateFromError() { return { bad: true } }
  componentDidCatch() { this.props.onError() }
  render() { return this.state.bad ? null : this.props.children }
}

/** Centres the model, scales it to a common size and frees its GPU memory when it is closed. */
function Model({ info }: { info: ModelInfo }) {
  const gltf = useGLTF(info.url, DRACO)
  const group = useRef<THREE.Group>(null)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  useLayoutEffect(() => {
    const g = group.current
    if (!g) return
    g.rotation.set(info.rotateX ?? 0, 0, 0)
    g.scale.setScalar(1)
    g.position.set(0, 0, 0)
    g.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(g)
    const size = box.getSize(new THREE.Vector3())
    const s = 2.4 / Math.max(size.x, size.y, size.z, 1e-6)
    g.scale.setScalar(s)
    g.updateMatrixWorld(true)
    const c = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3())
    g.position.sub(c)
  }, [scene, info])
  useEffect(() => () => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      mats.forEach((x) => {
        Object.values(x).forEach((v) => (v as THREE.Texture)?.isTexture && (v as THREE.Texture).dispose())
        x.dispose()
      })
    })
    useGLTF.clear(info.url)
  }, [scene, info.url])
  return <group ref={group}><primitive object={scene} /></group>
}

export default function SpacecraftViewer({ craft, missionId, onClose }: { craft: Spacecraft; missionId: string; onClose: () => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const controls = useRef<OrbitControlsImpl>(null)
  const [full, setFull] = useState(false)
  const [failed, setFailed] = useState(false)
  const m = craft.model

  useEffect(() => {
    const f = () => setFull(document.fullscreenElement === wrap.current)
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])
  useEffect(() => setFailed(false), [craft.id])

  const toggleFull = () => (document.fullscreenElement ? void document.exitFullscreen() : void wrap.current?.requestFullscreen?.())
  const role = roleIn(craft, missionId)

  return (
    <article className="sv" aria-label={`${craft.name} inspection`}>
      <div className="sv-top">
        <div>
          <h3>{craft.name}</h3>
          <p className="sv-sub">{craft.kind}. {craft.agency}.{role ? ` In this mission: ${role}.` : ''}</p>
        </div>
        <button className="hs-btn ghost" onClick={onClose}>Close</button>
      </div>

      {m && !failed ? (
        <div ref={wrap} className={`sv-stage${full ? ' full' : ''}`}>
          <Canvas dpr={[1, 1.75]} camera={{ fov: 38, position: [3.4, 1.8, 4.2], near: 0.05, far: 100 }} gl={{ antialias: true }}>
            <color attach="background" args={['#05070d']} />
            <hemisphereLight args={['#cfd8ff', '#1a1c24', 0.8]} />
            <directionalLight position={[5, 6, 4]} intensity={2.6} />
            <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8aa0ff" />
            <Boundary onError={() => setFailed(true)}>
              <Suspense fallback={null}><Model info={m} /></Suspense>
            </Boundary>
            <OrbitControls ref={controls} makeDefault enableDamping enablePan minDistance={1.5} maxDistance={14} />
          </Canvas>
          <div className="mg-bar">
            <button onClick={() => controls.current?.reset()}>Reset view</button>
            <button onClick={toggleFull} aria-pressed={full}>{full ? 'Exit full screen' : 'Full screen'}</button>
          </div>
          <p className="mg-hint">Drag to turn, scroll to zoom, right-drag to pan. {craft.parts ?? ''}</p>
        </div>
      ) : (
        <div className="sv-none" role="status">
          {failed ? 'The 3D model could not be loaded. The documented facts are below.' : 'No licensed 3D model of this exact spacecraft was found, so none is shown. NYXOS does not substitute a model of a different spacecraft. The documented facts are below.'}
        </div>
      )}

      <p className="hs-story">{craft.summary}</p>

      {craft.specs.length > 0 && (
        <>
          <h4>Specifications</h4>
          <dl className="sv-specs">
            {craft.specs.map((s) => (
              <div key={s.label}><dt>{s.label}</dt><dd>{s.value} <SrcLinks ids={[s.src]} /></dd></div>
            ))}
          </dl>
        </>
      )}

      <h4>History, in order</h4>
      <ol className="sv-stages">
        {STAGES.map((st) => {
          const facts = craft.stages[st]
          return (
            <li key={st}>
              <b>{st}</b>
              {facts?.length ? facts.map((f) => <p key={f.text}>{f.text} <SrcLinks ids={f.src} /></p>) : <p className="sv-empty">No documented detail added yet.</p>}
            </li>
          )
        })}
      </ol>

      {m && (
        <p className="ld-hint sv-credit">
          Model: {m.credit}. Licence: {m.licence}. {m.processing} {m.note ?? ''} {m.approximate ? 'This is an approximate reconstruction. ' : ''}
          <a href={m.sourceUrl} target="_blank" rel="noreferrer">Model source</a>
        </p>
      )}
    </article>
  )
}

function SrcLinks({ ids }: { ids: string[] }) {
  return (
    <span className="sv-src">
      {ids.map((id) => SOURCES[id] && <a key={id} href={SOURCES[id].url} target="_blank" rel="noreferrer" title={SOURCES[id].title}>[{id}]</a>)}
    </span>
  )
}
