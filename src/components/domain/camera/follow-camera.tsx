import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Vector3 } from 'three';
import type { RefObject } from 'react';

interface FollowCameraProps {
  target: RefObject<Object3D>;
  offset?: [number, number, number];
  smoothness?: number;
}

export const FollowCamera = ({
  target,
  offset = [0, 3, 8],
  smoothness = 0.1,
}: FollowCameraProps) => {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3());
  const targetLookAt = useRef(new Vector3());

  useFrame(() => {
    if (!target.current) return;

    // Get car's world position and rotation
    const carPosition = new Vector3();
    const carDirection = new Vector3(0, 0, -1); // Forward direction in car's local space
    target.current.getWorldPosition(carPosition);
    target.current.localToWorld(carDirection);
    carDirection.sub(carPosition).normalize();

    // Calculate desired camera position (behind and above the car)
    const offsetVector = new Vector3(...offset);
    // Rotate offset based on car's rotation
    offsetVector.applyQuaternion(target.current.quaternion);
    targetPosition.current.copy(carPosition).add(offsetVector);

    // Calculate look-at point (slightly ahead of the car)
    const lookAhead = new Vector3(0, 1, -2);
    lookAhead.applyQuaternion(target.current.quaternion);
    targetLookAt.current.copy(carPosition).add(lookAhead);

    // Smoothly interpolate camera position
    camera.position.lerp(targetPosition.current, smoothness);
    camera.lookAt(targetLookAt.current);
  });

  return null;
};
