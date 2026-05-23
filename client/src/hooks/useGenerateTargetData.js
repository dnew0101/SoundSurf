import { useMemo } from 'react'
import { TARGET_COLORS, ROAD_LANES } from '@/shared/road'

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
    const count = Math.max(16, Math.round((length || 24) * density))
    const spacing = 22

    return Array.from({ length: count }, (_, index) => {
      const lane = Math.floor(Math.random() * ROAD_LANES)
      const color = TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]
      return {
        lane,
        color,
        z: -(index * spacing + 35 + Math.random() * 30),
      }
    })
  }, [data, density])
}
