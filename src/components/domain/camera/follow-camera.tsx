import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Vector3, Quaternion } from 'three';
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
  const localOffset = useRef(new Vector3());
  const carQuaternion = useRef(new Quaternion());

  useFrame(() => {
    if (!target.current) return;

    // Update the car's world matrix to ensure rotation is current
    target.current.updateMatrixWorld(true);

    // Get car's world position
    const carPosition = new Vector3();
    target.current.getWorldPosition(carPosition);

    // Get car's world quaternion (includes all rotations including Y-axis)
    target.current.getWorldQuaternion(carQuaternion.current);

    // Create a vector in the car's local space that points behind and slightly above
    localOffset.current.set(
      offset[0], // Right/left (X axis)
      offset[1], // Up/down (Y axis)
      offset[2] // Behind (Z axis - positive Z is behind since forward is -Z)
    );

    // Transform this local offset to world space using the car's world rotation
    localOffset.current.applyQuaternion(carQuaternion.current);
    targetPosition.current.copy(carPosition).add(localOffset.current);

    // Look at the car's position (or slightly ahead for better view)
    // Calculate a point slightly ahead of the car in its forward direction
    const forwardOffset = new Vector3(0, 0, -2);
    forwardOffset.applyQuaternion(carQuaternion.current);
    targetLookAt.current.copy(carPosition).add(forwardOffset);

    // Smoothly interpolate camera position to the fixed offset position
    camera.position.lerp(targetPosition.current, smoothness);
    camera.lookAt(targetLookAt.current);
  });

  return null;
};
