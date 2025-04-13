import { Direction } from './Actor';
import Player from './Player';

/**
 * Load a set of directional sprites for a player
 * @param player The player instance to set sprites for
 * @param basePath Base path to sprites
 * @param fileNames Filenames for each direction (up, down, left, right)
 */
export function loadPlayerSprites(
  player: Player,
  basePath: string,
  fileNames: {
    up?: string;
    down?: string;
    left?: string;
    right?: string;
    default?: string;
  }
): void {
  // Set default image first
  if (fileNames.default) {
    player.setImage(`${basePath}/${fileNames.default}`);
  }
  
  // Set directional images
  if (fileNames.up) {
    player.setDirectionalImage(Direction.UP, `${basePath}/${fileNames.up}`);
  }
  
  if (fileNames.down) {
    player.setDirectionalImage(Direction.DOWN, `${basePath}/${fileNames.down}`);
  }
  
  if (fileNames.left) {
    player.setDirectionalImage(Direction.LEFT, `${basePath}/${fileNames.left}`);
  }
  
  if (fileNames.right) {
    player.setDirectionalImage(Direction.RIGHT, `${basePath}/${fileNames.right}`);
  }
}

/**
 * Preload an image, returning a promise that resolves when loaded
 * @param src Image source URL
 * @returns Promise that resolves with the loaded image
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Preload multiple images
 * @param srcs Array of image source URLs
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => preloadImage(src)));
}

/**
 * Generate a unique ID
 * @returns A random string ID
 */
export function generateId(): string {
  return `id_${Math.random().toString(36).substring(2, 9)}`;
} 