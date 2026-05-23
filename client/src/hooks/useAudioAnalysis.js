import { useEffect } from 'react'
import useStore from '@/shared/store'
import { createAnalyzer, destroyAnalyzer } from '@/utils/meydaAnalyzer'
import { processAudioFrame } from '@/utils/distortion'

export default function useAudioAnalysis({ audioContext, sourceNode } = {}) {
	const setAudioAnalysis = useStore((state) => state.setAudioAnalysis)
	const audioParams = useStore((state) => state.audioParams)

	useEffect(() => {
		if (!audioContext || !sourceNode) {
			return undefined
		}

		const analyzer = createAnalyzer(audioContext, sourceNode, (features) => {
			const time = audioContext.currentTime
			const processed = processAudioFrame(features, audioParams, time)
			setAudioAnalysis({ ...features, ...processed })
		})

		return () => {
			destroyAnalyzer(analyzer)
		}
	}, [audioContext, audioParams, setAudioAnalysis, sourceNode])
}
