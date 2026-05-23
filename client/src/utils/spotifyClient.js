import useStore from '@/shared/store'
import { calcTrackLength } from '@/shared/constants'
import { roadParams } from '@/utils/distortion'
import { loadAndParseAudio } from '@/utils/audioLoader'

const API_BASE = '/api/spotify'

export async function fetchAudioFeatures(trackId, accessToken) {
  const res = await fetch(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || err.error || `Failed to fetch audio features (${res.status})`)
  }
  return res.json()
}

export async function fetchPreviewUrl(trackId, accessToken) {
  const res = await fetch(`${API_BASE}/preview/${trackId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to fetch preview URL (${res.status})`)
  }
  const data = await res.json()
  return data.previewUrl
}

/**
 * Full flow: fetch Spotify preview → decode → generate targets → start game.
 *
 * 1. Gets the 30s preview MP3 URL from the server proxy
 * 2. Fetches audio features (BPM, energy, etc.) to seed game params
 * 3. Fetches and decodes the MP3, runs Meyda analysis for targets
 * 4. Stores everything in Zustand (isLoaded: true triggers game start)
 */
export async function loadSpotifyPreview(trackId, accessToken) {
  const previewUrl = await fetchPreviewUrl(trackId, accessToken)

  const features = await fetchAudioFeatures(trackId, accessToken)
  applyAudioFeaturesToGame(features)

  return loadAndParseAudio(previewUrl)
}

export function applyAudioFeaturesToGame(features) {
  const store = useStore.getState()

  const durationSeconds = features.duration_ms / 1000
  const trackLength = calcTrackLength(durationSeconds)
  store.setTrackLength(trackLength)

  store.audioParams.bpm.current = features.tempo

  roadParams.amp = features.energy * 8
  roadParams.freq = 0.8 + features.danceability * 1.2

  store.set({ audioFeatures: features })
}