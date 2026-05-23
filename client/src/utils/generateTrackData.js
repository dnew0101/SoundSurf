// utils/generateTrackData.js
import Meyda from 'meyda'

const LOUDNESS_THRESHOLD = 15  // tune — higher = fewer targets
const MIN_GAP_SECONDS = 0.1    // prevent targets too close together

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

  for (let i = 0; i + BUFFER_SIZE < channelData.length; i += BUFFER_SIZE) {
    const chunk = channelData.slice(i, i + BUFFER_SIZE)

    // spectralFlux removed — use loudness only for static extract
    const features = Meyda.extract(['chroma', 'loudness'], chunk)

    if (!features) continue
    if (!features.loudness || !features.chroma) continue

    const timeSeconds = i / sampleRate
    const intensity = features.loudness.total ?? 0

    // Use loudness spike as beat proxy instead of spectralFlux
    if (intensity < LOUDNESS_THRESHOLD) continue
    if (timeSeconds - lastTargetTime < MIN_GAP_SECONDS) continue

    lastTargetTime = timeSeconds

    const chroma = Array.from(features.chroma)
    const dominant = chroma.indexOf(Math.max(...chroma))
    const lane = dominant < 4 ? 0 : dominant < 8 ? 1 : 2

    const color = intensity > 40 ? '#ff00ff' : intensity > 20 ? '#00ffff' : '#ffff00'

    targets.push({
      timeSeconds,
      z: timeToZ(timeSeconds, audioBuffer.duration, trackLength),
      lane,
      color,
    })
  }

  return targets
}