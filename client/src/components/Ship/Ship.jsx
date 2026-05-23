// components/Ship/Ship.js
import sceneUrl from '../../assets/scene.gltf?url'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import useStore from '../../shared/store'
import { getLaneX } from '../../shared/road'
import { getRoadY } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'

const _point = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _tangent = new THREE.Vector3()
const _forward = new THREE.Vector3(0, 0, -1)
const _ahead = new THREE.Vector3()
const SHIP_RIDE_HEIGHT = 1.0

const _sceneBase = sceneUrl.substring(0, sceneUrl.lastIndexOf('/') + 1)
THREE.DefaultLoadingManager.setURLModifier((url) => {
  if (url.startsWith('textures/')) return _sceneBase + url
  return url
})

const Ship = ({ position, rotation, ...props }) => {
  const ship = useStore((s) => s.ship)
  const shipProgress = useStore((s) => s.shipProgress)
  const currentLane = useStore((s) => s.currentLane)
  const trackLength = useStore((s) => s.trackLength)
  const audioContext = useStore((s) => s.audioContext)
  const audioBuffer = useStore((s) => s.audioBuffer)
  const audioStartTime = useStore((s) => s.audioStartTime)
  const isPlaying = useStore((s) => s.isPlaying)

  const targetLane = useRef(1)
  const loggedFrame = useRef(false)
  const { nodes, materials } = useGLTF(sceneUrl)

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

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    const pulse = 0.25 + Math.sin(time * 10) * 0.05

    if (ship.current && isPlaying && audioStartTime !== null && audioBuffer) {
      // 1. Calculate EXACT elapsed time since audio started
      const elapsedTime = audioContext.currentTime - audioStartTime

      // 2. Map elapsed time directly to Z progress matching generateTrackData logic
      // Math: progress = (time / duration) * trackLength
      shipProgress.current = (elapsedTime / audioBuffer.duration) * trackLength

      currentLane.current = THREE.MathUtils.lerp(currentLane.current, targetLane.current, 0.1)

      const roadZ = -shipProgress.current
      const roadY = roadState.currentY
      const laneX = getLaneX(currentLane.current)

      _point.set(laneX, roadY + SHIP_RIDE_HEIGHT, roadZ)
      ship.current.position.copy(_point)

      _ahead.set(
        laneX,
        getRoadY(Math.abs(roadZ - 1.5) / trackLength, roadState.time) + SHIP_RIDE_HEIGHT,
        roadZ - 1.5,
      )
      _tangent.copy(_ahead).sub(_point).normalize()

      _quaternion.setFromUnitVectors(_forward, _tangent)
      ship.current.quaternion.copy(_quaternion)

      if (!loggedFrame.current) {
        loggedFrame.current = true
      }
    }
  })

  return (
    <Suspense fallback={null}>
      <group ref={ship} position={position} rotation={rotation} {...props}>
        <pointLight
          position={[2.2, 0.8, 1.6]}
          intensity={5}
          distance={18}
          decay={2}
          color="#9fefff"
        />
        <group scale={0.015} rotation={[0, Math.PI, 0]}>
          <mesh name="Cone001_01" geometry={nodes['Cone001_01_-_Default_0'].geometry} material={materials['01_-_Default']} />
          <mesh name="Cone001_02" geometry={nodes['Cone001_02_-_Default_0'].geometry} material={materials['02_-_Default']} />
          <mesh name="Cone001_03" geometry={nodes['Cone001_03_-_Default_0'].geometry} material={materials['03_-_Default']} />
          <mesh name="Cone001_07" geometry={nodes['Cone001_07_-_Default_0'].geometry} material={materials['07_-_Default']} />
          <mesh name="Cone001_08" geometry={nodes['Cone001_08_-_Default_0'].geometry} material={materials['08_-_Default']} />
          <mesh name="Cone001_09" geometry={nodes['Cone001_09_-_Default_0'].geometry} material={materials['09_-_Default']} />
        </group>
      </group>
    </Suspense>
  )
}

export default Ship
useGLTF.preload(sceneUrl)