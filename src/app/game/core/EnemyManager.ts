import { GameMap, checkCollisionWithMap } from '../map';
import Enemy from './Enemy';
import { TILE_SIZE } from './constants';

// Interface to define what we need from GameController without importing it directly
interface IGameController {
  enemies: Enemy[];
  addEnemy(enemy: Enemy): void;
}

/**
 * EnemyManager handles the spawning and management of enemies in the game.
 */
export default class EnemyManager {
  private _gameController: IGameController;
  private _gameMap: GameMap;
  private _spawnPoints: { x: number, y: number }[] = [];
  private _enemyFactories: ((x: number, y: number) => Enemy)[] = [];
  
  // Wave spawning settings
  private _waveCount: number = 0;
  private _enemiesPerWave: number = 3;
  private _timeBetweenWaves: number = 30; // seconds
  private _waveTimer: number = 5; // Start first wave after 5 seconds
  private _maxConcurrentEnemies: number = 15;
  
  // Debug mode
  private _debugMode: boolean = false;
  
  /**
   * Create a new EnemyManager
   * @param gameController The game controller
   * @param gameMap The game map
   */
  constructor(gameController: IGameController, gameMap: GameMap) {
    this._gameController = gameController;
    this._gameMap = gameMap;
  }
  
  /**
   * Register enemy factory functions
   * @param factories Array of functions that create enemies
   */
  registerEnemyFactories(factories: ((x: number, y: number) => Enemy)[]): void {
    this._enemyFactories.push(...factories);
  }
  
  /**
   * Add a spawn point
   * @param x X position in tiles
   * @param y Y position in tiles
   */
  addSpawnPoint(x: number, y: number): void {
    this._spawnPoints.push({ 
      x: x * TILE_SIZE, 
      y: y * TILE_SIZE 
    });
  }
  
  /**
   * Configure wave spawning
   * @param enemiesPerWave Number of enemies to spawn per wave
   * @param timeBetweenWaves Time between waves in seconds
   * @param maxConcurrentEnemies Maximum number of enemies allowed at once
   */
  configureWaveSpawning(
    enemiesPerWave: number,
    timeBetweenWaves: number,
    maxConcurrentEnemies: number
  ): void {
    this._enemiesPerWave = enemiesPerWave;
    this._timeBetweenWaves = timeBetweenWaves;
    this._maxConcurrentEnemies = maxConcurrentEnemies;
  }
  
  /**
   * Get current wave number
   */
  get currentWave(): number {
    return this._waveCount;
  }
  
  /**
   * Set debug mode
   */
  set debugMode(value: boolean) {
    this._debugMode = value;
  }
  
  /**
   * Get debug mode
   */
  get debugMode(): boolean {
    return this._debugMode;
  }
  
  /**
   * Get time until next wave (in seconds)
   */
  get timeUntilNextWave(): number {
    return this._waveTimer;
  }
  
  /**
   * Generate random spawn points around the map edges
   * @param count Number of spawn points to generate
   */
  generateSpawnPointsAroundEdges(count: number): void {
    // Clear existing spawn points
    this._spawnPoints = [];
    
    // Calculate map dimensions
    const mapWidthTiles = this._gameMap.width;
    const mapHeightTiles = this._gameMap.height;
    
    // Divide points between the four edges
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      
      // Which edge?
      const edge = Math.floor(Math.random() * 4);
      
      switch (edge) {
        case 0: // Top edge
          x = Math.floor(Math.random() * (mapWidthTiles - 4)) + 2;
          y = 2;
          break;
        case 1: // Right edge
          x = mapWidthTiles - 3;
          y = Math.floor(Math.random() * (mapHeightTiles - 4)) + 2;
          break;
        case 2: // Bottom edge
          x = Math.floor(Math.random() * (mapWidthTiles - 4)) + 2;
          y = mapHeightTiles - 3;
          break;
        case 3: // Left edge
          x = 2;
          y = Math.floor(Math.random() * (mapHeightTiles - 4)) + 2;
          break;
        default:
          x = 2;
          y = 2;
      }
      
      // Check if position is valid (not blocked by map)
      if (!checkCollisionWithMap(
        x * TILE_SIZE, 
        y * TILE_SIZE, 
        48, 
        48, 
        this._gameMap
      )) {
        this._spawnPoints.push({ x: x * TILE_SIZE, y: y * TILE_SIZE });
      }
    }
    
    if (this._debugMode) {
      console.log(`Generated ${this._spawnPoints.length} spawn points`);
    }
  }
  
  /**
   * Spawn a single enemy at a spawn point
   * @returns The spawned enemy or null if spawning failed
   */
  spawnEnemy(): Enemy | null {
    // No spawn points or factories
    if (this._spawnPoints.length === 0 || this._enemyFactories.length === 0) {
      if (this._debugMode) {
        console.warn("No spawn points or enemy factories available");
      }
      return null;
    }
    
    // Check maximum enemy count
    if (this._gameController.enemies.length >= this._maxConcurrentEnemies) {
      if (this._debugMode) {
        console.log("Maximum enemy count reached");
      }
      return null;
    }
    
    // Pick a random spawn point
    const spawnPointIndex = Math.floor(Math.random() * this._spawnPoints.length);
    const spawnPoint = this._spawnPoints[spawnPointIndex];
    
    // Pick a random enemy factory
    const factoryIndex = Math.floor(Math.random() * this._enemyFactories.length);
    const enemyFactory = this._enemyFactories[factoryIndex];
    
    // Create enemy
    const enemy = enemyFactory(spawnPoint.x, spawnPoint.y);
    
    // Add to game
    this._gameController.addEnemy(enemy);
    
    if (this._debugMode) {
      console.log(`Spawned enemy at (${spawnPoint.x}, ${spawnPoint.y})`);
    }
    
    return enemy;
  }
  
  /**
   * Spawn a wave of enemies
   * @param count Number of enemies to spawn in this wave
   * @returns Array of spawned enemies
   */
  spawnWave(count: number = this._enemiesPerWave): Enemy[] {
    const result: Enemy[] = [];
    
    // Increment wave counter
    this._waveCount++;
    
    // Reset wave timer
    this._waveTimer = this._timeBetweenWaves;
    
    if (this._debugMode) {
      console.log(`Spawning wave ${this._waveCount} with ${count} enemies`);
    }
    
    // Spawn enemies
    for (let i = 0; i < count; i++) {
      const enemy = this.spawnEnemy();
      if (enemy) {
        result.push(enemy);
      }
    }
    
    return result;
  }
  
  /**
   * Update the enemy manager
   * @param deltaTime Time elapsed since last frame in seconds
   */
  update(deltaTime: number): void {
    // Update wave timer
    if (this._waveTimer > 0) {
      this._waveTimer -= deltaTime;
      
      // Time to spawn next wave
      if (this._waveTimer <= 0) {
        this.spawnWave();
      }
    }
  }
} 