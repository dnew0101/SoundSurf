import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../../shared/store'
import { searchTracks } from '../../utils/jamendoClient'

const JamendoSearch = () => {
  const selectedJamendoTrack = useStore((s) => s.selectedJamendoTrack)
  const set = useStore((s) => s.set)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState(null)
  const searchTimer = useRef(null)

  const search = useCallback(async (q) => {
    if (!q.trim()) return
    setIsSearching(true)
    setError(null)
    try {
      const tracks = await searchTracks(q)
      setResults(tracks)
    } catch (e) {
      setError(e.message)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!query.trim()) { setResults([]); return }
    searchTimer.current = setTimeout(() => search(query), 400)
    return () => clearTimeout(searchTimer.current)
  }, [query, search])

  const handleSelect = (track) => {
    set({ selectedJamendoTrack: track })
  }

  const handleClear = () => {
    set({ selectedJamendoTrack: null })
  }

  return (
    <div className="space-y-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a track..."
        className="w-full px-4 py-3 rounded-md bg-black/40 border border-slate-700 text-white placeholder-slate-400"
      />

      {isSearching && <p className="text-xs text-slate-400">Searching...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {selectedJamendoTrack && (
        <div className="flex items-center gap-3 p-2 bg-black/40 rounded-md border border-slate-600">
          {selectedJamendoTrack.albumArt && (
            <img
              src={selectedJamendoTrack.albumArt}
              alt=""
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">{selectedJamendoTrack.name}</div>
            <div className="text-xs text-slate-400 truncate">{selectedJamendoTrack.artist}</div>
          </div>
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            Clear
          </button>
        </div>
      )}

      {results.length > 0 && !selectedJamendoTrack && (
        <ul className="max-h-48 overflow-y-auto space-y-1">
          {results.map((track) => (
            <li key={track.id}>
              <button
                onClick={() => handleSelect(track)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-black/40 text-left transition-colors"
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

export default JamendoSearch