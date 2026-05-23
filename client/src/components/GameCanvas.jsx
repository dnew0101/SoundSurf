import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { TRACK_LENGTH } from '../shared/constants'
import useStore from '../shared/store'
import Track from './Track/Track'
import AnimatedShip from './Ship/AnimatedShip'
import Targets from './Targets/Targets'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { getRoadY } from '../utils/distortion'

const _camPos = new THREE.Vector3()
const _lookAt = new THREE.Vector3()

const Scene = () => {
  const ship = useStore((s) => s.ship)

  useFrame(({ camera, clock }) => {
    if (!ship.current) return

    const shipPosition = ship.current.position
    const time = clock.getElapsedTime()
    const shipRoadY = getRoadY(Math.abs(shipPosition.z) / TRACK_LENGTH, time)
    const lookZ = shipPosition.z - 20

    _camPos.set(
      shipPosition.x,
      shipRoadY + 8,
      shipPosition.z + 12,
    )

    _lookAt.set(
      0,
      getRoadY(Math.abs(lookZ) / TRACK_LENGTH, time),
      lookZ,
    )

    camera.position.copy(_camPos)
    camera.lookAt(_lookAt)
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={2.5} />
      <pointLight position={[0, 10, 0]} intensity={1} />
      <color attach="background" args={['#000000']} />

      {/* Camera */}
      <PerspectiveCamera
        fov={75}
        near={0.5}
        far={TRACK_LENGTH}
        position={[0, 2, 8]}
        makeDefault
       />

      {/* Scene */}
      <Track />
      <AnimatedShip position={[0, 0, 0]} rotation={[0, 0, 0]} />
      <Targets />

      <EffectComposer multisampling={0}>
        <Bloom intensity={1.8} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
      </EffectComposer>

      {/* Atmosphere */}
      <fog attach="fog" color="black" near={20} far={700} />
      <Stars radius={120} count={600} />
    </>
  )
}

export default function GameCanvas() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      gl={{ antialias: true }}
    >
      <Scene />
    </Canvas>
  )
}