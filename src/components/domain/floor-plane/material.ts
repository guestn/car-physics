import {
  Texture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MirroredRepeatWrapping,
  DoubleSide,
} from 'three';

export const floorTextureRepeat = {
  baseTexture: 150,
  normalMap: 500,
};

/**
 * Material properties for the floor plane
 */
export const floorMaterialProps = {
  normalScale: [0.1, 0.1] as [number, number],
  metalness: 0.1,
  roughness: 0.1,
  clearcoat: 0.6,
  clearcoatRoughness: 0.2,
  side: DoubleSide,
};

/**
 * Configures the base texture for the floor plane
 */
export const configureFloorTexture = (texture: Texture) => {
  if (!texture) return;

  texture.wrapS = MirroredRepeatWrapping;
  texture.wrapT = MirroredRepeatWrapping;
  texture.repeat.set(
    floorTextureRepeat.baseTexture,
    floorTextureRepeat.baseTexture
  );
  texture.offset.set(0.5, 0.5);
  texture.anisotropy = 16;

  try {
    if ('colorSpace' in texture) {
      texture.colorSpace = 'srgb';
    }
  } catch (e) {
    console.warn('Could not set texture colorSpace:', e);
  }

  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
};

/**
 * Configures the normal map texture for the floor plane
 */
export const configureNormalMap = (normalMap: Texture) => {
  if (!normalMap) return;

  normalMap.wrapS = MirroredRepeatWrapping;
  normalMap.wrapT = MirroredRepeatWrapping;
  normalMap.repeat.set(
    floorTextureRepeat.normalMap,
    floorTextureRepeat.normalMap
  );
  normalMap.generateMipmaps = true;
  normalMap.minFilter = LinearMipmapLinearFilter;
  normalMap.magFilter = LinearFilter;
};
