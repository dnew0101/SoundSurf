import useStore from '../shared/store'

export const HUD = () => {
    const username = useStore((s) => s.username)
    const score = useStore((s) => s.score)

    return (
        <div className="absolute top-4 left-4 z-50 text-white">
            <div className="bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                <div className="text-sm text-yellow-300">Player</div>
                <div className="text-lg font-bold text-orange-400">{username ?? 'Guest'}</div>
                <div className="mt-2 text-xs text-slate-300">Score: {score}</div>
            </div>
        </div>
    )
}