import { PlayerState } from './player.controller';

// Camera interface
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Updates camera position to follow player
 * @param camera Camera object to update
 * @param player Current player state
 * @param mapWidth Total map width in pixels
 * @param mapHeight Total map height in pixels
 */
export function updateCamera(
  camera: Camera,
  player: PlayerState,
  mapWidth: number,
  mapHeight: number
): void {
  // Center camera on player
  camera.x = player.x + player.width / 2 - camera.width / 2;
  camera.y = player.y + player.height / 2 - camera.height / 2;
  
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