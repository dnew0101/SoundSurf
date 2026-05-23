import * as THREE from 'three'
import { ROAD_WIDTH } from '../shared/road'

export function getRoadPoint(t, trackLength, roadParams, audioParams) {
  const intensity = audioParams?.intensityScalar?.current ?? 4
  const bpm = audioParams?.bpm?.current ?? 120

  const hAmp = (roadParams?.horizontalAmp ?? 100) * intensity
  const hFreq = roadParams?.horizontalFreq ?? 25
  const vAmp = (roadParams?.verticalAmp ?? 100) * intensity
  const vFreq = roadParams?.verticalFreq ?? 20

  const z = -t * trackLength

  const x =
    Math.sin(t * Math.PI * hFreq) * hAmp +
    Math.sin(t * Math.PI * hFreq * 2.4) * hAmp * 0.4 +
    Math.sin(t * Math.PI * hFreq * 5) * hAmp * 0.2 +
    Math.sin(t * Math.PI * hFreq * 9) * hAmp * 0.1 +
    Math.sin(t * Math.PI * (bpm / 60)) * hAmp * 0.3 * Math.max(0, intensity - 0.4)

  const y =
    Math.sin(t * Math.PI * vFreq) * vAmp +
    Math.cos(t * Math.PI * vFreq * 1.8) * vAmp * 0.35 +
    Math.sin(t * Math.PI * vFreq * 4.5) * vAmp * 0.15 +
    Math.cos(t * Math.PI * vFreq * 8) * vAmp * 0.08 +
    Math.sin(t * Math.PI * (bpm / 120)) * vAmp * 0.5 * Math.max(0, intensity - 0.5)

  return new THREE.Vector3(x, y, z)
}

export function getRoadFrame(t, trackLength, roadParams, audioParams, prevNormal) {
  const dt = 0.001
  const t0 = Math.max(0, t - dt)
  const t1 = Math.min(1, t + dt)

  const p0 = getRoadPoint(t0, trackLength, roadParams, audioParams)
  const p1 = getRoadPoint(t1, trackLength, roadParams, audioParams)
  const center = getRoadPoint(t, trackLength, roadParams, audioParams)

  const tangent = new THREE.Vector3().copy(p1).sub(p0).normalize()

  const worldUp = new THREE.Vector3(0, 1, 0)
  const absDot = Math.abs(tangent.dot(worldUp))

  let binormal
  if (absDot > 0.999) {
    const ref =
      prevNormal && prevNormal.lengthSq() > 0
        ? prevNormal
        : new THREE.Vector3(0, 0, 1)
    binormal = new THREE.Vector3().crossVectors(tangent, ref).normalize()
    if (binormal.lengthSq() < 0.001) binormal.set(1, 0, 0)
  } else {
    binormal = new THREE.Vector3().crossVectors(tangent, worldUp).normalize()
  }

  const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()

  return { position: center, tangent, binormal, normal }
}

export function updateRoadGeometry(geometry, trackLength, roadParams, audioParams) {
  const posAttr = geometry.attributes.position
  const segT = geometry.userData.segT
  const segU = geometry.userData.segU
  const positions = posAttr.array

  let prevNormal = new THREE.Vector3(0, 1, 0)

  for (let i = 0; i <= segT; i++) {
    const t = i / segT
    const frame = getRoadFrame(t, trackLength, roadParams, audioParams, prevNormal)
    prevNormal.copy(frame.normal)

    for (let j = 0; j <= segU; j++) {
      const u = (j / segU - 0.5) * ROAD_WIDTH
      const idx = (i * (segU + 1) + j) * 3

      positions[idx] = frame.position.x + u * frame.binormal.x
      positions[idx + 1] = frame.position.y + u * frame.binormal.y
      positions[idx + 2] = frame.position.z + u * frame.binormal.z
    }
  }

  posAttr.needsUpdate = true
  geometry.computeVertexNormals()
}

export function createRoadGeometry(trackLength, segT, segU) {
  const vertexCount = (segT + 1) * (segU + 1)
  const positions = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const indexCount = segT * segU * 6
  const indices = new Uint16Array(indexCount)

  for (let i = 0; i <= segT; i++) {
    const z = -(i / segT) * trackLength
    for (let j = 0; j <= segU; j++) {
      const u = (j / segU - 0.5) * ROAD_WIDTH
      const idx = (i * (segU + 1) + j)

      positions[idx * 3] = u
      positions[idx * 3 + 1] = 0
      positions[idx * 3 + 2] = z

      uvs[idx * 2] = j / segU
      uvs[idx * 2 + 1] = i / segT
    }
  }

  let idx = 0
  for (let i = 0; i < segT; i++) {
    for (let j = 0; j < segU; j++) {
      const a = i * (segU + 1) + j
      const b = a + 1
      const c = a + (segU + 1)
      const d = c + 1

      indices[idx++] = a; indices[idx++] = b; indices[idx++] = c
      indices[idx++] = b; indices[idx++] = d; indices[idx++] = c
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.userData = { segT, segU }

  return geometry
}
