import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import { PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { TRACK_LENGTH } from '../shared/constants'
import useStore from '../shared/store'
import Track from './Track/Track'
import AnimatedShip from './Ship/AnimatedShip'
import Targets from './Targets/Targets'

const Scene = () => {
  const ship = useStore((s) => s.ship)
  const lookAt = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera }) => {
    if (ship.current) {
      console.log('ship ref value:', ship.current)
      console.log('following ship at z:', ship.current.position.z)
      lookAt.set(
        ship.current.position.x,
        ship.current.position.y,
        ship.current.position.z - 50,
      )
      camera.position.x = ship.current.position.x
      camera.position.y = ship.current.position.y + 2
      camera.position.z = ship.current.position.z + 8
      camera.lookAt(lookAt)
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1} />
      <directionalLight position={[10, 20, 10]} intensity={2.5} />
      <pointLight position={[0, 10, 0]} intensity={1} />

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
      {/* <Targets /> */}

      {/* Atmosphere */}
      <fog attach="fog" color="black" near={10} far={400} />
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