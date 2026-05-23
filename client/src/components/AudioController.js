// components/AudioController.js
import { useEffect, useState } from 'react'
import useStore from '@/shared/store'
import useAudioAnalysis from '@/hooks/useAudioAnalysis'

export default function AudioController() {
  const audioContext = useStore((s) => s.audioContext)
  const audioBuffer = useStore((s) => s.audioBuffer)
  const set = useStore((s) => s.set)
  
  const [sourceNode, setSourceNode] = useState(null)

  useEffect(() => {
    if (!audioContext || !audioBuffer) return

    // 1. Create the source node from our decoded buffer
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer

    // 2. Route the audio to the computer's speakers
    source.connect(audioContext.destination)

    // 3. Save source node so Meyda can attach to it
    setSourceNode(source)

    // 4. Start playback and record the exact hardware time
    const startTime = audioContext.currentTime
    set({ audioStartTime: startTime, isPlaying: true })
    
    source.start(0)

    // Cleanup: Stop audio if component unmounts
    return () => {
      source.stop()
      source.disconnect()
      set({ isPlaying: false, audioStartTime: null })
    }
  }, [audioContext, audioBuffer, set])

  // Attach realtime visualizer effects
  useAudioAnalysis({ audioContext, sourceNode })

  return null // This is a headless logic component
}