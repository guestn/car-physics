import {
  Object3D,
  Mesh,
  Material,
  LinearFilter,
  LinearMipmapLinearFilter,
  Texture,
} from 'three';
import { convertToPhysicalMaterial } from '../../../utils/material-utils';

/**
 * Material overrides for car chassis
 */
export const carChassisMaterialOverrides = {
  metalness: 0.1,
  roughness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.2,
};

/**
 * Applies materials to car chassis meshes
 */
export const applyCarChassisMaterials = (scene: Object3D) => {
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        const originalMaterial = child.material as Material;
        const physicalMaterial = convertToPhysicalMaterial(
          originalMaterial,
          carChassisMaterialOverrides
        );
        child.material = physicalMaterial;
      }
    }
  });
};

/**
 * Applies materials to wheel meshes
 */
export const applyCarWheelMaterials = (scene: Object3D) => {
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        const material = child.material as Material;
        material.dithering = true;

        if ('map' in material && material.map) {
          const texture = material.map as Texture;
          texture.colorSpace = 'srgb';
          texture.generateMipmaps = true;
          texture.minFilter = LinearMipmapLinearFilter;
          texture.magFilter = LinearFilter;
        }

        // Set proper color space for other texture maps
        if ('normalMap' in material && material.normalMap) {
          (material.normalMap as Texture).colorSpace = 'srgb';
        }
        if ('roughnessMap' in material && material.roughnessMap) {
          (material.roughnessMap as Texture).colorSpace = 'srgb';
        }
        if ('metalnessMap' in material && material.metalnessMap) {
          (material.metalnessMap as Texture).colorSpace = 'srgb';
        }
      }
    }
  });
};
