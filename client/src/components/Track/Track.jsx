import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import useStore from '../../shared/store'
import * as THREE from 'three'
import RoadShaderMaterial from '../../utils/shaders'
import { getRoadY } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'
import {
  ROAD_SEGMENTS_LENGTH,
  ROAD_SEGMENTS_WIDTH,
  ROAD_WIDTH,
} from '../../shared/road'

extend({ RoadShaderMaterial })

const Track = () => {
    const ref = useRef()
    const meshRef = useRef()
    const start = useStore((store) => store.startGame)
    const trackLength = useStore((store) => store.trackLength)


    const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
        ROAD_WIDTH,
    trackLength,
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
        meshRef.current.position.y = roadState.currentY
      }
    })

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -trackLength / 2]}
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