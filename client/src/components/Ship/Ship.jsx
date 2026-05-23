import sceneUrl from '../../assets/scene.gltf?url'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import useStore from '../../shared/store'
import { getLaneX } from '../../shared/road'
import { roadParams } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'
import { getRoadPoint, getRoadFrame } from '../../utils/roadCurve'

const _point = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _rollQuat = new THREE.Quaternion()
const _forward = new THREE.Vector3(0, 0, -1)
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
  const audioParams = useStore((s) => s.audioParams)
  const audioContext = useStore((s) => s.audioContext)
  const audioBuffer = useStore((s) => s.audioBuffer)
  const audioStartTime = useStore((s) => s.audioStartTime)
  const isPlaying = useStore((s) => s.isPlaying)

  const frozenRoadParams = useStore((s) => s.frozenRoadParams)
  const targetLane = useRef(1)
  const loggedFrame = useRef(false)
  const prevNormal = useRef(new THREE.Vector3(0, 1, 0))
  const laneChange = useRef({ direction: 0, time: 0 })
  const { nodes, materials } = useGLTF(sceneUrl)

  useEffect(() => {
    const handleKey = (event) => {
      const step = 1
      switch (event.key) {
        case 'ArrowLeft':
          targetLane.current = Math.max(targetLane.current - step, 0)
          laneChange.current = { direction: -1, time: Date.now() }
          break
        case 'ArrowRight':
          targetLane.current = Math.min(targetLane.current + step, 2)
          laneChange.current = { direction: 1, time: Date.now() }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useFrame(() => {
    if (ship.current && isPlaying && audioStartTime !== null && audioBuffer) {
      const elapsedTime = audioContext.currentTime - audioStartTime
      shipProgress.current = (elapsedTime / audioBuffer.duration) * trackLength

      currentLane.current = THREE.MathUtils.lerp(currentLane.current, targetLane.current, 0.1)

      const progress = Math.abs(shipProgress.current) / trackLength
      const clampedProgress = Math.min(Math.max(progress, 0), 1)

      const activeRp = frozenRoadParams || roadParams
      const activeAp = frozenRoadParams
        ? { bpm: { current: frozenRoadParams.bpm }, intensityScalar: { current: frozenRoadParams.intensityScalar } }
        : audioParams

      const center = getRoadPoint(clampedProgress, trackLength, activeRp, activeAp)
      const frame = getRoadFrame(clampedProgress, trackLength, activeRp, activeAp, prevNormal.current)
      prevNormal.current.copy(frame.normal)

      const laneOffset = getLaneX(currentLane.current)

      _point.set(
        center.x + laneOffset * frame.binormal.x + SHIP_RIDE_HEIGHT * frame.normal.x,
        center.y + laneOffset * frame.binormal.y + SHIP_RIDE_HEIGHT * frame.normal.y,
        center.z + laneOffset * frame.binormal.z + SHIP_RIDE_HEIGHT * frame.normal.z,
      )
      ship.current.position.copy(_point)

      const m = new THREE.Matrix4()
      m.set(
        frame.binormal.x, frame.normal.x, -frame.tangent.x, 0,
        frame.binormal.y, frame.normal.y, -frame.tangent.y, 0,
        frame.binormal.z, frame.normal.z, -frame.tangent.z, 0,
        0, 0, 0, 1,
      )
      _quaternion.setFromRotationMatrix(m)

      const rollElapsed = Date.now() - laneChange.current.time
      if (rollElapsed < 300 && laneChange.current.direction !== 0) {
        const t = rollElapsed / 300
        const eased = t * t * (3 - 2 * t)
        const rollAngle = laneChange.current.direction * eased * Math.PI * 2
        _rollQuat.setFromAxisAngle(frame.tangent, rollAngle)
        _quaternion.multiply(_rollQuat)
      }
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
