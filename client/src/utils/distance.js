export function distance(a, b) {
  const ax = Array.isArray(a) ? a[0] : a?.x ?? 0
  const ay = Array.isArray(a) ? a[1] : a?.y ?? 0
  const az = Array.isArray(a) ? a[2] : a?.z ?? 0

  const bx = Array.isArray(b) ? b[0] : b?.x ?? 0
  const by = Array.isArray(b) ? b[1] : b?.y ?? 0
  const bz = Array.isArray(b) ? b[2] : b?.z ?? 0

  return Math.hypot(ax - bx, ay - by, az - bz)
}
