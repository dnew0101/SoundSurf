let UNITS_PER_SECOND = 200
export const SHIP_Z_OFFSET = 15

export function calcTrackLength(durationSeconds) {
  return durationSeconds * UNITS_PER_SECOND
}

export function setBassScalar(scalar) {
  UNITS_PER_SECOND = 200 * Math.min(Math.max(scalar, 1), 2)
}
