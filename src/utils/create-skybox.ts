import * as THREE from 'three';

/**
 * Creates a cube texture from a 4x3 tiled image layout
 * Adapted from https://stackoverflow.com/questions/25193649/make-three-js-skybox-from-tilemap/25224912#25224912
 *
 * Tile layout mapping:
 * [ 0] [ 3] [ 6] [ 9]  [0,0] [1,0] [2,0] [3,0]   [  ] [py] [  ] [  ]      [ ] [2] [ ] [ ]
 * [ 1] [ 4] [ 7] [10]  [0,1] [1,1] [2,1] [3,1]   [nx] [pz] [px] [nz]      [1] [4] [0] [5]
 * [ 2] [ 5] [ 8] [11]  [0,2] [1,2] [2,2] [3,2]   [  ] [ny] [  ] [  ]      [ ] [3] [ ] [ ]
 *
 * Three.js cubemap order: ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"]
 * Mapping indices: [7, 1, 5, 3, 4, 10] = [px, nx, py, ny, pz, nz]
 */
export const createSkyBoxFrom4x3 = (
  image: HTMLImageElement | string,
  onLoad?: (texture: THREE.CubeTexture) => void,
  onError?: (error: Error) => void
): Promise<THREE.CubeTexture> => {
  return new Promise((resolve, reject) => {
    const numCols = 4;
    const numRows = 3;

    // Load image if string path is provided
    const loadImage = (): Promise<HTMLImageElement> => {
      if (typeof image === 'string') {
        return new Promise((imgResolve, imgReject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => imgResolve(img);
          img.onerror = () =>
            imgReject(new Error(`Failed to load image: ${image}`));
          img.src = image;
        });
      }
      return Promise.resolve(image);
    };

    loadImage()
      .then((img) => {
        // Calculate tile dimensions
        const tileWidth = img.width / numCols;
        const tileHeight = img.height / numRows;

        // Extract tiles from the 4x3 grid
        const imagePieces: string[] = [];

        for (let i = 0; i < numCols; ++i) {
          for (let j = 0; j < numRows; ++j) {
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileWidth;
            tileCanvas.height = tileHeight;

            const tileContext = tileCanvas.getContext('2d');
            if (!tileContext) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            tileContext.drawImage(
              img,
              i * tileWidth,
              j * tileHeight,
              tileWidth,
              tileHeight,
              0,
              0,
              tileCanvas.width,
              tileCanvas.height
            );

            imagePieces.push(tileCanvas.toDataURL());
          }
        }

        // Map tiles to Three.js cubemap order: ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"]
        // Using indices: [7, 1, 5, 3, 4, 10] = [px, nx, py, ny, pz, nz]
        const imagePieceIdx = [7, 1, 5, 3, 4, 10];
        const cubeTextureUrls = imagePieceIdx.map((idx) => imagePieces[idx]);

        // Load cube texture
        const loader = new THREE.CubeTextureLoader();
        const cubeTexture = loader.load(
          cubeTextureUrls,
          () => {
            // onLoad callback
            if (onLoad) {
              onLoad(cubeTexture);
            }
            resolve(cubeTexture);
          },
          undefined,
          (error) => {
            // onError callback
            const err = new Error(`Failed to load cube texture: ${error}`);
            if (onError) {
              onError(err);
            }
            reject(err);
          }
        );
        cubeTexture.minFilter = THREE.LinearFilter;
        cubeTexture.magFilter = THREE.LinearFilter;
        cubeTexture.flipY = true;
      })
      .catch((error) => {
        if (onError) {
          onError(error);
        }
        reject(error);
      });
  });
};
