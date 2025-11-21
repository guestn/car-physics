import { Material, MeshPhysicalMaterial, MeshStandardMaterial } from 'three';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';

export const convertToPhysicalMaterial = (
  material: Material,
  overrides?: Partial<MeshPhysicalMaterial>
): MeshPhysicalMaterial => {
  const physicalMaterial = new MeshPhysicalMaterial();

  if (material instanceof MeshStandardMaterial) {
    const stdMaterial = material as MeshStandardMaterial;
    physicalMaterial.color.copy(stdMaterial.color);
    physicalMaterial.roughness = stdMaterial.roughness;
    physicalMaterial.metalness = stdMaterial.metalness;
    physicalMaterial.map = stdMaterial.map;
    physicalMaterial.normalMap = stdMaterial.normalMap;
    if (stdMaterial.normalMap) {
      physicalMaterial.normalScale.copy(stdMaterial.normalScale);
    }
    physicalMaterial.roughnessMap = stdMaterial.roughnessMap;
    physicalMaterial.metalnessMap = stdMaterial.metalnessMap;
    physicalMaterial.aoMap = stdMaterial.aoMap;
    physicalMaterial.aoMapIntensity = stdMaterial.aoMapIntensity;
    physicalMaterial.emissive.copy(stdMaterial.emissive);
    physicalMaterial.emissiveIntensity = stdMaterial.emissiveIntensity;
    physicalMaterial.emissiveMap = stdMaterial.emissiveMap;
  } else {
    // Fallback for other material types - try to copy common properties
    const anyMaterial = material as any;
    if (anyMaterial.color) {
      physicalMaterial.color.copy(anyMaterial.color);
    }
    if (typeof anyMaterial.roughness === 'number') {
      physicalMaterial.roughness = 0.5; //anyMaterial.roughness
    }
    if (typeof anyMaterial.metalness === 'number') {
      physicalMaterial.metalness = anyMaterial.metalness;
    }
    if (anyMaterial.map) {
      physicalMaterial.map = anyMaterial.map;
    }
    physicalMaterial.metalness = 1;
  }

  // Configure textures with proper settings
  if (physicalMaterial.map) {
    physicalMaterial.map.colorSpace = 'srgb';
    physicalMaterial.map.generateMipmaps = true;
    physicalMaterial.map.minFilter = LinearMipmapLinearFilter;
    physicalMaterial.map.magFilter = LinearFilter;
  }

  if (physicalMaterial.normalMap) {
    physicalMaterial.normalMap.colorSpace = 'srgb';
  }

  if (physicalMaterial.roughnessMap) {
    physicalMaterial.roughnessMap.colorSpace = 'srgb';
  }

  if (physicalMaterial.metalnessMap) {
    physicalMaterial.metalnessMap.colorSpace = 'srgb';
  }

  if (physicalMaterial.aoMap) {
    physicalMaterial.aoMap.colorSpace = 'srgb';
  }

  if (physicalMaterial.emissiveMap) {
    physicalMaterial.emissiveMap.colorSpace = 'srgb';
  }

  physicalMaterial.dithering = true;

  if (overrides) {
    Object.assign(physicalMaterial, overrides);
  }

  return physicalMaterial;
};
