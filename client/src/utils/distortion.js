import * as THREE from 'three'
import useStore from '../shared/store'

const trackLength = useStore.getState().trackLength


export const ROAD_LENGTH = trackLength
export const roadParams = {
  freq: 1.0,
  amp: 0.0,
  timeScale: 0.5,
}

const FLUX_THRESHOLD = 0.15
let smoothedBPM = 120
let smoothedIntensity = 1

export function getRoadY(progressZ, time) {
  return Math.sin(progressZ * Math.PI * roadParams.freq + time * roadParams.timeScale) * roadParams.amp
}

export function processAudioFrame(features, audioParams, time) {
  const loudnessTotal = features?.loudness?.total ?? 0
  const flux = features?.spectralFlux ?? 0
  const centroid = features?.spectralCentroid ?? 0

  const normalizedLoudness = Math.min(loudnessTotal / 80, 1.0)

  const bands = features?.loudness?.specific ?? new Array(24).fill(0)
  const low = bands.slice(0, 4).reduce((a, b) => a + b, 0) / 4
  const mid = bands.slice(4, 12).reduce((a, b) => a + b, 0) / 8
  const high = bands.slice(12, 24).reduce((a, b) => a + b, 0) / 12

  if (flux > FLUX_THRESHOLD && time - audioParams.lastKickTime.current > 0.25) {
    const interval = time - audioParams.lastKickTime.current
    const estimatedBPM = Math.max(60, Math.min(200, 60 / interval))
    smoothedBPM = THREE.MathUtils.lerp(smoothedBPM, estimatedBPM, 0.15)
    audioParams.bpm.current = smoothedBPM
    audioParams.lastKickTime.current = time
  }

  const rawIntensity = 1 + (normalizedLoudness * 0.6 + (centroid / 8000) * 0.4) * 2
  smoothedIntensity = THREE.MathUtils.lerp(smoothedIntensity, rawIntensity, 0.1)
  audioParams.intensityScalar.current = smoothedIntensity

  roadParams.amp = THREE.MathUtils.lerp(roadParams.amp, normalizedLoudness * 4, 0.05)
  roadParams.freq = 1.0 + (low / 80) * 0.5 + (mid / 120) * 0.15 + (high / 180) * 0.1

  return {
    loudnessTotal,
    flux,
    centroid,
    normalizedLoudness,
    low,
    mid,
    high,
  }
}