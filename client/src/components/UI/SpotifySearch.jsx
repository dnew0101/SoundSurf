import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../../shared/store'

const API_BASE = '/api/spotify'

const SpotifySearch = () => {
  const spotifyAccessToken = useStore((s) => s.spotifyAccessToken)
  const selectedSpotifyTrack = useStore((s) => s.selectedSpotifyTrack)
  const set = useStore((s) => s.set)

  const [config, setConfig] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const searchTimer = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError('Failed to load Spotify config'))
  }, [])

  const search = useCallback(async (q) => {
    if (!q.trim() || !spotifyAccessToken) return
    setIsSearching(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}&limit=10`, {
        headers: { Authorization: `Bearer ${spotifyAccessToken}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Search failed')
      }
      const tracks = await res.json()
      setResults(tracks)
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [spotifyAccessToken])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!query.trim()) { setResults([]); return }
    searchTimer.current = setTimeout(() => search(query), 400)
    return () => clearTimeout(searchTimer.current)
  }, [query, search])

  const handleSelect = (track) => {
    set({ selectedSpotifyTrack: track, selectedTrack: null })
  }

  const handleClear = () => {
    set({ selectedSpotifyTrack: null })
  }

  if (error && !config) {
    return <div className="text-red-400 text-sm p-4">Failed to connect to server.</div>
  }

  if (!spotifyAccessToken) {
    return (
      <div className="space-y-4 flex flex-col w-[50%] items-center">
        <p className="text-sm text-slate-300 text-center">
          Sign in with Spotify to search for tracks and play 30-second previews.
        </p>
        <a
          href={
            config
              ? `https://accounts.spotify.com/authorize?client_id=${config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${encodeURIComponent(config.scopes)}`
              : '#'
          }
          className="inline-block px-5 py-2.5 bg-[#1DB954] text-black font-bold rounded-md hover:bg-[#1ed760] transition-colors
          text-center"
        >
          Sign in with Spotify
        </a>
        {!config && <p className="text-xs text-slate-400">Loading...</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3 flex flex-row ">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a track..."
        className="w-full px-4 py-3 rounded-md bg-black/40 border border-slate-700 text-white placeholder-slate-400"
      />

      {isSearching && <p className="text-xs text-slate-400">Searching...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {selectedSpotifyTrack && (
        <div className="flex items-center gap-3 p-2 bg-black/40 rounded-md border border-slate-600">
          {selectedSpotifyTrack.albumArt && (
            <img
              src={selectedSpotifyTrack.albumArt}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{selectedSpotifyTrack.name}</div>
            <div className="text-xs text-slate-400 truncate">{selectedSpotifyTrack.artist}</div>
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Clear
          </button>
        </div>
      )}

      {results.length > 0 && !selectedSpotifyTrack && (
        <ul className="max-h-48 overflow-y-auto space-y-1">
          {results.map((track) => (
            <li key={track.id} className="flex justify-center">
              <button
                onClick={() => handleSelect(track)}
                className="flex w-full max-w-md items-center gap-3 p-2 rounded-md hover:bg-black/40 text-left transition-colors"
              >
                {track.albumArt && (
                  <img src={track.albumArt} alt="" className="w-10 h-10 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{track.name}</div>
                  <div className="text-xs text-slate-400 truncate">{track.artist}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && query && !isSearching && (
        <p className="text-xs text-slate-500">No results found.</p>
      )}
    </div>
  )
}

export default SpotifySearch