import { forwardRef, useMemo, useEffect, RefObject } from 'react';
import { Object3D } from 'three';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { applyCarChassisMaterials } from './material';
import type { CarConfig } from './car-config-types';

interface ChassisProps {
  args: [number, number, number];
  mass: number;
  chassisYOffset: number;
  config: CarConfig;
  onApiReady: (api: any) => void;
  position?: [number, number, number];
  [key: string]: any; // Allow additional props to be passed to useBox
}

export const Chassis = forwardRef<Object3D, ChassisProps>(
  ({ args, mass, chassisYOffset, config, onApiReady, ...props }, ref) => {
    // Load the GLTF model from config
    const { scene } = useGLTF(config.model.chassisPath);

    // Clone the scene to avoid sharing state between instances
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    const [, api] = useBox(
      () => ({
        mass,
        args,
        allowSleep: config.physics.chassis.allowSleep,
        linearDamping: config.physics.chassis.linearDamping,
        angularDamping: config.physics.chassis.angularDamping,
        ...props,
      }),
      ref as RefObject<Object3D>
    );

    useEffect(() => {
      if (onApiReady) {
        onApiReady(api);
      }
    }, [api, onApiReady]);

    // Scale and position the model to match the physics body
    useEffect(() => {
      if (clonedScene) {
        const targetLength = args[2]; // Z dimension (length)
        const scale =
          (targetLength / config.model.modelLength) * config.model.modelScale;
        clonedScene.scale.set(scale, scale, scale);

        // Rotate around Y axis from config
        clonedScene.rotation.y = config.model.modelRotationY;

        // Position the model from config
        clonedScene.position.set(...config.model.modelPosition);

        applyCarChassisMaterials(clonedScene);
      }
    }, [clonedScene, args, config.model]);

    return (
      <group ref={ref} dispose={null}>
        <primitive object={clonedScene} />
      </group>
    );
  }
);

Chassis.displayName = 'Chassis';
