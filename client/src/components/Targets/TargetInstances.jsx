import { TRACK_LENGTH } from '@/shared/constants'
import useStore from '@/shared/store'
import { distance } from '@/utils/distance'
import { Instance } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { roadCurve } from '../Track/Track'


const TargetInstance = ({ position, offset }) => {
  const ref = useRef()
  const start = useStore((s) => s.startGame)
  const ship = useStore((s) => s.ship)
  const incrementScore = useStore((s) => s.setScore)
  const addExplosion = useStore((s) => s.addExplosion)
  const resetHitStreak = useStore((s) => s.resetHitStreak)

  useFrame((state, delta) => {
    if (!ref.current || !ship?.current) {
      return
    }

    if (start) {
      ref.current.position.z += delta * 100
    }

    // Sample the curve at this target's progress point so it stays inside the tube.
    const progress = Math.abs(ref.current.position.z) / TRACK_LENGTH
    const clampedProgress = Math.min(Math.max(progress, 0), 1)
    const point = roadCurve.getPoint(clampedProgress)

    ref.current.position.x = point.x + offset
    ref.current.position.y = point.y

    // Hit
    if (distance(ship.current.position, ref.current.position) < 2) {
      addExplosion(ref.current.position.x)
      ref.current.position.z = 10
      incrementScore()
    }

    // Miss
    if (ref.current.position.z > -10 && ref.current.position.z < 10) {
      ref.current.position.z = 10
      resetHitStreak()
    }
  })

  return <Instance ref={ref} position={position} />
}

export default TargetInstance