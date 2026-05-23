// components/Targets/TargetInstances.js
import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '@/shared/store'
import { distance } from '@/utils/distance'
import { getLaneX } from '../../shared/road'
import { getRoadY } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'

const _spawnPoint = new THREE.Vector3()
const TARGET_RIDE_HEIGHT = 0.55

const TargetInstance = ({ lane, z, color }) => {
  const ref = useRef()
  const materialRef = useRef()
  const ship = useStore((s) => s.ship)
  const trackLength = useStore((s) => s.trackLength)
  const incrementScore = useStore((s) => s.setScore)
  const addExplosion = useStore((s) => s.addExplosion)
  const resetHitStreak = useStore((s) => s.resetHitStreak)
  
  const [active, setActive] = useState(true)

  useFrame((state) => {
    if (!active || !ref.current || !ship?.current) {
      return
    }

    const time = roadState.time || state.clock.getElapsedTime()
    const laneX = getLaneX(lane)
    const roadY = getRoadY(Math.abs(z) / trackLength, roadState.time || time)

    _spawnPoint.set(laneX, roadY + TARGET_RIDE_HEIGHT, z)
    ref.current.position.copy(_spawnPoint)

    // Hit Detection
    if (distance(ship.current.position, ref.current.position) < 2.4) {
      addExplosion(ref.current.position.x)
      incrementScore()
      setActive(false) // Disable target
      return
    }

    // Miss Detection (if the target is passed by the ship)
    if (ref.current.position.z > ship.current.position.z + 10) {
      resetHitStreak()
      setActive(false) // Disable target
    }
  })

  // Do not render geometry if inactive
  if (!active) return null

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.8, 0.8, 0.1]} />
      <meshBasicMaterial ref={materialRef} color={color} toneMapped={false} />
    </mesh>
  )
}

export default TargetInstance