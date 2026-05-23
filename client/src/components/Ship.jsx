import sceneUrl from '../assets/scene.gltf?url'
import { useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Suspense } from 'react'

const _sceneBase = sceneUrl.substring(0, sceneUrl.lastIndexOf('/') + 1)
THREE.DefaultLoadingManager.setURLModifier((url) => {
  if (url.startsWith('textures/')) return _sceneBase + url
  return url
})

const Ship = ({
  meshRef,
  exhaustLeftRef,
  exhaustRightRef,
  position,
  rotation,
  ...props
}) => {
  const group = useRef()
  const { nodes, materials, animations } = useGLTF(sceneUrl)
  useAnimations(animations, group)

  return (
    <Suspense fallback={null}>
      {/* Top-level group is what the parent controls — clean transform */}
      <group ref={meshRef} position={position} rotation={rotation} {...props}>

        {/* Inner group zeroes out the Sketchfab export offset */}
        <group
          scale={0.02}                       // 207 unit model → ~4 units
          rotation={[Math.PI / 2, Math.PI, 0]}  // reorient to face -Z (down the road)
        >
          <mesh
            name="Cone001_01"
            geometry={nodes['Cone001_01_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#48bb78" />
          </mesh>
          <mesh
            name="Cone001_02"
            geometry={nodes['Cone001_02_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#171923" />
          </mesh>
          <mesh
            name="Cone001_03"
            geometry={nodes['Cone001_03_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#2d3748" />
          </mesh>
          <mesh
            name="Cone001_07"
            geometry={nodes['Cone001_07_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#e2e8f0" />
          </mesh>
          <mesh
            name="Cone001_08"
            geometry={nodes['Cone001_08_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#fc8181" />
          </mesh>
          <mesh
            name="Cone001_09"
            geometry={nodes['Cone001_09_-_Default_0'].geometry}
          >
            <meshPhongMaterial color="#90cdf4" />
          </mesh>
        </group>

        {/* Exhaust glow — positioned relative to rocket nozzle */}
        <mesh
          ref={exhaustLeftRef}
          scale={[0.3, 0.3, 0.2]}
          position={[-0.3, -1.5, 0]}
        >
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color="#FEEBC8" />
        </mesh>

        <mesh
          ref={exhaustRightRef}
          scale={[0.3, 0.3, 0.2]}
          position={[0.3, -1.5, 0]}
        >
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color="#FEEBC8" />
        </mesh>

      </group>
    </Suspense>
  )
}

export default Ship
useGLTF.preload(sceneUrl)
