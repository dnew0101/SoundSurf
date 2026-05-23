import { useState } from 'react'
import AudioUploader from '../AudioUploader'
import useStore from '../../shared/store'

const Menu = () => {
	const [name, setName] = useState('')
	const setUsername = useStore((s) => s.setUsername)
	const setStartGame = useStore((s) => s.setStartGame)

	const handleStart = () => {
		// Save username and close menu (start game)
		setUsername(name || 'Guest')
		setStartGame(false)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0b0502]">
			<div className="w-full max-w-3xl p-8 rounded-2xl bg-gradient-to-b from-[#120601] to-[#1a0a00] shadow-2xl border border-black/40">
				<header className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-3xl font-extrabold text-[#FF6B35]">SoundSurf</h1>
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

						<div className="mt-6">
							<AudioUploader />
						</div>
					</section>

					<aside className="p-4 bg-black/30 rounded-lg">
						<h3 className="text-lg font-semibold text-orange-300">How to Play</h3>
						<ul className="mt-3 text-sm text-slate-300 list-disc pl-5 space-y-2">
							<li>Drop a music file (MP3, WAV) to generate your track.</li>
							<li>Use arrow / lane controls to hit obstacles on beat.</li>
							<li>Your username will appear on the HUD.</li>
						</ul>

						<div className="mt-6">
							<button
								onClick={handleStart}
								className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-300 text-black font-bold rounded-lg shadow-md"
							>
								Start Game
							</button>
						</div>

						<div className="mt-6 text-xs text-slate-400">
							Theme: <span className="font-semibold text-[#FF6B35]">Orange</span> / <span className="font-semibold text-[#FFD23F]">Gold</span>
						</div>
					</aside>
				</main>
			</div>
		</div>
	)
}

export default Menu
