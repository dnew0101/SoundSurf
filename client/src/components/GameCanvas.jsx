import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../shared/store'
import Track from './Track/Track'
import AnimatedShip from './Ship/AnimatedShip'
import Targets from './Targets/Targets'
import AudioController from './AudioController'
import TrackEnd from './UI/TrackEnd'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { roadState } from '../utils/roadState'
import { getRoadPoint, getRoadFrame } from '../utils/roadCurve'
import { roadParams } from '../utils/distortion'
import { HUD } from './HUD'

const _camPos = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()

const Scene = () => {
  const ship = useStore((s) => s.ship)
  const shipProgress = useStore((s) => s.shipProgress)
  const trackLength = useStore((s) => s.trackLength)
  const audioParams = useStore((s) => s.audioParams)
  const isLoaded = useStore((s) => s.isLoaded)

  const frozenRoadParams = useStore((s) => s.frozenRoadParams)
  const endGame = useStore((s) => s.endGame)

  useFrame(({ camera }) => {
    if (!ship.current) return

    const activeRp = frozenRoadParams || roadParams
    const activeAp = frozenRoadParams
      ? { bpm: { current: frozenRoadParams.bpm }, intensityScalar: { current: frozenRoadParams.intensityScalar } }
      : audioParams

    const progress = Math.abs(shipProgress.current) / trackLength
    const clamped = Math.min(Math.max(progress, 0), 1)

    roadState.progress = clamped

    const shipPos = ship.current.position

    const lookProgress = Math.min(clamped + 0.06, 1)
    const lookPoint = getRoadPoint(lookProgress, trackLength, activeRp, activeAp)

    const camProgress = Math.max(clamped - 0.01, 0)
    const camFrame = getRoadFrame(camProgress, trackLength, activeRp, activeAp, roadState.currentNormal)

    _camPos.set(
      shipPos.x - camFrame.tangent.x * 22 + camFrame.normal.x * 12,
      shipPos.y - camFrame.tangent.y * 22 + camFrame.normal.y * 12,
      shipPos.z - camFrame.tangent.z * 22 + camFrame.normal.z * 12,
    )

    _lookTarget.set(lookPoint.x, lookPoint.y, lookPoint.z)

    camera.position.copy(_camPos)
    camera.lookAt(_lookTarget)
  })

  return (
    <>
      {isLoaded && <AudioController />}

      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={2.5} />
      <pointLight position={[0, 10, 0]} intensity={1} />
      <color attach="background" args={['#000000']} />

      <PerspectiveCamera
        fov={75}
        near={0.5}
        far={trackLength}
        position={[0, 2, 8]}
        makeDefault
       />

      <Track />
      <AnimatedShip position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <Targets />

      <EffectComposer multisampling={0}>
        <Bloom intensity={1.8} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>

      <fog attach="fog" color="black" near={20} far={700} />
      <Stars radius={120} count={600} />

      {isLoaded && !endGame && (
        <mesh position={new THREE.Vector3(0, 3, -trackLength)}>
          <sphereGeometry args={[3, 24, 24]} />
          <meshBasicMaterial color="#33E0D7" wireframe />
        </mesh>
      )}
    </>
  )
}

export default function GameCanvas() {
  const endGame = useStore((s) => s.endGame)

  return (
    <>
     <HUD />
      <Canvas
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
      {endGame && <TrackEnd />}
    </>
  )
}
