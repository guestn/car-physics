import { useEffect, forwardRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Object3D } from 'three';
import { applyCarWheelMaterials } from './material';
import type { RefObject } from 'react';
import { useCylinder } from '@react-three/cannon';

interface WheelProps {
  radius: number;
  width: number;
  isLeft?: boolean;
  wireframe?: boolean;
}

export const Wheel = forwardRef<Object3D, WheelProps>(
  ({ radius, width, isLeft = false, wireframe = false }, ref) => {
    const { scene } = useGLTF(
      //'/models/1972_porsche_911_carrera_rs/porsche_rs_wheel.gltf'
      '/models/porsche_911gt2/wheel.gltf'
    );

    const clonedScene = useMemo(() => scene.clone(), [scene]);

    const [, api] = useCylinder(
      () => ({
        mass: 50,
        type: 'Kinematic',
        material: 'wheel',
        collisionFilterGroup: 0,
        rotation: [0, 0, Math.PI / 2],
        args: [radius, radius, width, 16],
      }),
      ref as RefObject<Object3D>,
      [radius, width]
    );

    // Scale and position the wheel model to match the physics body
    useEffect(() => {
      if (clonedScene) {
        // Scale the wheel to match the radius
        const scale = 1; //radius / 0.298;
        clonedScene.scale.set(isLeft ? scale : scale, scale, scale);

        // Center the wheel model
        clonedScene.position.set(0, 0, 0);

        // No rotation
        clonedScene.rotation.set(0, 0, isLeft ? Math.PI : 0);

        // Apply materials to wheels
        applyCarWheelMaterials(clonedScene);
      }
    }, [clonedScene, radius, isLeft, wireframe]);

    return (
      <group ref={ref} dispose={null}>
        <group dispose={null}>
          <primitive object={clonedScene} />
        </group>
      </group>
    );
  }
);

Wheel.displayName = 'Wheel';
