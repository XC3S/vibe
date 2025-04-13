import { PlayerState } from './player.controller';

// Camera interface
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Simple interface for objects with position and size
export interface PositionAndSize {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Updates camera position to follow target
 * @param camera Camera object to update
 * @param target Object to follow (must have x, y, width, height)
 * @param mapWidth Total map width in pixels
 * @param mapHeight Total map height in pixels
 */
export function updateCamera(
  camera: Camera,
  target: PositionAndSize,
  mapWidth: number,
  mapHeight: number
): void {
  // Center camera on target
  camera.x = target.x + target.width / 2 - camera.width / 2;
  camera.y = target.y + target.height / 2 - camera.height / 2;
  
  // Keep camera within map bounds
  camera.x = Math.max(0, Math.min(mapWidth - camera.width, camera.x));
  camera.y = Math.max(0, Math.min(mapHeight - camera.height, camera.y));
}

/**
 * Gets the starting tile and offset for viewport rendering
 * @param camera Camera position
 * @param tileSize Size of each tile in pixels
 * @returns Object containing starting tiles and offsets
 */
export function getViewportBounds(camera: Camera, tileSize: number) {
  return {
    startTileX: Math.floor(camera.x / tileSize),
    startTileY: Math.floor(camera.y / tileSize),
    offsetX: -camera.x % tileSize,
    offsetY: -camera.y % tileSize,
    tilesX: Math.ceil(camera.width / tileSize) + 1, // +1 to handle partial tiles
    tilesY: Math.ceil(camera.height / tileSize) + 1  // +1 to handle partial tiles
  };
} 