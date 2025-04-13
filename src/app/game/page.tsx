'use client';

import { useEffect, useRef } from 'react';
import { createGameMap, drawTile } from './map';
import { getViewportBounds, Camera } from './camera';
import { Player, GameController, TILE_SIZE } from './core';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">ARPG</h1>
      <GameCanvas />
    </div>
  );
}

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game settings
  const MAP_WIDTH = 50; // Map width in tiles
  const MAP_HEIGHT = 40; // Map height in tiles
  const VIEWPORT_WIDTH = 14; // Visible tiles horizontally
  const VIEWPORT_HEIGHT = 10; // Visible tiles vertically
  
  // Game controller - stores the main game state
  const gameControllerRef = useRef<GameController | null>(null);
  
  // FPS counter ref
  const fpsCounterRef = useRef({
    frames: 0,
    lastTime: 0,
    value: 0
  });

  // Setup game on component mount
  useEffect(() => {
    // Create game map
    const gameMap = createGameMap(MAP_WIDTH, MAP_HEIGHT, TILE_SIZE);
    
    // Create player
    const player = new Player(
      'player',
      10 * TILE_SIZE, // x position
      10 * TILE_SIZE, // y position
      TILE_SIZE - 8,  // width
      TILE_SIZE - 8,  // height
      2,              // speed
      '/gameAssets/soldier.png' // Default image
    );
    
    // Create camera
    const camera: Camera = {
      x: 0,
      y: 0,
      width: VIEWPORT_WIDTH * TILE_SIZE,
      height: VIEWPORT_HEIGHT * TILE_SIZE
    };
    
    // Create game controller
    const gameController = new GameController(gameMap, player, camera);
    gameController.start(); // Start the game
    
    // Store game controller in ref
    gameControllerRef.current = gameController;
  }, []);

  // Set up keyboard controls
  useEffect(() => {
    const gameController = gameControllerRef.current;
    if (!gameController) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          gameController.updatePlayerInput({ up: true });
          break;
        case 'ArrowDown':
        case 's':
          gameController.updatePlayerInput({ down: true });
          break;
        case 'ArrowLeft':
        case 'a':
          gameController.updatePlayerInput({ left: true });
          break;
        case 'ArrowRight':
        case 'd':
          gameController.updatePlayerInput({ right: true });
          break;
        case ' ':
          gameController.updatePlayerInput({ action: true });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          gameController.updatePlayerInput({ up: false });
          break;
        case 'ArrowDown':
        case 's':
          gameController.updatePlayerInput({ down: false });
          break;
        case 'ArrowLeft':
        case 'a':
          gameController.updatePlayerInput({ left: false });
          break;
        case 'ArrowRight':
        case 'd':
          gameController.updatePlayerInput({ right: false });
          break;
        case ' ':
          gameController.updatePlayerInput({ action: false });
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

  // Game loop and rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const gameController = gameControllerRef.current;
    if (!gameController) return;

    // Set canvas size to match viewport dimensions
    canvas.width = VIEWPORT_WIDTH * TILE_SIZE;
    canvas.height = VIEWPORT_HEIGHT * TILE_SIZE;

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
      
      // Update game state
      gameController.update(deltaTime);
      
      // Get references to game objects
      const player = gameController.player;
      const gameMap = gameController.gameMap;
      const camera = gameController.camera;
      
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

      // Draw player
      player.render(ctx, camera.x, camera.y);
      
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
      if (gameController) {
        gameController.stop();
      }
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