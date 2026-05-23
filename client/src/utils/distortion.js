import * as THREE from 'three'
import { TRACK_LENGTH } from '../shared/constants'

export const ROAD_LENGTH = TRACK_LENGTH
export const roadParams = {
  freq: 1.0,
  amp: 1.5,
  timeScale: 0.5,
}

export function getRoadY(progressZ, time) {
  return Math.sin(progressZ * Math.PI * roadParams.freq + time * roadParams.timeScale) * roadParams.amp
}