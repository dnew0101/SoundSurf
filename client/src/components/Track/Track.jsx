import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import useStore from '../../shared/store'
import * as THREE from 'three'
import RoadShaderMaterial from '../../utils/shaders'
import { roadParams, bpmToColor } from '../../utils/distortion'
import { roadState } from '../../utils/roadState'
import { createRoadGeometry, updateRoadGeometry, getRoadFrame } from '../../utils/roadCurve'
import {
  ROAD_SEGMENTS_LENGTH,
  ROAD_SEGMENTS_WIDTH,
} from '../../shared/road'

extend({ RoadShaderMaterial })

const Track = () => {
  const ref = useRef()
  const meshRef = useRef()
  const isPlaying = useStore((store) => store.isPlaying)
  const setFrozen = useStore((s) => s.setFrozenRoadParams)
  const trackLength = useStore((store) => store.trackLength)
  const audioParams = useStore((store) => store.audioParams)

  const geometry = useMemo(
    () => createRoadGeometry(trackLength, ROAD_SEGMENTS_LENGTH, ROAD_SEGMENTS_WIDTH),
    [trackLength],
  )

  const frozenRef = useRef(false)

  useEffect(() => {
    if (isPlaying && !frozenRef.current) {
      frozenRef.current = true
      const frozen = {
        horizontalAmp: roadParams.horizontalAmp,
        horizontalFreq: roadParams.horizontalFreq,
        verticalAmp: roadParams.verticalAmp,
        verticalFreq: roadParams.verticalFreq,
        freq: roadParams.freq,
        amp: roadParams.amp,
        timeScale: roadParams.timeScale,
        bpm: audioParams?.bpm?.current ?? 120,
        intensityScalar: audioParams?.intensityScalar?.current ?? 1,
      }
      setFrozen(frozen)
      updateRoadGeometry(geometry, trackLength, roadParams, audioParams)
    }
  }, [isPlaying, geometry, trackLength, roadParams, audioParams, setFrozen])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()

    const frozen = useStore.getState().frozenRoadParams
    const isLive = !frozen

    if (ref.current) {
      ref.current.uTime = time
      if (isPlaying) {
        ref.current.uFragmentTime = time
      }
      const bpm = audioParams?.bpm?.current ?? 120
      ref.current.uShoulderColor = bpmToColor(bpm)
    }

    if (meshRef.current && isLive) {
      updateRoadGeometry(geometry, trackLength, roadParams, audioParams)
    }

    const activeRp = frozen || roadParams
    const activeAp = frozen
      ? { bpm: { current: frozen.bpm }, intensityScalar: { current: frozen.intensityScalar } }
      : audioParams

    const shipProgress = useStore.getState().shipProgress?.current ?? 0
    const progress = Math.abs(shipProgress) / trackLength
    roadState.time = time
    roadState.progress = progress

    const frame = getRoadFrame(progress, trackLength, activeRp, activeAp, roadState.currentNormal)
    roadState.currentPoint.copy(frame.position)
    roadState.currentTangent.copy(frame.tangent)
    roadState.currentBinormal.copy(frame.binormal)
    roadState.currentNormal.copy(frame.normal)
    roadState.currentY = frame.position.y
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
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
