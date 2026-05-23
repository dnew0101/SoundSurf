import * as THREE from 'three'
import { ROAD_LANES, ROAD_WIDTH } from '../shared/road'

export class RoadShaderMaterialImpl extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uFragmentTime: { value: 0 },
        uBaseColor: { value: new THREE.Color('#050507') },
        uLaneLineColor: { value: new THREE.Color('#f6f7ff') },
        uShoulderColor: { value: new THREE.Color('#00ffff') },
        uLanes: { value: ROAD_LANES },
        uLaneLineWidth: { value: 0.045 },
        uShoulderWidth: { value: 0.07 },
        uDashDensity: { value: 16.0 },
        uDashLength: { value: 0.42 },
        uRoadWidth: { value: ROAD_WIDTH },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uFragmentTime;
        uniform float uLanes;
        uniform float uLaneLineWidth;
        uniform float uShoulderWidth;
        uniform float uDashDensity;
        uniform float uDashLength;
        uniform vec3 uBaseColor;
        uniform vec3 uLaneLineColor;
        uniform vec3 uShoulderColor;
        varying vec2 vUv;

        void main() {
          vec3 color = uBaseColor;

          float laneCell = fract(vUv.x * uLanes);
          float laneBoundary = min(laneCell, 1.0 - laneCell);
          float laneLineMask = 1.0 - smoothstep(0.0, uLaneLineWidth, laneBoundary);

          float dashPhase = fract(vUv.y * uDashDensity + uFragmentTime * 0.55);
          float dashMask = step(1.0 - uDashLength, dashPhase);

          float shoulderMask = step(1.0 - uShoulderWidth, vUv.x) + step(vUv.x, uShoulderWidth);
          float shoulderGlow = shoulderMask * (0.75 + 0.25 * sin(uFragmentTime * 3.0 + vUv.y * 12.0));

          color = mix(color, uLaneLineColor, laneLineMask * dashMask);
          color = mix(color, uShoulderColor, shoulderGlow);

          color += uShoulderColor * shoulderMask * 0.2;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    })
  }

  get uTime() { return this.uniforms.uTime.value }
  set uTime(v) { this.uniforms.uTime.value = v }

  get uFragmentTime() { return this.uniforms.uFragmentTime.value }
  set uFragmentTime(v) { this.uniforms.uFragmentTime.value = v }

  get uBaseColor() { return this.uniforms.uBaseColor.value }
  set uBaseColor(v) { this.uniforms.uBaseColor.value.set(v) }

  get uLaneLineColor() { return this.uniforms.uLaneLineColor.value }
  set uLaneLineColor(v) { this.uniforms.uLaneLineColor.value.set(v) }

  get uShoulderColor() { return this.uniforms.uShoulderColor.value }
  set uShoulderColor(v) { this.uniforms.uShoulderColor.value.set(v) }

  get uLanes() { return this.uniforms.uLanes.value }
  set uLanes(v) { this.uniforms.uLanes.value = v }

  get uLaneLineWidth() { return this.uniforms.uLaneLineWidth.value }
  set uLaneLineWidth(v) { this.uniforms.uLaneLineWidth.value = v }

  get uShoulderWidth() { return this.uniforms.uShoulderWidth.value }
  set uShoulderWidth(v) { this.uniforms.uShoulderWidth.value = v }

  get uDashDensity() { return this.uniforms.uDashDensity.value }
  set uDashDensity(v) { this.uniforms.uDashDensity.value = v }

  get uDashLength() { return this.uniforms.uDashLength.value }
  set uDashLength(v) { this.uniforms.uDashLength.value = v }
}

export default RoadShaderMaterialImpl