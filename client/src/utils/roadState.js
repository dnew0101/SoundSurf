import * as THREE from 'three'

export const roadState = {
  currentY: 0,
  progress: 0,
  time: 0,
  currentPoint: new THREE.Vector3(),
  currentTangent: new THREE.Vector3(0, 0, -1),
  currentNormal: new THREE.Vector3(0, 1, 0),
  currentBinormal: new THREE.Vector3(1, 0, 0),
}