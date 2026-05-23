// utils/AudioLoader.js
import useStore from '@/shared/store'
import { generateTrackData } from '@/utils/generateTrackData'
import { calcTrackLength } from '@/shared/constants'  // ← function not constant

export async function loadAndParseAudio(mp3Url) {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioCtx = new AudioContext()

  const response = await fetch(mp3Url)
  const arrayBuffer = await response.arrayBuffer()
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

  // Derive track length from actual song duration
  const trackLength = calcTrackLength(audioBuffer.duration)

  // Generate targets using the real track length
  const targets = await generateTrackData(audioBuffer, trackLength)

  useStore.getState().set({
    audioContext: audioCtx,
    audioBuffer: audioBuffer,
    trackTargets: targets,
    trackLength: trackLength,   // ← store dynamic length
    isLoaded: true,
  })

  return { audioCtx, audioBuffer, targets, trackLength }
}