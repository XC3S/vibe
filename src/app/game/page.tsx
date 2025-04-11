'use client';

import { useEffect, useRef } from 'react';
import { PlayerState, setupPlayerControls, updatePlayerPosition } from './player.controller';
import { GameMap, TileType, createGameMap, checkCollisionWithMap, drawTile } from './map';
import { Camera, updateCamera, getViewportBounds } from './camera';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Zelda-like RPG</h1>
      <GameCanvas />
    </div>
  );
}

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game settings
  const TILE_SIZE = 32; // Size of each tile in pixels
  const MAP_WIDTH = 50; // Map width in tiles
  const MAP_HEIGHT = 40; // Map height in tiles
  const VIEWPORT_WIDTH = 16; // Visible tiles horizontally
  const VIEWPORT_HEIGHT = 12; // Visible tiles vertically
  
  // Create the game map
  const gameMapRef = useRef<GameMap>(createGameMap(MAP_WIDTH, MAP_HEIGHT, TILE_SIZE));
  
  // Initialize player state
  const playerRef = useRef<PlayerState>({
    x: 10 * TILE_SIZE,
    y: 10 * TILE_SIZE,
    width: TILE_SIZE - 8,
    height: TILE_SIZE - 8,
    speed: 2,
    color: '#FF0000',
    moving: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  });
  
  // Initialize camera
  const cameraRef = useRef<Camera>({
    x: 0,
    y: 0,
    width: VIEWPORT_WIDTH * TILE_SIZE,
    height: VIEWPORT_HEIGHT * TILE_SIZE
  });
  
  // FPS counter ref - moved out of useEffect to fix invalid hook call
  const fpsCounterRef = useRef({
    frames: 0,
    lastTime: 0,
    value: 0
  });

  // Set up player controls
  useEffect(() => {
    return setupPlayerControls(playerRef);
  }, []);

  // Game loop and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match viewport dimensions
    canvas.width = VIEWPORT_WIDTH * TILE_SIZE;
    canvas.height = VIEWPORT_HEIGHT * TILE_SIZE;
    
    // Update camera dimensions if they change
    cameraRef.current.width = canvas.width;
    cameraRef.current.height = canvas.height;

    let animationFrameId: number;
    let lastFrameTime = 0;

    const renderGame = (timestamp: number) => {
      // Calculate delta time in seconds
      const deltaTime = lastFrameTime === 0 ? 0.016 : (timestamp - lastFrameTime) / 1000;
      lastFrameTime = timestamp;
      
      // Skip if delta time is too large (tab inactive or initial load)
      if (deltaTime > 0.1) {
        animationFrameId = requestAnimationFrame(renderGame);
        return;
      }
      
      // Update FPS counter
      fpsCounterRef.current.frames++;
      if (timestamp - fpsCounterRef.current.lastTime >= 1000) {
        fpsCounterRef.current.value = fpsCounterRef.current.frames;
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = timestamp;
      }
      
      const player = playerRef.current;
      const gameMap = gameMapRef.current;
      const camera = cameraRef.current;
      const mapWidthPx = MAP_WIDTH * TILE_SIZE;
      const mapHeightPx = MAP_HEIGHT * TILE_SIZE;
      
      // Create collision checker that uses our map
      const checkCollision = (x: number, y: number, width: number, height: number) => 
        checkCollisionWithMap(x, y, width, height, gameMap);
      
      // Update player position with delta time
      updatePlayerPosition(player, deltaTime, checkCollision, mapWidthPx, mapHeightPx);
      
      // Update camera to follow player
      updateCamera(camera, player, mapWidthPx, mapHeightPx);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get viewport boundaries for rendering
      const viewport = getViewportBounds(camera, TILE_SIZE);
      
      // Draw the visible portion of the map
      for (let y = 0; y < viewport.tilesY; y++) {
        for (let x = 0; x < viewport.tilesX; x++) {
          const mapX = viewport.startTileX + x;
          const mapY = viewport.startTileY + y;
          
          // Check if the tile is within map bounds
          if (mapX >= 0 && mapX < gameMap.width && mapY >= 0 && mapY < gameMap.height) {
            // Calculate screen position with offset for smooth scrolling
            const screenX = x + viewport.offsetX / TILE_SIZE;
            const screenY = y + viewport.offsetY / TILE_SIZE;
            
            // Draw the tile
            drawTile(ctx, screenX, screenY, gameMap.tiles[mapY][mapX], TILE_SIZE);
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
      
      // Display FPS counter
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(`FPS: ${fpsCounterRef.current.value}`, 10, 20);

      // Continue loop
      animationFrameId = requestAnimationFrame(renderGame);
    };

    // Start the game loop
    animationFrameId = requestAnimationFrame(renderGame);

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