import sceneUrl from '../../assets/scene.gltf?url'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import useStore from '../../shared/store'
import { roadCurve } from '../Track/Track'

const _sceneBase = sceneUrl.substring(0, sceneUrl.lastIndexOf('/') + 1)
THREE.DefaultLoadingManager.setURLModifier((url) => {
  if (url.startsWith('textures/')) return _sceneBase + url
  return url
})

const Ship = ({
  position,
  rotation,
  ...props
}) => {
  const ship = useStore((s) => s.ship)
  const progress = useRef(0)
  const _point = useRef(new THREE.Vector3())
  const _tangent = useRef(new THREE.Vector3())
  const _quaternion = useRef(new THREE.Quaternion())
  const _forward = useRef(new THREE.Vector3(0, 0, -1))
  const { nodes, materials } = useGLTF(sceneUrl)

  useEffect(() => {
    // Helps confirm the shared ship ref is attached before target/camera logic runs.
    console.log('ship ref attached', ship?.current)
  }, [ship])

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime()
    const pulse = 0.25 + Math.sin(time * 10) * 0.05

    if (ship.current) {
      progress.current += delta * 0.05
      progress.current = Math.min(progress.current, 1)

      roadCurve.getPoint(progress.current, _point.current)
      roadCurve.getTangent(progress.current, _tangent.current)

      ship.current.position.copy(_point.current)
      _quaternion.current.setFromUnitVectors(_forward.current, _tangent.current)
      ship.current.quaternion.copy(_quaternion.current)
    }
  })

  return (
    <Suspense fallback={null}>
      <group ref={ship} position={position} rotation={rotation} {...props}>

        <group
          scale={0.008}
          rotation={[0, Math.PI, 0]}
        >
          {/* Pass materials directly — keeps all textures intact */}
          <mesh
            name="Cone001_01"
            geometry={nodes['Cone001_01_-_Default_0'].geometry}
            material={materials['01_-_Default']}
          />
          <mesh
            name="Cone001_02"
            geometry={nodes['Cone001_02_-_Default_0'].geometry}
            material={materials['02_-_Default']}
          />
          <mesh
            name="Cone001_03"
            geometry={nodes['Cone001_03_-_Default_0'].geometry}
            material={materials['03_-_Default']}
          />
          <mesh
            name="Cone001_07"
            geometry={nodes['Cone001_07_-_Default_0'].geometry}
            material={materials['07_-_Default']}
          />
          <mesh
            name="Cone001_08"
            geometry={nodes['Cone001_08_-_Default_0'].geometry}
            material={materials['08_-_Default']}
          />
          <mesh
            name="Cone001_09"
            geometry={nodes['Cone001_09_-_Default_0'].geometry}
            material={materials['09_-_Default']}
          />
        </group>

      </group>
    </Suspense>
  )
}

export default Ship
useGLTF.preload(sceneUrl)
