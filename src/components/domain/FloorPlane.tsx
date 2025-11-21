import { useTexture } from '@react-three/drei'
import { useRef } from 'react'
import { DoubleSide, Mesh } from 'three'
import { usePlane } from '@react-three/cannon'

interface FloorPlaneProps {
  position?: [number, number, number]
}

export const FloorPlane = ({ position = [0, 0, 0] }: FloorPlaneProps) => {
  const planeRef = useRef<Mesh>(null!)

  const floorTexture = useTexture('/textures/UV_Grid_Sm.jpg')

  // Plane dimensions
  const planeWidth = 1000
  const planeHeight = 1000

  const [ref] = usePlane(() => ({
    position,
    rotation: [-Math.PI / 2, 0, 0],
    material: { friction: 1.0 },
  }))

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshPhysicalMaterial
        map={floorTexture}
        metalness={0.1}
        roughness={0.0}
        side={DoubleSide}
      />
    </mesh>
  )
}
