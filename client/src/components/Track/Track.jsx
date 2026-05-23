import { TRACK_LENGTH } from '../../shared/constants'
import { extend, useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import useStore from '../../shared/store'
import * as THREE from 'three'
import RoadShaderMaterial from '../../utils/shaders'

extend({ RoadShaderMaterial })

export function generateSplinePoints(count = 60) {
    const points = []
    let position = new THREE.Vector3(0, 0, 0)
    let direction = new THREE.Vector3(0, 0, -1)

    for (let i = 0; i < count; i++) {
        points.push(position.clone())
        direction.x += (Math.random() - 0.5) * 0.1
        direction.y += (Math.random() - 0.5) * 0.05
        direction.normalize()
        position = position.clone().addScaledVector(direction, TRACK_LENGTH / count)
    }

    return points
}

export const roadCurve = new THREE.CatmullRomCurve3(generateSplinePoints(60))

const Track = () => {
    const ref = useRef()
    const meshRef = useRef()
    const start = useStore((store) => store.startGame)


    const geometry = useMemo(() => {
        return new THREE.TubeGeometry(
            roadCurve,
            300,
            5,
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
    })

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <roadShaderMaterial ref={ref} side={THREE.DoubleSide}/>

        </mesh>
    )
}

export default Track