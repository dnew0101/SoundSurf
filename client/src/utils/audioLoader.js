import useStore from '@/shared/store'
import { generateTrackData } from '@/utils/generateTrackData'
import { calcTrackLength, setBassScalar } from '@/shared/constants'

async function loadAndStore(audioBuffer) {
  const TEMP_LENGTH = 500
  const { targets, bassScalar } = await generateTrackData(audioBuffer, TEMP_LENGTH)
  setBassScalar(bassScalar)
  const trackLength = calcTrackLength(audioBuffer.duration)
  const zRatio = trackLength / TEMP_LENGTH
  for (const t of targets) {
    t.z *= zRatio
  }
  return { targets, trackLength }
}

export async function loadAndParseAudio(mp3Url) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioCtx = new AudioContext()

  const response = await fetch(mp3Url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

  const { targets, trackLength } = await loadAndStore(audioBuffer)

  useStore.getState().set({
    audioContext: audioCtx,
    audioBuffer,
    trackTargets: targets,
    trackLength,
    isLoaded: true,
  })

  return { audioCtx, audioBuffer, targets, trackLength }
}

export async function loadFromFile(file) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioCtx = new AudioContext()

  const arrayBuffer = await file.arrayBuffer()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

  const { targets, trackLength } = await loadAndStore(audioBuffer)

  useStore.getState().set({
    audioContext: audioCtx,
    audioBuffer,
    trackTargets: targets,
    trackLength,
    isLoaded: true,
  })

  return { audioCtx, audioBuffer, targets, trackLength }
}