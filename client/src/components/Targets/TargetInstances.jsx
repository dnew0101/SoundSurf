import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '@/shared/store'
import { distance } from '@/utils/distance'
import { getLaneX } from '../../shared/road'
import { roadParams } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'
import { getRoadPoint, getRoadFrame } from '../../utils/roadCurve'

const _spawnPoint = new THREE.Vector3()
const TARGET_RIDE_HEIGHT = 0.55

const TargetInstance = ({ lane, z, color }) => {
  const ref = useRef()
  const materialRef = useRef()
  const ship = useStore((s) => s.ship)
  const trackLength = useStore((s) => s.trackLength)
  const audioParams = useStore((s) => s.audioParams)
  const incrementScore = useStore((s) => s.setScore)
  const addExplosion = useStore((s) => s.addExplosion)
  const resetHitStreak = useStore((s) => s.resetHitStreak)

  const frozenRoadParams = useStore((s) => s.frozenRoadParams)
  const [active, setActive] = useState(true)
  const prevNormal = useRef(new THREE.Vector3(0, 1, 0))

  useFrame(() => {
    if (!active || !ref.current || !ship?.current) {
      return
    }

    const activeRp = frozenRoadParams || roadParams
    const activeAp = frozenRoadParams
      ? { bpm: { current: frozenRoadParams.bpm }, intensityScalar: { current: frozenRoadParams.intensityScalar } }
      : audioParams
    const laneX = getLaneX(lane)
    const progress = Math.abs(z) / trackLength
    const clamped = Math.min(Math.max(progress, 0), 1)

    const center = getRoadPoint(clamped, trackLength, activeRp, activeAp)
    const frame = getRoadFrame(clamped, trackLength, activeRp, activeAp, prevNormal.current)
    prevNormal.current.copy(frame.normal)

    _spawnPoint.set(
      center.x + laneX * frame.binormal.x + TARGET_RIDE_HEIGHT * frame.normal.x,
      center.y + laneX * frame.binormal.y + TARGET_RIDE_HEIGHT * frame.normal.y,
      center.z + laneX * frame.binormal.z + TARGET_RIDE_HEIGHT * frame.normal.z,
    )
    ref.current.position.copy(_spawnPoint)

    if (distance(ship.current.position, ref.current.position) < 2.4) {
      addExplosion(ref.current.position.x)
      incrementScore()
      setActive(false)
      return
    }

    if (ref.current.position.z > ship.current.position.z + 10) {
      resetHitStreak()
      setActive(false)
    }
  })

  if (!active) return null

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.8, 0.8, 0.1]} />
      <meshBasicMaterial ref={materialRef} color={color} toneMapped={false} />
    </mesh>
  )
}

export default TargetInstance
