import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface FloorPlaneProps {
  position?: [number, number, number]
}

export const FloorPlane = ({ position = [0, 0, 0] }: FloorPlaneProps) => {
  const planeRef = useRef<Mesh>(null!)

  return (
    <mesh
      ref={planeRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[10, 10]} />
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0.8}
        roughness={0.0}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  )
}
