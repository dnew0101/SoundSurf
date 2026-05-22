import { Canvas } from '@react-three/fiber';
import * as THREE from 'three'
import Model from './Scene';
import ErrorBoundary from './ErrorBoundary';
import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';

export default function GameCanvas() {
    return (
        <Canvas
            camera={{ position: [0, 0, 800], fov: 50 }}
            onCreated={(state) => {
                state.gl.toneMapping = THREE.ACESFilmicToneMapping
                state.gl.outputEncoding = THREE.sRGBEncoding
                state.gl.toneMappingExposure = 1.6
            }}
            style={{
                position: 'fixed',
                zIndex: 0,
                inset: 0,
            }}
        >
            <hemisphereLight skyColor={0xffffff} groundColor={0x222222} intensity={0.8} />
            <ambientLight intensity={0.6} />
            <directionalLight color={0xffffff} intensity={2.5} position={[10, 20, 10]} />
            <Model />
            <OrbitControls makeDefault />
            {/* R3F Canvas for 3D element rendering */}
        </Canvas>
    );
}