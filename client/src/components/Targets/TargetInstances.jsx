import useStore from '@/shared/store'
import { distance } from '@/utils/distance'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { getLaneX, TARGET_COLORS } from '../../shared/road'
import { ROAD_LENGTH, getRoadY } from '../../utils/distortion'


const _spawnPoint = new THREE.Vector3()
const TARGET_RIDE_HEIGHT = 0.55

const TargetInstance = ({ lane, z, color }) => {
  const ref = useRef()
  const materialRef = useRef()
  const ship = useStore((s) => s.ship)
  const incrementScore = useStore((s) => s.setScore)
  const addExplosion = useStore((s) => s.addExplosion)
  const resetHitStreak = useStore((s) => s.resetHitStreak)
  const currentZ = useRef(z)
  const currentLane = useRef(lane)
  const currentColor = useRef(color)

  const recycleTarget = () => {
    const nextLane = Math.floor(Math.random() * 3)
    const nextColor = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]
    currentLane.current = nextLane
    currentColor.current = nextColor
    currentZ.current = ship.current.position.z - (140 + Math.random() * 160)

    if (materialRef.current) {
      materialRef.current.color.set(nextColor)
    }
  }

  useFrame((state) => {
    if (!ref.current || !ship?.current) {
      return
    }

    const time = state.clock.getElapsedTime()

    const laneX = getLaneX(currentLane.current)
    const roadY = getRoadY(Math.abs(currentZ.current) / ROAD_LENGTH, time)

    _spawnPoint.set(laneX, roadY + TARGET_RIDE_HEIGHT, currentZ.current)
    ref.current.position.copy(_spawnPoint)

    // Hit
    if (distance(ship.current.position, ref.current.position) < 2.4) {
      addExplosion(ref.current.position.x)
      recycleTarget()
      incrementScore()
      return
    }

    // Miss
    if (ref.current.position.z > ship.current.position.z + 10) {
      recycleTarget()
      resetHitStreak()
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.8, 0.8, 0.1]} />
      <meshBasicMaterial ref={materialRef} color={currentColor.current} toneMapped={false} />
    </mesh>
  )
}

export default TargetInstance