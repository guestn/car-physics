import { useTexture } from '@react-three/drei'
import { useRef } from 'react'
import { DoubleSide, Mesh } from 'three'

interface FloorPlaneProps {
  position?: [number, number, number]
}

export const FloorPlane = ({ position = [0, 0, 0] }: FloorPlaneProps) => {
  const planeRef = useRef<Mesh>(null!)

  const floorTexture = useTexture('/textures/UV_Grid_Sm.jpg')

  return (
    <mesh
      ref={planeRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[10, 10]} />
      <meshPhysicalMaterial
        map={floorTexture}
        metalness={0.8}
        roughness={0.0}
        side={DoubleSide}
      />
    </mesh>
  )
}
