import { TRACK_LENGTH } from '../../shared/constants'
import { extend, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import useStore from '../../shared/store'
import * as THREE from 'three'
import RoadShaderMaterial, { RoadShaderMaterialImpl } from '../../utils/shaders'

extend({ RoadShaderMaterial })

function generateSplinePoints( count = 60 ) {
    const points = []
    let position = new THREE.Vector3(0,0,0)
    let direction = new THREE.Vector3(0,0,-1)

    for( let i = 0; i < count; i++) {
        points.push(position.clone())
        direction.x += (Math.random() - 0.5) *0.3
        direction.y += (Math.random() - 0.5)*0.15
        direction.normalize()
        position = position.clone().addScaledVector(direction, TRACK_LENGTH / count)
    }

    return points
}

const Track = () => {
    const ref = useRef()
    const meshRef = useRef()
    const start = useStore((store) => store.startGame)


    const geometry = useMemo(() => {
        const points = generateSplinePoints(60)
        const curve = new THREE.CatmullRomCurve3(points)
        return new THREE.TubeGeometry(
            curve,
            300,
            1.5,
            12,
            false
        )
    }, [])

    useFrame(({ clock }) => {
        if (ref.current) {
            const time = clock.getElapsedTime()
            ref.current.uTime = time

            if (start) {
                ref.current.uFragmentTime = time
            }
        }
    
        if (meshRef.current) {
            const position = meshRef.current.geometry.attributes.position
            const t = performance.now() * 0.001
            for (let i = 0; i< position.count; i++) {
                const x = position.getX(i)
                position.setY(i, position.getY(i) + Math.sin(x * 0.4 + t * 2) * 0.002)
            }
            position.needsUpdate = true

        }
    })

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <roadShaderMaterial ref={ref} side={THREE.DoubleSide}/>

        </mesh>
    )
}

export default Track