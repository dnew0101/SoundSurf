import useStore from '../shared/store'

export const ROAD_WIDTH = 30
export const ROAD_LANES = 3
export const ROAD_SEGMENTS_WIDTH = 24
export const ROAD_SEGMENTS_LENGTH = 200

export const ROAD_LANE_CENTERS = [-8, 0, 8]

export const ROAD_CURVE_PRIMARY_AMPLITUDE = 2.2
export const ROAD_CURVE_PRIMARY_FREQUENCY = 3.0
export const ROAD_CURVE_SECONDARY_AMPLITUDE = 0.75
export const ROAD_CURVE_SECONDARY_FREQUENCY = 7.0
export const ROAD_CURVE_PHASE_A = 0.0
export const ROAD_CURVE_PHASE_B = 1.2

export const TARGET_COLORS = ['#00ffff', '#ff00ff', '#ffff00', '#00ff6a']

export function getLaneX(lane) {
  const maxLane = ROAD_LANE_CENTERS.length - 1
  const clampedLane = Math.min(Math.max(lane, 0), maxLane)
  const lowerIndex = Math.floor(clampedLane)
  const upperIndex = Math.min(lowerIndex + 1, maxLane)
  const interpolation = clampedLane - lowerIndex

  return ROAD_LANE_CENTERS[lowerIndex] + ((ROAD_LANE_CENTERS[upperIndex] - ROAD_LANE_CENTERS[lowerIndex]) * interpolation)
}

export function getRoadHeightAtProgress(progress) {
  const clamped = Math.min(Math.max(progress, 0), 1)
  const primary = Math.sin(clamped * Math.PI * ROAD_CURVE_PRIMARY_FREQUENCY + ROAD_CURVE_PHASE_A) * ROAD_CURVE_PRIMARY_AMPLITUDE
  const secondary = Math.sin(clamped * Math.PI * ROAD_CURVE_SECONDARY_FREQUENCY + ROAD_CURVE_PHASE_B) * ROAD_CURVE_SECONDARY_AMPLITUDE
  return primary + secondary
}

export function getRoadHeightAtZ(z) {
  const trackLength = useStore.getState().trackLength
  const distance = ((-z) % trackLength + trackLength) % trackLength
  return getRoadHeightAtProgress(distance / trackLength)
}