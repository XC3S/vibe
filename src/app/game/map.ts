// Define tile types
export enum TileType {
  GRASS = 0,
  TREE = 1,
}

// Game map interface
export interface GameMap {
  width: number;
  height: number;
  tileSize: number;
  tiles: TileType[][];
}

/**
 * Creates a new game map with the specified dimensions
 * @param width Map width in tiles
 * @param height Map height in tiles
 * @param tileSize Size of each tile in pixels
 * @returns A new GameMap object
 */
export function createGameMap(width: number, height: number, tileSize: number): GameMap {
  // Initialize with grass
  const tiles = Array(height).fill(0).map(() => Array(width).fill(TileType.GRASS));
  
  // Add some trees in random positions
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * (width - 2)) + 1; // Avoid border
    const y = Math.floor(Math.random() * (height - 2)) + 1; // Avoid border
    tiles[y][x] = TileType.TREE;
  }
  
  // Add trees as a border
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TileType.TREE;
    tiles[height - 1][x] = TileType.TREE;
  }
  
  for (let y = 0; y < height; y++) {
    tiles[y][0] = TileType.TREE;
    tiles[y][width - 1] = TileType.TREE;
  }
  
  return {
    width,
    height,
    tileSize,
    tiles
  };
}

/**
 * Checks for collision with solid tiles on the map
 * @param x Player x position in pixels
 * @param y Player y position in pixels
 * @param width Player width in pixels 
 * @param height Player height in pixels
 * @param gameMap The game map to check against
 * @returns True if collision detected, false otherwise
 */
export function checkCollisionWithMap(
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  gameMap: GameMap
): boolean {
  const { tileSize, tiles, width: mapWidth, height: mapHeight } = gameMap;
  
  // Convert pixel position to tile position
  const leftTile = Math.floor(x / tileSize);
  const rightTile = Math.floor((x + width) / tileSize);
  const topTile = Math.floor(y / tileSize);
  const bottomTile = Math.floor((y + height) / tileSize);
  
  // Check collision with solid tiles (trees)
  for (let tileY = topTile; tileY <= bottomTile; tileY++) {
    for (let tileX = leftTile; tileX <= rightTile; tileX++) {
      // Skip out of bounds check
      if (tileY < 0 || tileY >= mapHeight || tileX < 0 || tileX >= mapWidth) {
        continue;
      }
      
      if (tiles[tileY][tileX] === TileType.TREE) {
        return true; // Collision detected
      }
    }
  }
  
  return false; // No collision
}

/**
 * Draws a tile based on its type
 * @param ctx Canvas rendering context
 * @param x X position in tiles
 * @param y Y position in tiles
 * @param type Tile type to draw
 * @param tileSize Size of each tile in pixels
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number, 
  y: number, 
  type: TileType,
  tileSize: number
): void {
  const pixelX = x * tileSize;
  const pixelY = y * tileSize;
  
  switch (type) {
    case TileType.GRASS:
      ctx.fillStyle = '#98FB98'; // Light green for grass
      ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
      break;
      
    case TileType.TREE:
      // Draw grass underneath the tree
      ctx.fillStyle = '#98FB98';
      ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
      
      // Draw tree trunk
      ctx.fillStyle = '#8B4513'; // Brown color for trunk
      ctx.fillRect(
        pixelX + tileSize / 3, 
        pixelY + tileSize / 2, 
        tileSize / 3, 
        tileSize / 2
      );
      
      // Draw tree top
      ctx.fillStyle = '#228B22'; // Forest green for leaves
      ctx.beginPath();
      ctx.arc(
        pixelX + tileSize / 2,
        pixelY + tileSize / 3,
        tileSize / 2.5,
        0, 
        Math.PI * 2
      );
      ctx.fill();
      break;
  }
} 