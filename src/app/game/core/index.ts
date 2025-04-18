// Import constants
import { TILE_SIZE } from './constants';

// Import core classes
import GameObject from './Object';
import Actor, { Direction } from './Actor';
import Enemy, { EnemyState } from './Enemy';
import Player from './Player';
import GameController from './GameController';
import { PlayerState, setupPlayerControls, createPlayerState, updatePlayerPosition } from './PlayerController';

// Export constants
export { TILE_SIZE };

// Export utility functions
export { 
  loadPlayerSprites, 
  preloadImage, 
  preloadImages, 
  generateId 
} from './utils';

// Export all components
export {
  GameObject,
  Actor,
  Direction,
  Enemy,
  EnemyState,
  Player,
  GameController,
  setupPlayerControls,
  createPlayerState,
  updatePlayerPosition
};

// Export types
export type { PlayerState }; 

// Default export
export default {
  GameObject,
  Actor,
  Player,
  Enemy,
  GameController
}; 