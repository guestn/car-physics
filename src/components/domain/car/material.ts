import {
  Object3D,
  Mesh,
  Material,
  LinearFilter,
  LinearMipmapLinearFilter,
  Texture,
  MeshPhysicalMaterial,
} from 'three';
import { convertToPhysicalMaterial } from '../../../utils/material-utils';

/**
 * Material overrides for car chassis
 */
export const carChassisMaterialOverrides = {
  metalness: 0.1,
  roughness: 0.1,
  clearcoat: 0.9,
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

        if (child.name.includes('bodywork')) {
          child.material.color.set(0xff7700);
        }

        if (child.name.includes('glass')) {
          child.material.color.set(0x999999);
          child.material.envMapIntensity = 1.0;
          child.material.roughness = 0.0;
          child.material.metalness = 1.0;
          child.material.clearcoat = 1.0;
        }
      }

      if (child.name.includes('chassis')) {
        child.material.color.set(0x000000);
        child.material.roughness = 0.7;
        child.material.metalness = 0.1;
        child.material.clearcoat = 0;
        child.material.envMapIntensity = 0;
        // child.material.clearcoatRoughness = 0.2;
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

      console.log({ child: child.name });

      let carWheelMaterialOverrides: Partial<MeshPhysicalMaterial> = {};

      if (child.material) {
        const originalMaterial = child.material as Material;
        if ((child.name = 'Tire')) {
          carWheelMaterialOverrides = {
            metalness: 0.0,
            roughness: 0.9,
            clearcoat: 0,
            envMapIntensity: 0,
          };
        } else {
          carWheelMaterialOverrides = {
            metalness: 1,
            roughness: 0.1,
            clearcoat: 0.9,
            clearcoatRoughness: 0.2,
          };
        }

        const physicalMaterial = convertToPhysicalMaterial(
          originalMaterial,
          carWheelMaterialOverrides
        );
        child.material = physicalMaterial;
      }
    }
  });
};
