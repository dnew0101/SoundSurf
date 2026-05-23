import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Ship from './Ship'
import Track from './Track/Track'
import { Suspense, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'

// Separate component so useRef/useFrame work inside the Canvas context
function Scene() {
  const shipRef = useRef()
  const exhaustLRef = useRef()
  const exhaustRRef = useRef()

  useFrame(({ clock }) => {
    // Exhaust pulse animation
    if (exhaustLRef.current && exhaustRRef.current) {
      const pulse = Math.sin(clock.getElapsedTime() * 10) * 0.05 + 0.25
      exhaustLRef.current.scale.set(pulse, pulse, 0.2)
      exhaustRRef.current.scale.set(pulse, pulse, 0.2)
    }
  })

    useFrame(({ camera }) => {
        if (shipRef.current) {
            camera.position.lerp(
            new THREE.Vector3(
                shipRef.current.position.x,
                shipRef.current.position.y + 3,
                shipRef.current.position.z + 10
            ),
            0.1  // lerp smoothing factor
            )
            camera.lookAt(shipRef.current.position)
        }
    })

  return (
    <>
      <Track />
      <Ship
        meshRef={shipRef}
        exhaustLeftRef={exhaustLRef}
        exhaustRightRef={exhaustRRef}
        position={[0, 0.5, 0]}
        rotation={[0, 0, 0]}
      />
    </>
  )
}

export default function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 5, 12], fov: 60 }}  // behind and above the ship
      onCreated={(state) => {
        state.gl.toneMapping = THREE.ACESFilmicToneMapping
        state.gl.outputColorSpace = THREE.SRGBColorSpace  // updated API
        state.gl.toneMappingExposure = 1.6
      }}
      style={{
        position: 'fixed',
        zIndex: 0,
        inset: 0,
      }}
    >
      <hemisphereLight skyColor={0xffffff} groundColor={0x222222} intensity={1} />
      <ambientLight intensity={1} />
      <directionalLight color={0xffffff} intensity={2.5} position={[10, 20, 10]} />

      <Suspense fallback={null}>
        <Scene />
      </Suspense>

      <OrbitControls makeDefault />
    </Canvas>
  )
}