import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface SpinningCubeProps {
  position?: [number, number, number]
}

export const SpinningCube = ({ position = [0, 0, 0] }: SpinningCubeProps) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.1
    meshRef.current.rotation.y += delta * 0.1
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshPhysicalMaterial
        color="#ff6b6b"
        metalness={0.8}
        roughness={0.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}
