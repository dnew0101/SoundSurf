import Meyda from 'meyda'
import { bpmToColor, roadParams } from './distortion'
import * as THREE from 'three'

const TRANSIENT_DELTA = 4
const MIN_ABSOLUTE = 6
const MIN_GAP_SECONDS = 0.2

function timeToZ(timeSeconds, songDuration, trackLength) {
  return -(timeSeconds / songDuration) * trackLength
}

export async function generateTrackData(audioBuffer, trackLength) {
  Meyda.windowingFunction = 'hanning'

  const BUFFER_SIZE = 512
  const sampleRate = audioBuffer.sampleRate
  const channelData = audioBuffer.getChannelData(0)
  const targets = []
  let lastTargetTime = -MIN_GAP_SECONDS
  let beatCount = 0

  let sumLow = 0
  let sumMid = 0
  let sumHigh = 0
  let sumTotal = 0
  let chunksWithFeatures = 0

  let prevIntensity = 0

  for (let i = 0; i + BUFFER_SIZE < channelData.length; i += BUFFER_SIZE) {
    const chunk = channelData.slice(i, i + BUFFER_SIZE)

    const features = Meyda.extract(['chroma', 'loudness'], chunk)

    if (!features) continue
    if (!features.loudness || !features.chroma) continue

    const timeSeconds = i / sampleRate
    const intensity = features.loudness.total ?? 0
    const delta = intensity - prevIntensity
    prevIntensity = intensity

    const specific = features.loudness.specific
    if (specific && specific.length >= 24) {
      sumLow  += specific.slice(0, 4).reduce((a, b) => a + b, 0) / 4
      sumMid  += specific.slice(4, 12).reduce((a, b) => a + b, 0) / 8
      sumHigh += specific.slice(12, 24).reduce((a, b) => a + b, 0) / 12
      sumTotal += intensity
      chunksWithFeatures++
    }

    if (delta < TRANSIENT_DELTA) continue
    if (intensity < MIN_ABSOLUTE) continue
    if (timeSeconds - lastTargetTime < MIN_GAP_SECONDS) continue

    lastTargetTime = timeSeconds
    beatCount++

    const chroma = Array.from(features.chroma)
    const dominant = chroma.indexOf(Math.max(...chroma))
    const lane = dominant < 4 ? 0 : dominant < 8 ? 1 : 2

    targets.push({
      timeSeconds,
      z: timeToZ(timeSeconds, audioBuffer.duration, trackLength),
      lane,
      color: null,
    })
  }

  const duration = audioBuffer.duration
  const estimatedBPM = Math.round((beatCount / duration) * 60)
  const baseColor = bpmToColor(estimatedBPM)

  for (const t of targets) {
    t.color = '#' + baseColor.getHexString()
  }

  let bassScalar = 1
  if (chunksWithFeatures > 0) {
    const avgLow  = sumLow / chunksWithFeatures
    const avgMid  = sumMid / chunksWithFeatures
    const avgTotal = sumTotal / chunksWithFeatures
    const normalizedLoudness = Math.min(avgTotal / 80, 1.0)
    const intensity = 1 + normalizedLoudness * 1.2

    bassScalar = 1 + Math.min(avgLow / 12, 1)

    const hAmp = THREE.MathUtils.clamp(15 + avgMid * 80 + intensity * 30, 20, 120)
    const vAmp = THREE.MathUtils.clamp(20 + avgLow * 120 + normalizedLoudness * 80, 30, 250)

    roadParams.horizontalAmp = hAmp
    roadParams.horizontalFreq = THREE.MathUtils.clamp(0.4 + avgMid * 2.0 + normalizedLoudness * 0.6, 0.3, 2.0)
    roadParams.verticalAmp = vAmp
    roadParams.verticalFreq = THREE.MathUtils.clamp(0.2 + normalizedLoudness * 0.8 + avgLow * 1.5, 0.15, 1.5)
    roadParams.amp = normalizedLoudness * 8
  }

  return { targets, bassScalar }
}
