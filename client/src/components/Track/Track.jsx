import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import useStore from '../../shared/store'
import * as THREE from 'three'
import RoadShaderMaterial from '../../utils/shaders'
import {
  ROAD_SEGMENTS_LENGTH,
  ROAD_SEGMENTS_WIDTH,
  ROAD_WIDTH,
} from '../../shared/road'
import { ROAD_LENGTH, getRoadY } from '../../utils/distortion'

extend({ RoadShaderMaterial })

const Track = () => {
    const ref = useRef()
    const meshRef = useRef()
    const trackLength = useStore.getState().trackLength
    const start = useStore((store) => store.startGame)
    const shipProgress = useStore((store) => store.shipProgress)


    const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
        ROAD_WIDTH,
        trackLength,        // ← dynamic
        ROAD_SEGMENTS_WIDTH,
        ROAD_SEGMENTS_LENGTH,
    )
    }, [trackLength])

    useFrame(({ clock }) => {
      const time = clock.getElapsedTime()

      if (ref.current) {
        ref.current.uTime = time

            if (start) {
                ref.current.uFragmentTime = time
            }
        }

      if (meshRef.current) {
        const progress = shipProgress.current / ROAD_LENGTH
        meshRef.current.position.y = getRoadY(progress, time)
      }
    })

    return (
        <mesh
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, -trackLength / 2]}  // ← dynamic
        >
            <roadShaderMaterial
              ref={ref}
              side={THREE.DoubleSide}
              transparent={false}
              uLanes={3}
              uLaneLineWidth={0.055}
              uShoulderWidth={0.065}
              uDashDensity={14}
              uDashLength={0.4}
            />

        </mesh>
    )
}

export default Track