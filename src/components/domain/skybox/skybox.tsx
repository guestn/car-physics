import { useRef, useMemo, useState, useEffect } from 'react';
import {
  BackSide,
  Mesh,
  MeshStandardMaterial,
  CubeTexture,
  ShaderMaterial,
  Vector3,
} from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { createSkyBoxFrom4x3 } from '@/utils/create-skybox';

export const Skybox = ({
  position = [0, 0, 0],
  imagePath = '/skybox/skybox-512.jpg',
  size = 500,
}: {
  position?: [number, number, number];
  imagePath?: string;
  size?: number;
}) => {
  const skyboxRef = useRef<Mesh>(null!);
  const materialRef = useRef<ShaderMaterial | MeshStandardMaterial | null>(
    null
  );
  const [cubeTexture, setCubeTexture] = useState<CubeTexture | null>(null);
  const { scene, camera } = useThree();
  const cameraPositionRef = useRef(new Vector3());

  // Load the skybox texture from the 4x3 image
  useEffect(() => {
    createSkyBoxFrom4x3(imagePath)
      .then((texture) => {
        console.log('Skybox texture loaded:', texture);
        setCubeTexture(texture);
        // Set as scene environment for reflections
        scene.environment = texture;
      })
      .catch((error) => {
        console.error('Failed to load skybox:', error);
      });
  }, [imagePath, scene]);

  // Create skybox material with cube texture using a shader that displays the cubemap
  const material = useMemo(() => {
    if (!cubeTexture) {
      // Return a placeholder material while loading
      return new MeshStandardMaterial({
        color: 0x87ceeb, // Sky blue fallback
        side: BackSide,
        fog: false,
        emissive: 0x87ceeb,
        emissiveIntensity: 1,
      });
    }

    // Create a shader material that displays the cube texture based on view direction
    // For a skybox, we sample the cube texture using the direction from camera to point on sphere
    return new ShaderMaterial({
      uniforms: {
        envMap: { value: cubeTexture },
        uCameraPosition: { value: new Vector3() },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform samplerCube envMap;
        uniform vec3 uCameraPosition;
        varying vec3 vWorldPosition;
        void main() {
          // Calculate direction from camera to point on sphere
          vec3 direction = normalize(vWorldPosition - uCameraPosition);
          // Flip Y to fix upside-down issue
          direction.y = -direction.y;
          // Sample the cube texture
          gl_FragColor = textureCube(envMap, direction);
        }
      `,
      side: BackSide,
      fog: false,
      depthWrite: false, // Important: don't write to depth buffer for skybox
    });
  }, [cubeTexture]);

  // Update camera position in shader uniform each frame
  useFrame(() => {
    if (materialRef.current && materialRef.current instanceof ShaderMaterial) {
      camera.getWorldPosition(cameraPositionRef.current);
      materialRef.current.uniforms.uCameraPosition.value.copy(
        cameraPositionRef.current
      );
    }
  });

  // Store material ref
  useEffect(() => {
    materialRef.current = material;
  }, [material]);

  return (
    <mesh
      ref={skyboxRef}
      position={position}
      frustumCulled={false}
      renderOrder={-1}
    >
      <sphereGeometry args={[size, 32, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};
