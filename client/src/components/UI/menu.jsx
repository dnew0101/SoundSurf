import { useState } from 'react'
import AudioUploader from '../AudioUploader'
import JamendoSearch from './JamendoSearch'
import useStore from '../../shared/store'
import { loadFromFile } from '../../utils/audioLoader'
import { loadJamendoTrack } from '../../utils/jamendoClient'

const TABS = ['upload', 'jamendo']

const Menu = () => {
	const [name, setName] = useState('')
	const [tab, setTab] = useState('upload')
	const [loading, setLoading] = useState(false)
	const [loadError, setLoadError] = useState(null)

	const setUsername = useStore((s) => s.setUsername)
	const selectedTrack = useStore((s) => s.selectedTrack)
	const selectedJamendoTrack = useStore((s) => s.selectedJamendoTrack)

	const handleStart = async () => {
		setUsername(name || 'Guest')
		setLoadError(null)

		if (tab === 'upload' && selectedTrack?.file) {
			setLoading(true)
			try {
				await loadFromFile(selectedTrack.file)
			} catch (e) {
				setLoadError(e.message)
				setLoading(false)
				return
			}
			setLoading(false)
		} else if (tab === 'jamendo' && selectedJamendoTrack?.audio) {
			setLoading(true)
			try {
				await loadJamendoTrack(selectedJamendoTrack)
			} catch (e) {
				setLoadError(e.message)
				setLoading(false)
				return
			}
			setLoading(false)
		} else {
			setLoadError(
				tab === 'upload'
					? 'Select an audio file first'
					: 'Search and select a track first'
			)
			return
		}
	}

	const hasSelection = tab === 'upload' ? !!selectedTrack?.file : !!selectedJamendoTrack?.audio

	return (
		    <div className="min-h-screen flex items-center justify-center bg-black relative z-50">
			    <div className="w-full max-w-3xl p-8 rounded-2xl bg-black/95 shadow-2xl border border-black/40">
				<header className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-extrabold text-[#33E0D7]">SoundSurf</h1>
						<p className="text-sm text-slate-300">Ride the music. Beat the track.</p>
					</div>
					<div className="text-right">
						<div className="text-xs text-slate-400">Ready to play?</div>
						<div className="text-sm text-slate-200">Clean · Fast · Musical</div>
					</div>
				</header>

				<main className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<section className="space-y-4">
						<label className="block text-sm text-slate-300">Enter your username</label>
						<input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Player name"
							className="w-full px-4 py-3 rounded-md bg-black/40 border border-slate-700 text-white placeholder-slate-400"
						/>

						<div className="mt-2 text-xs text-slate-400">
							This name will be displayed in-game.
						</div>

						{/* Tab selector */}
						<div className="flex border-b border-slate-700 mt-4">
							{TABS.map((t) => (
								<button
									key={t}
									onClick={() => setTab(t)}
									className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
										tab === t
											? 'text-[#33E0D7] border-b-2 border-[#7B61FF]'
											: 'text-slate-500 hover:text-slate-300'
									}`}
								>
							{t === 'upload' ? 'Upload Track' : 'Jamendo'}
								</button>
							))}
						</div>

						<div className="mt-4">
							{tab === 'upload' ? <AudioUploader /> : <JamendoSearch />}
						</div>
					</section>

					<aside className="p-4 bg-black/30 rounded-lg">
						<h3 className="text-lg font-semibold text-[#7B61FF]">How to Play</h3>
						<ul className="mt-3 text-sm text-slate-300 list-disc pl-5 space-y-2">
							<li>
								{tab === 'upload'
									? 'Drop a music file (MP3, WAV) to generate your track.'
									: 'Search Jamendo\'s catalog and play any full track.'}
							</li>
							<li>Use arrow / lane controls to hit obstacles on beat.</li>
							<li>Your username will appear on the HUD.</li>
						</ul>

						{loadError && (
							<p className="mt-3 text-sm text-red-400">{loadError}</p>
						)}

						<div className="mt-6">
							<button
								onClick={handleStart}
								disabled={loading || !hasSelection}
								className={`w-full py-3 font-bold rounded-lg shadow-md transition-colors ${
									loading
										? 'bg-slate-600 text-slate-400 cursor-wait'
										    : hasSelection
											    ? 'bg-gradient-to-r from-[#33E0D7] to-[#7B61FF] text-white'
											: 'bg-slate-700 text-slate-500 cursor-not-allowed'
								}`}
							>
								{loading ? 'Analyzing Track...' : 'Start Game'}
							</button>
						</div>
					</aside>
				</main>
			</div>
		</div>
	)
}

export default Menu
