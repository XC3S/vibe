'use client';

import { useEffect, useRef } from 'react';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Zelda-like RPG</h1>
      <GameCanvas />
    </div>
  );
}

// Define tile types
enum TileType {
  GRASS = 0,
  TREE = 1,
}

// Game map using tiles
const createGameMap = (width: number, height: number): TileType[][] => {
  // Initialize with grass
  const map = Array(height).fill(0).map(() => Array(width).fill(TileType.GRASS));
  
  // Add some trees in random positions
  for (let i = 0; i < 30; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    map[y][x] = TileType.TREE;
  }
  
  // Add trees as a border
  for (let x = 0; x < width; x++) {
    map[0][x] = TileType.TREE;
    map[height - 1][x] = TileType.TREE;
  }
  
  for (let y = 0; y < height; y++) {
    map[y][0] = TileType.TREE;
    map[y][width - 1] = TileType.TREE;
  }
  
  return map;
};

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game settings
  const TILE_SIZE = 32; // Size of each tile in pixels
  const MAP_WIDTH = 50; // Map width in tiles (larger map)
  const MAP_HEIGHT = 40; // Map height in tiles (larger map)
  const VIEWPORT_WIDTH = 16; // Visible tiles horizontally
  const VIEWPORT_HEIGHT = 12; // Visible tiles vertically
  
  // Create the game map
  const gameMapRef = useRef(createGameMap(MAP_WIDTH, MAP_HEIGHT));
  
  const playerRef = useRef({
    x: 10 * TILE_SIZE, // Start at tile 10,10 (converted to pixels)
    y: 10 * TILE_SIZE,
    width: TILE_SIZE - 8, // Make player slightly smaller than tile
    height: TILE_SIZE - 8,
    speed: 3,
    color: '#FF0000',
    moving: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  });
  
  // Camera/viewport position in pixels
  const cameraRef = useRef({
    x: 0,
    y: 0
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          playerRef.current.moving.up = true;
          break;
        case 'ArrowDown':
        case 's':
          playerRef.current.moving.down = true;
          break;
        case 'ArrowLeft':
        case 'a':
          playerRef.current.moving.left = true;
          break;
        case 'ArrowRight':
        case 'd':
          playerRef.current.moving.right = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          playerRef.current.moving.up = false;
          break;
        case 'ArrowDown':
        case 's':
          playerRef.current.moving.down = false;
          break;
        case 'ArrowLeft':
        case 'a':
          playerRef.current.moving.left = false;
          break;
        case 'ArrowRight':
        case 'd':
          playerRef.current.moving.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Collision detection with tiles
  const checkCollision = (x: number, y: number, width: number, height: number): boolean => {
    // Convert pixel position to tile position
    const leftTile = Math.floor(x / TILE_SIZE);
    const rightTile = Math.floor((x + width) / TILE_SIZE);
    const topTile = Math.floor(y / TILE_SIZE);
    const bottomTile = Math.floor((y + height) / TILE_SIZE);
    
    // Check collision with solid tiles (trees)
    for (let tileY = topTile; tileY <= bottomTile; tileY++) {
      for (let tileX = leftTile; tileX <= rightTile; tileX++) {
        // Skip out of bounds check
        if (tileY < 0 || tileY >= MAP_HEIGHT || tileX < 0 || tileX >= MAP_WIDTH) {
          continue;
        }
        
        if (gameMapRef.current[tileY][tileX] === TileType.TREE) {
          return true; // Collision detected
        }
      }
    }
    
    return false; // No collision
  };

  // Game loop and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match viewport dimensions
    canvas.width = VIEWPORT_WIDTH * TILE_SIZE;
    canvas.height = VIEWPORT_HEIGHT * TILE_SIZE;

    let animationFrameId: number;

    // Draw a tile based on its type
    const drawTile = (x: number, y: number, type: TileType) => {
      switch (type) {
        case TileType.GRASS:
          ctx.fillStyle = '#98FB98'; // Light green for grass
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          break;
        case TileType.TREE:
          // Draw grass underneath the tree
          ctx.fillStyle = '#98FB98';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          
          // Draw tree trunk
          ctx.fillStyle = '#8B4513'; // Brown color for trunk
          ctx.fillRect(
            x * TILE_SIZE + TILE_SIZE / 3, 
            y * TILE_SIZE + TILE_SIZE / 2, 
            TILE_SIZE / 3, 
            TILE_SIZE / 2
          );
          
          // Draw tree top
          ctx.fillStyle = '#228B22'; // Forest green for leaves
          ctx.beginPath();
          ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 3,
            TILE_SIZE / 2.5,
            0, 
            Math.PI * 2
          );
          ctx.fill();
          break;
      }
    };

    const gameLoop = () => {
      // Update player position based on movement
      const player = playerRef.current;
      const gameMap = gameMapRef.current;
      const camera = cameraRef.current;
      
      let newX = player.x;
      let newY = player.y;
      
      if (player.moving.up) newY -= player.speed;
      if (player.moving.down) newY += player.speed;
      if (player.moving.left) newX -= player.speed;
      if (player.moving.right) newX += player.speed;

      // Check collision before updating position
      if (!checkCollision(newX, newY, player.width, player.height)) {
        player.x = newX;
        player.y = newY;
      }

      // Keep player within map bounds
      player.x = Math.max(0, Math.min(MAP_WIDTH * TILE_SIZE - player.width, player.x));
      player.y = Math.max(0, Math.min(MAP_HEIGHT * TILE_SIZE - player.height, player.y));

      // Update camera position to center on player
      camera.x = player.x + player.width / 2 - canvas.width / 2;
      camera.y = player.y + player.height / 2 - canvas.height / 2;
      
      // Keep camera within map bounds
      camera.x = Math.max(0, Math.min(MAP_WIDTH * TILE_SIZE - canvas.width, camera.x));
      camera.y = Math.max(0, Math.min(MAP_HEIGHT * TILE_SIZE - canvas.height, camera.y));

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate the starting tile based on camera position
      const startTileX = Math.floor(camera.x / TILE_SIZE);
      const startTileY = Math.floor(camera.y / TILE_SIZE);
      const offsetX = -camera.x % TILE_SIZE;
      const offsetY = -camera.y % TILE_SIZE;
      
      // Draw the visible portion of the map
      for (let y = 0; y <= VIEWPORT_HEIGHT; y++) {
        for (let x = 0; x <= VIEWPORT_WIDTH; x++) {
          const mapX = startTileX + x;
          const mapY = startTileY + y;
          
          // Check if the tile is within map bounds
          if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
            // Draw the tile at its position in the viewport (with offset)
            const screenX = x + offsetX / TILE_SIZE;
            const screenY = y + offsetY / TILE_SIZE;
            drawTile(screenX, screenY, gameMap[mapY][mapX]);
          }
        }
      }

      // Draw player (adjusted for camera position)
      ctx.fillStyle = player.color;
      ctx.fillRect(
        player.x - camera.x + 4, // Center player in tile and adjust for camera
        player.y - camera.y + 4,
        player.width,
        player.height
      );

      // Continue loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="border-4 border-gray-800 rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="bg-green-100"
      />
      <div className="bg-gray-200 p-2 text-sm">
        Use arrow keys or WASD to move
      </div>
    </div>
  );
}; 