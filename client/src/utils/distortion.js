import * as THREE from 'three'

export const roadParams = {
  freq: 1.0,
  amp: 0.0,
  timeScale: 0.5,
  horizontalAmp: 50,
  horizontalFreq: 0.8,
  verticalAmp: 120,
  verticalFreq: 0.5,
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

  // Drive horizontal curves from mid/high frequency content + intensity
  roadParams.horizontalAmp = THREE.MathUtils.lerp(roadParams.horizontalAmp, 15 + mid * 80 + smoothedIntensity * 30, 0.08)
  roadParams.horizontalFreq = THREE.MathUtils.lerp(roadParams.horizontalFreq, 0.4 + mid * 2.0 + normalizedLoudness * 0.6, 0.04)

  // Drive vertical hills from low frequency content + overall loudness
  roadParams.verticalAmp = THREE.MathUtils.lerp(roadParams.verticalAmp, 20 + low * 120 + normalizedLoudness * 80, 0.08)
  roadParams.verticalFreq = THREE.MathUtils.lerp(roadParams.verticalFreq, 0.2 + normalizedLoudness * 0.8 + low * 1.5, 0.04)

  return { 
    loudnessTotal, 
    centroid, 
    normalizedLoudness, 
    low, 
    mid, 
    high 
}
}

const _bpmColor = new THREE.Color()
const _bpmCyan = new THREE.Color('#00ffff')
const _bpmRed = new THREE.Color('#ff1030')

export function bpmToColor(bpm) {
  const t = Math.min(Math.max((bpm - 80) / 120, 0), 1)
  _bpmColor.copy(_bpmCyan).lerp(_bpmRed, t)
  return _bpmColor
}