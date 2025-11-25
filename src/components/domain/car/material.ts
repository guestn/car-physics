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

      const carWheelMaterialOverrides = {
        metalness: 0.1,
        roughness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.2,
      };

      if (child.material) {
        const originalMaterial = child.material as Material;
        if ((child.name = 'Tire')) {
          const carWheelMaterialOverrides = {
            metalness: 0.1,
            roughness: 0.5,
            clearcoat: 0,
          };

          const physicalMaterial = convertToPhysicalMaterial(
            originalMaterial,
            carWheelMaterialOverrides
          );
          child.material = physicalMaterial;
        }
      }
    }
  });
};
