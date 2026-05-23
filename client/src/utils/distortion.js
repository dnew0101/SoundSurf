import * as THREE from 'three'

export const roadParams = {
  freq: 1.0,
  amp: 0.0,
  timeScale: 0.5,
}

let smoothedBPM = 120
let smoothedIntensity = 1
let prevLoudness = 0

export function getRoadY(progressZ, time) {
  return (
    Math.sin(progressZ * Math.PI * roadParams.freq + time * roadParams.timeScale)
    * roadParams.amp
  )
}

export function processAudioFrame(features, audioParams, time) {
  const loudnessTotal = features?.loudness?.total ?? 0
  const centroid = features?.spectralCentroid ?? 0

  const normalizedLoudness = Math.min(loudnessTotal / 80, 1.0)

  const bands = features?.loudness?.specific ?? new Array(24).fill(0)
  const low  = bands.slice(0, 4).reduce((a, b) => a + b, 0) / 4
  const mid  = bands.slice(4, 12).reduce((a, b) => a + b, 0) / 8
  const high = bands.slice(12, 24).reduce((a, b) => a + b, 0) / 12

  const loudnessDelta = normalizedLoudness - prevLoudness
  prevLoudness = normalizedLoudness

  if (
    loudnessDelta > 0.08 &&
    time - audioParams.lastKickTime.current > 0.25
  ) {
    const interval = time - audioParams.lastKickTime.current
    const estimatedBPM = Math.max(60, Math.min(200, 60 / interval))
    smoothedBPM = THREE.MathUtils.lerp(smoothedBPM, estimatedBPM, 0.15)
    audioParams.bpm.current = smoothedBPM
    audioParams.lastKickTime.current = time
  }

  const rawIntensity = 1 + (normalizedLoudness * 0.6 + (centroid / 8000) * 0.4) * 2
  smoothedIntensity = THREE.MathUtils.lerp(smoothedIntensity, rawIntensity, 0.1)
  audioParams.intensityScalar.current = smoothedIntensity

  roadParams.amp = THREE.MathUtils.lerp(roadParams.amp, normalizedLoudness * 8, 0.08)
  roadParams.freq = 1.5

  return { 
    loudnessTotal, 
    centroid, 
    normalizedLoudness, 
    low, 
    mid, 
    high 
}
}