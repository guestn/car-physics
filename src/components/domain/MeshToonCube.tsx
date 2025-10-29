import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface MeshToonCubeProps {
  position?: [number, number, number]
}

export const MeshToonCube = ({ position = [0, 0, 0] }: MeshToonCubeProps) => {
  const meshRef = useRef<Mesh>(null!)

  useFrame((_, delta) => {
    meshRef.current.rotation.x += delta * 0.1
    meshRef.current.rotation.y += delta * 0.1
  })

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshToonMaterial color="#ff6b6b" />
    </mesh>
  )
}
