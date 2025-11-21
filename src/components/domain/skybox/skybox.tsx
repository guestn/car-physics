import { useRef, useMemo } from 'react';
import { CanvasTexture, DoubleSide, Mesh } from 'three';
import { getCSSVariable } from '@/utils/color-utils';

export const Skybox = ({
  position = [0, 0, 0],
}: {
  position?: [number, number, number];
}) => {
  const skyboxRef = useRef<Mesh>(null!);

  // Create a stable sky texture using useMemo to prevent regeneration
  const skyTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Create a gradient from horizon to zenith using CSS variables
    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, getCSSVariable('--color-sky-horizon')); // Sky blue at horizon
    gradient.addColorStop(0.2, getCSSVariable('--color-sky-light')); // Light blue
    gradient.addColorStop(0.4, getCSSVariable('--color-sky-pale')); // Very light blue
    gradient.addColorStop(0.7, getCSSVariable('--color-sky-very-pale')); // Almost white
    gradient.addColorStop(1, getCSSVariable('--color-sky-zenith')); // White at zenith

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some atmospheric haze using CSS variable
    ctx.fillStyle = getCSSVariable('--color-atmospheric-haze');
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

    return new CanvasTexture(canvas);
  }, []);

  return (
    <mesh ref={skyboxRef} position={position}>
      <boxGeometry args={[1000, 1000, 1000]} />
      <meshBasicMaterial map={skyTexture} side={DoubleSide} fog={false} />
    </mesh>
  );
};
