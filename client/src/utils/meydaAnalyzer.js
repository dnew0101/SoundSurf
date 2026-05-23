// utils/meydaAnalyzer.js
import Meyda from 'meyda'

let analyzer = null

export function createAnalyzer(audioContext, sourceNode, onFrame) {
  analyzer = Meyda.createMeydaAnalyzer({
    audioContext,
    source: sourceNode,
    bufferSize: 512,
    featureExtractors: ['loudness', 'chroma', 'spectralCentroid'],
    windowingFunction: 'hanning',  
    callback: (features) => {
      // Write to mutable ref — never setState here
      onFrame(features)
    }
  })

  analyzer.start()
  return analyzer
}

export function destroyAnalyzer(instance = analyzer) {
  if (instance) {
    instance.stop()
  }

  if (instance === analyzer) {
    analyzer = null
  }
}