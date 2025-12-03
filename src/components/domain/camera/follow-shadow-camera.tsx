import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Vector3, DirectionalLight, CameraHelper } from 'three';
import type { RefObject } from 'react';

interface FollowShadowCameraProps {
  target: RefObject<Object3D>;
  lightRef: RefObject<DirectionalLight>;
  shadowSize?: number;
  shadowDistance?: number;
  showHelper?: boolean;
}

export const FollowShadowCamera = ({
  target,
  lightRef,
  shadowSize = 10,
  shadowDistance = 100,
  showHelper = true,
}: FollowShadowCameraProps) => {
  const { scene } = useThree();
  const targetPosition = useRef(new Vector3());
  const lightOffset = useRef(new Vector3(50, 150, 50)); // Same offset as initial position
  const helperRef = useRef<CameraHelper | null>(null);

  useEffect(() => {
    if (!lightRef.current?.shadow || !showHelper) return;

    const shadowCamera = lightRef.current.shadow.camera;
    const helper = new CameraHelper(shadowCamera);
    helperRef.current = helper;
    scene.add(helper);

    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.dispose();
        helperRef.current = null;
      }
    };
  }, [lightRef, scene, showHelper]);

  useFrame(() => {
    if (!target.current || !lightRef.current) return;

    // Get car's world position
    target.current.getWorldPosition(targetPosition.current);

    // Update directional light position to follow the car at the same relative offset
    // This maintains the same angle so shadows are always under the car
    const light = lightRef.current;
    light.position.set(
      targetPosition.current.x + lightOffset.current.x,
      targetPosition.current.y + lightOffset.current.y,
      targetPosition.current.z + lightOffset.current.z
    );

    // Make the light look at the car to maintain consistent shadow direction
    light.target.position.copy(targetPosition.current);
    light.target.updateMatrixWorld();

    // Update shadow camera position to follow the car
    if (light.shadow) {
      const shadowCamera = light.shadow.camera;

      // Position shadow camera above the car
      shadowCamera.position.set(
        targetPosition.current.x,
        targetPosition.current.y + 50,
        targetPosition.current.z
      );

      // Make shadow camera look at the car
      shadowCamera.lookAt(targetPosition.current);

      // Update shadow camera bounds to keep car in view
      shadowCamera.left = -shadowSize;
      shadowCamera.right = shadowSize;
      shadowCamera.top = shadowSize;
      shadowCamera.bottom = -shadowSize;
      shadowCamera.near = 0.1;
      shadowCamera.far = shadowDistance;

      // Update the shadow camera's projection matrix
      shadowCamera.updateProjectionMatrix();

      if (helperRef.current) {
        helperRef.current.update();
      }
    }
  });

  return null;
};
