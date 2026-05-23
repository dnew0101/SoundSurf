// hooks/useSpotify.js or spotifyClient.js

export async function fetchAudioFeatures(trackId, accessToken) {
  const res = await fetch(
    `https://api.spotify.com/v1/audio-features/${trackId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const features = await res.json()
  return features
}

export function applyAudioFeaturesToGame(features) {
  const store = useStore.getState()

  // 1. Derive track length from actual duration
  const durationSeconds = features.duration_ms / 1000
  const trackLength = calcTrackLength(durationSeconds)
  store.setTrackLength(trackLength)

  // 2. Seed BPM into audioParams so ship speed starts correct immediately
  store.audioParams.bpm.current = features.tempo

  // 3. Seed road amplitude from energy
  // energy 0→1 maps to amp 0→8
  roadParams.amp = features.energy * 8

  // 4. Seed road frequency from danceability
  // high danceability = tighter, more regular hills
  roadParams.freq = 0.8 + features.danceability * 1.2

  // 5. Store the full features for other systems to read
  store.set({ audioFeatures: features })
}