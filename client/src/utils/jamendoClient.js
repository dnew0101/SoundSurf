import { loadAndParseAudio } from '@/utils/audioLoader'

const API_BASE = '/api/jamendo'

/**
 * Search for tracks on Jamendo via the server proxy.
 * Returns full track info including the direct audio URL.
 */
export async function searchTracks(query, limit = 10) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Search failed (${res.status})`)
  }
  return res.json()
}

/**
 * Load a Jamendo track: fetch the full MP3 from Jamendo's CDN,
 * decode it, run Meyda analysis, and start the game.
 *
 * @param {object} track — { id, name, artist, audio, albumArt, duration }
 *   The `audio` field is a direct MP3 URL from Jamendo.
 */
export async function loadJamendoTrack(track) {
  return loadAndParseAudio(track.audio)
}
