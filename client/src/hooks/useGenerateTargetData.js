import { useMemo } from 'react'

function getSourceLength(data) {
  if (Array.isArray(data)) return data.length
  if (Array.isArray(data?.beats)) return data.beats.length
  if (Array.isArray(data?.targets)) return data.targets.length
  if (Array.isArray(data?.analysis)) return data.analysis.length
  return 0
}

export default function useGenerateTargetData(data, density = 0.3) {
  return useMemo(() => {
    const length = getSourceLength(data)
    const count = Math.max(12, Math.round((length || 24) * density))

    return Array.from({ length: count }, (_, index) => {
      const lane = (index % 5) - 2
      return {
        position: [lane * 2, 0, -(index * 12 + 20)],
        offset: lane * 0.4,
      }
    })
  }, [data, density])
}
