import { GameMap, checkCollisionWithMap } from '../map';
import { Camera, updateCamera } from '../camera';
import Player, { PlayerInput } from './Player';
import { TILE_SIZE } from './index';

// Simpler interface for position and size (matches camera.ts requirements)
interface PositionAndSize {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * GameController class that manages the game state and logic
 */
export default class GameController {
  // References to core game elements
  private _player: Player;
  private _gameMap: GameMap;
  private _camera: Camera;
  
  // Game settings
  private _tileSize: number = TILE_SIZE;
  
  // Game state
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  
  /**
   * Create a new GameController
   * @param gameMap Game map
   * @param player Player character
   * @param camera Camera for viewport rendering
   */
  constructor(gameMap: GameMap, player: Player, camera: Camera) {
    this._gameMap = gameMap;
    this._player = player;
    this._camera = camera;
  }
  
  /**
   * Get player instance
   */
  get player(): Player {
    return this._player;
  }
  
  /**
   * Get game map
   */
  get gameMap(): GameMap {
    return this._gameMap;
  }
  
  /**
   * Get camera
   */
  get camera(): Camera {
    return this._camera;
  }
  
  /**
   * Check if game is running
   */
  get isRunning(): boolean {
    return this._isRunning;
  }
  
  /**
   * Check if game is paused
   */
  get isPaused(): boolean {
    return this._isPaused;
  }
  
  /**
   * Start the game
   */
  start(): void {
    this._isRunning = true;
    this._isPaused = false;
  }
  
  /**
   * Pause the game
   */
  pause(): void {
    this._isPaused = true;
  }
  
  /**
   * Resume the game
   */
  resume(): void {
    this._isPaused = false;
  }
  
  /**
   * Stop the game
   */
  stop(): void {
    this._isRunning = false;
  }
  
  /**
   * Update player input state
   * @param input New player input state
   */
  updatePlayerInput(input: Partial<PlayerInput>): void {
    this._player.updateInput(input);
  }
  
  /**
   * Update game state
   * @param deltaTime Time elapsed since last frame in seconds
   */
  update(deltaTime: number): void {
    if (!this._isRunning || this._isPaused) return;
    
    // Create collision checker function that uses our map
    const checkCollision = (x: number, y: number, width: number, height: number) => 
      checkCollisionWithMap(x, y, width, height, this._gameMap);
    
    // Update player
    this._player.update(deltaTime, checkCollision);
    
    // Update camera to follow player
    const mapWidthPx = this._gameMap.width * this._tileSize;
    const mapHeightPx = this._gameMap.height * this._tileSize;
    
    // Extract just the position and size properties needed by updateCamera
    const playerBounds: PositionAndSize = {
      x: this._player.x,
      y: this._player.y,
      width: this._player.width,
      height: this._player.height
    };
    
    updateCamera(
      this._camera, 
      playerBounds,
      mapWidthPx, 
      mapHeightPx
    );
  }
} 