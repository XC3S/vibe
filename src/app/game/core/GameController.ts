import { GameMap, checkCollisionWithMap } from '../map';
import { Camera, updateCamera } from '../camera';
import Player, { PlayerInput } from './Player';
import { TILE_SIZE } from './constants';
import Enemy from './Enemy';
import EnemyManager from './EnemyManager';
import { UI } from '../HUD';
import { PlayerState, createPlayerState } from './PlayerController';

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
  
  // Player state for UI/controls
  private _playerState: PlayerState;
  
  // Collection of enemies
  private _enemies: Enemy[] = [];
  
  // Enemy manager
  private _enemyManager: EnemyManager;
  
  // UI system
  private _ui: UI | null = null;
  
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
    
    // Initialize player state from player
    this._playerState = createPlayerState();
    this._playerState.x = player.x;
    this._playerState.y = player.y;
    this._playerState.width = player.width;
    this._playerState.height = player.height;
    this._playerState.speed = player.speed;
    
    // Create enemy manager
    this._enemyManager = new EnemyManager(this, gameMap);
  }
  
  /**
   * Initialize enemy system with spawning configuration
   * @param enemyFactories Array of enemy factory functions
   * @param enemiesPerWave Number of enemies per wave
   * @param timeBetweenWaves Time between waves in seconds
   * @param maxEnemies Maximum number of concurrent enemies
   * @param spawnPointCount Number of spawn points to generate around edges
   */
  initializeEnemySystem(
    enemyFactories: ((x: number, y: number) => Enemy)[],
    enemiesPerWave: number = 3,
    timeBetweenWaves: number = 20,
    maxEnemies: number = 10,
    spawnPointCount: number = 12
  ): void {
    // Register enemy factories
    this._enemyManager.registerEnemyFactories(enemyFactories);
    
    // Generate spawn points around the edges
    this._enemyManager.generateSpawnPointsAroundEdges(spawnPointCount);
    
    // Configure wave spawning
    this._enemyManager.configureWaveSpawning(
      enemiesPerWave,
      timeBetweenWaves,
      maxEnemies
    );
  }
  
  /**
   * Initialize the UI system
   * @param canvas Canvas element for rendering
   * @param context Canvas rendering context
   */
  initializeUI(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    this._ui = new UI(canvas, context);
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
   * Get enemy manager
   */
  get enemyManager(): EnemyManager {
    return this._enemyManager;
  }
  
  /**
   * Get all enemies
   */
  get enemies(): Enemy[] {
    return this._enemies;
  }
  
  /**
   * Get UI system
   */
  get ui(): UI | null {
    return this._ui;
  }
  
  /**
   * Get player state for UI
   */
  get playerState(): PlayerState {
    return this._playerState;
  }
  
  /**
   * Add an enemy to the game
   * @param enemy Enemy to add
   */
  addEnemy(enemy: Enemy): void {
    this._enemies.push(enemy);
  }
  
  /**
   * Add multiple enemies to the game
   * @param enemies Array of enemies to add
   */
  addEnemies(enemies: Enemy[]): void {
    this._enemies.push(...enemies);
  }
  
  /**
   * Remove an enemy from the game
   * @param enemyId ID of the enemy to remove
   */
  removeEnemy(enemyId: string): void {
    this._enemies = this._enemies.filter(enemy => enemy.id !== enemyId);
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
    
    // Sync player state
    this._playerState.x = this._player.x;
    this._playerState.y = this._player.y;
    this._playerState.moving = {
      up: this._player.input.up,
      down: this._player.input.down,
      left: this._player.input.left,
      right: this._player.input.right
    };
    
    // Update all enemies
    for (const enemy of this._enemies) {
      enemy.update(deltaTime, this._player, checkCollision);
    }
    
    // Remove dead enemies
    this._enemies = this._enemies.filter(enemy => enemy.isAlive);
    
    // Update enemy manager (handles spawning)
    this._enemyManager.update(deltaTime);
    
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
  
  /**
   * Render all enemies
   * @param ctx Canvas rendering context
   */
  renderEnemies(ctx: CanvasRenderingContext2D): void {
    for (const enemy of this._enemies) {
      enemy.render(ctx, this._camera.x, this._camera.y);
    }
  }
  
  /**
   * Render UI elements
   * @param ctx Canvas rendering context
   */
  renderUI(ctx: CanvasRenderingContext2D): void {
    if (this._ui) {
      this._ui.render(this._playerState);
    }
  }
  
  /**
   * Spawn an enemy at a random valid location on the map
   * @param enemyFactory Factory function that creates an enemy
   * @returns The spawned enemy or null if spawning failed
   */
  spawnEnemyAtRandomLocation(enemyFactory: (x: number, y: number) => Enemy): Enemy | null {
    // Maximum attempts to find a valid spawn location
    const maxAttempts = 50;
    
    for (let i = 0; i < maxAttempts; i++) {
      // Find a random position within the map bounds
      const x = Math.floor(Math.random() * (this._gameMap.width - 4) + 2) * this._tileSize;
      const y = Math.floor(Math.random() * (this._gameMap.height - 4) + 2) * this._tileSize;
      
      // Check if the position is valid (no collision with map)
      if (!checkCollisionWithMap(x, y, 48, 48, this._gameMap)) {
        // Create the enemy
        const enemy = enemyFactory(x, y);
        
        // Add it to the game
        this.addEnemy(enemy);
        
        return enemy;
      }
    }
    
    console.warn("Failed to spawn enemy after maximum attempts");
    return null;
  }
} 