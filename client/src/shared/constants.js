export const UNITS_PER_SECOND = 200
export const SHIP_Z_OFFSET = 15

export function calcTrackLength(durationSeconds) {
  return durationSeconds * UNITS_PER_SECOND
}