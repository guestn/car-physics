import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

interface SpeedTrackerProps {
  chassisApi: any;
  onSpeedUpdate: (speedKmh: number) => void;
}

export const Speedometer = ({
  chassisApi,
  onSpeedUpdate,
}: SpeedTrackerProps) => {
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!chassisApi) return;

    // Subscribe to velocity updates
    const unsubscribe = chassisApi.velocity.subscribe(
      (velocity: [number, number, number]) => {
        velocityRef.current = velocity;
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [chassisApi]);

  useFrame(() => {
    if (!chassisApi) return;

    // Calculate speed from velocity vector (magnitude)
    const [vx, vy, vz] = velocityRef.current;
    const speedMs = Math.sqrt(vx * vx + vy * vy + vz * vz);

    // Convert m/s to km/h (multiply by 3.6)
    const speedKmh = speedMs * 3.6;

    // Update speed
    onSpeedUpdate(speedKmh);
  });

  return null;
};
