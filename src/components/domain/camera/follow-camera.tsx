import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Object3D, Vector3, Quaternion } from 'three';
import type { RefObject } from 'react';

interface FollowCameraProps {
  target: RefObject<Object3D>;
  offset?: [number, number, number];
  steeringValueRef?: RefObject<number> | null;
  swingStrength?: number;
}

export const FollowCamera = ({
  target,
  offset = [0, 3, 8],
  steeringValueRef,
  swingStrength = 1,
}: FollowCameraProps) => {
  const { camera } = useThree();
  const localOffset = useRef(new Vector3());
  const carQuaternion = useRef(new Quaternion());

  useFrame(() => {
    if (!target.current) return;

    // Get steering value from the ref
    const steeringValue = steeringValueRef?.current ?? 0;

    // Get car's world position
    const carPosition = new Vector3();
    target.current.getWorldPosition(carPosition);

    // Get car's world quaternion
    target.current.getWorldQuaternion(carQuaternion.current);

    // Calculate lateral swing based on steering value
    // Positive steering (right turn) swings camera left (negative X)
    // Negative steering (left turn) swings camera right (positive X)
    const lateralSwing = -steeringValue * swingStrength;

    // Create a vector in the car's local space that points behind and slightly above
    // Add lateral swing to the X offset
    localOffset.current.set(
      offset[0] + lateralSwing, // Right/left (X axis) with swing
      offset[1], // Up/down (Y axis)
      offset[2] // Behind (Z axis - positive Z is behind since forward is -Z)
    );

    // Transform this local offset to world space using the car's world rotation
    localOffset.current.applyQuaternion(carQuaternion.current);
    const targetPosition = carPosition.clone().add(localOffset.current);

    // Set camera position directly with steering-based offset
    camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);

    // Look at a point slightly ahead of the car
    const forwardOffset = new Vector3(0, 0, -2);
    forwardOffset.applyQuaternion(carQuaternion.current);
    const lookAtTarget = carPosition.clone().add(forwardOffset);
    camera.lookAt(lookAtTarget);
  });

  return null;
};
