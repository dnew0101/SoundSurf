import sceneUrl from '../../assets/scene.gltf?url'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { Suspense } from 'react'
import useStore from '../../shared/store'
import { TRACK_LENGTH } from '../../shared/constants'
import { getLaneX } from '../../shared/road'
import { ROAD_LENGTH, getRoadY } from '../../utils/distortion'

const _point = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _tangent = new THREE.Vector3()
const _forward = new THREE.Vector3(0, 0, -1)
const _ahead = new THREE.Vector3()
const SHIP_RIDE_HEIGHT = 1.0
const SHIP_FORWARD_SPEED = 30

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
  const shipProgress = useStore((s) => s.shipProgress)
  const currentLane = useStore((s) => s.currentLane)
  const targetLane = useRef(1)
  const loggedFrame = useRef(false)
  const exhaustLeft = useRef()
  const exhaustRight = useRef()
  const { nodes, materials } = useGLTF(sceneUrl)

  useEffect(() => {
    // Helps confirm the shared ship ref is attached before target/camera logic runs.
    console.log('ship ref attached', ship?.current)
  }, [ship])

  useEffect(() => {
    const handleKey = (event) => {
      const step = 1

      switch (event.key) {
        case 'ArrowLeft':
          targetLane.current = Math.max(targetLane.current - step, 0)
          break
        case 'ArrowRight':
          targetLane.current = Math.min(targetLane.current + step, 2)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime()
    const pulse = 0.25 + Math.sin(time * 10) * 0.05

    if (ship.current) {
      shipProgress.current += delta * SHIP_FORWARD_SPEED

      currentLane.current = THREE.MathUtils.lerp(currentLane.current, targetLane.current, 0.1)

      const roadZ = -shipProgress.current
      const progress = Math.abs(roadZ) / ROAD_LENGTH
      const roadY = getRoadY(progress, time)
      const laneX = getLaneX(currentLane.current)

      _point.set(laneX, roadY + SHIP_RIDE_HEIGHT, roadZ)
      ship.current.position.copy(_point)

      _ahead.set(
        laneX,
        getRoadY(Math.abs(roadZ - 1.5) / ROAD_LENGTH, time) + SHIP_RIDE_HEIGHT,
        roadZ - 1.5,
      )
      _tangent.copy(_ahead).sub(_point).normalize()

      _quaternion.setFromUnitVectors(_forward, _tangent)
      ship.current.quaternion.copy(_quaternion)

      if (!loggedFrame.current) {
        const shaderY = getRoadY(progress, time)
        console.log('ship z:', ship.current.position.z.toFixed(2), 'progress:', progress.toFixed(3), 'y:', shaderY.toFixed(3))
        loggedFrame.current = true
      }
    }

    if (exhaustLeft.current && exhaustRight.current) {
      exhaustLeft.current.scale.set(pulse, pulse, 0.2)
      exhaustRight.current.scale.set(pulse, pulse, 0.2)
    }
  })

  return (
    <Suspense fallback={null}>
      <group ref={ship} position={position} rotation={rotation} {...props}>

        <group
          scale={0.015}
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

        <mesh
          ref={exhaustLeft}
          scale={[0.3, 0.3, 0.2]}
          position={[-0.3, -1.5, 0]}
        >
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color="#FEEBC8" />
        </mesh>

        <mesh
          ref={exhaustRight}
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
