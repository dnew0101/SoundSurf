export function getDistVector3Tuple(progress, time, z, offset = [0, 0, 0]) {
  const [xOffset = 0, yOffset = 0, zOffset = 0] = offset
  const wave = Math.sin(time * 2 + progress * Math.PI * 4)
  const drift = Math.cos(time * 1.5 + progress * 6)

  return [
    xOffset + wave * 0.75,
    yOffset + drift * 0.25,
    z + zOffset,
  ]
}
