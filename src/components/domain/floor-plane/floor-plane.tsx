import { useTexture } from '@react-three/drei';
import { usePlane } from '@react-three/cannon';
import {
  configureFloorTexture,
  configureNormalMap,
  floorMaterialProps,
} from './material';

interface FloorPlaneProps {
  position?: [number, number, number];
}

export const FloorPlane = ({ position = [0, 0, 0] }: FloorPlaneProps) => {
  const [floorTexture, normalMap] = useTexture([
    '/textures/road_map.jpg',
    '/textures/road_normal.jpg',
  ]);

  // Configure textures immediately - useTexture returns already-loaded textures
  // We configure them here so the repeat settings are applied before the material uses them
  configureFloorTexture(floorTexture);
  configureNormalMap(normalMap);

  // Plane dimensions
  const planeWidth = 1000;
  const planeHeight = 1000;

  const [ref] = usePlane(() => ({
    position,
    rotation: [-Math.PI / 2, 0, 0],
    material: { friction: 1.0 },
  }));

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshPhysicalMaterial
        map={floorTexture}
        normalMap={normalMap}
        {...floorMaterialProps}
      />
    </mesh>
  );
};
