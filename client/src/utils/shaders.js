import * as THREE from 'three'

export class RoadShaderMaterialImpl extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTime: { value: 0 },
        uFragmentTime: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vUv = uv;
          vec3 transformed = position;
          float pulse = sin(uv.y * 20.0 + uTime * 3.0) * 0.1;
          transformed += normal * pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uFragmentTime;
        varying vec2 vUv;

        void main() {
          vec2 grid = abs(fract(vUv * vec2(6.0, 40.0)) - 0.5);
          float line = min(grid.x, grid.y);
          float mask = 1.0 - smoothstep(0.02, 0.05, line);
          vec3 color = vec3(0.0, 1.0, 1.0) * mask;
          gl_FragColor = vec4(color, mask * 0.9);
        }
      `,
      transparent: true,
    })
  }

  get uTime() { return this.uniforms.uTime.value }
  set uTime(v) { this.uniforms.uTime.value = v }

  get uFragmentTime() { return this.uniforms.uFragmentTime.value }
  set uFragmentTime(v) { this.uniforms.uFragmentTime.value = v }
}

export default RoadShaderMaterialImpl