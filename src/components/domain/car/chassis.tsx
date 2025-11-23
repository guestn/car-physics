import { forwardRef, useMemo, useEffect, useRef, RefObject } from 'react';
import { Object3D } from 'three';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { applyCarChassisMaterials } from './material';

interface ChassisProps {
  args: [number, number, number];
  mass: number;
  chassisYOffset: number;
  onApiReady: (api: any) => void;
}

export const Chassis = forwardRef<Object3D, ChassisProps>(
  ({ args, mass = 1500, chassisYOffset, onApiReady, ...props }, ref) => {
    // Load the Porsche GLTF model
    const { scene } = useGLTF(
      '/models/1972_porsche_911_carrera_rs/porsche_rs_body.gltf'
      //'/models/porsche_911gt2/porsche_911gt2.gltf'
      //'/models/ruf_rt-12s/scene.gltf'
    );

    // Clone the scene to avoid sharing state between instances
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    const [, api] = useBox(
      () => ({
        mass,
        args,
        allowSleep: false,
        linearDamping: 0.0,
        angularDamping: 0.4,
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
        const scale = targetLength / 3.65; // Approximate model length
        clonedScene.scale.set(scale, scale, scale);

        // Rotate 180 degrees around Y axis to fix reversed Z axis
        clonedScene.rotation.y = Math.PI;

        // Center the model relative to the physics body
        clonedScene.position.set(0, -0.75, 0);

        applyCarChassisMaterials(clonedScene);
      }
    }, [clonedScene, args]);

    return (
      <group ref={ref} dispose={null}>
        <primitive object={clonedScene} />
      </group>
    );
  }
);

Chassis.displayName = 'Chassis';
