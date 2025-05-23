import { IronSword } from '../item/IronSword';
import { Item, EquipmentSlot } from '../item/Item';
import Player from './Player';

// Define equipment interface
export interface Equipment {
  [EquipmentSlot.HEAD]: Item | null;
  [EquipmentSlot.BODY]: Item | null;
  [EquipmentSlot.MAIN_HAND]: Item | null;
  [EquipmentSlot.OFF_HAND]: Item | null;
  [EquipmentSlot.GLOVES]: Item | null;
  LEFT_RING: Item | null;
  RIGHT_RING: Item | null;
  [EquipmentSlot.AMULET]: Item | null;
}

// Define player state interface
export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
  inventoryOpen: boolean;
  inventory: Array<any>; // Array to hold up to 15 items
  equipment: Equipment; // Equipment slots for the player
  moving: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  // Added skill activation flags
  skills: {
    skill1: boolean;
    skill2: boolean;
    skill3: boolean;
    skill4: boolean;
  };
}

/**
 * Sets up keyboard event listeners for player movement
 * @param playerRef Mutable reference to player state
 * @returns Cleanup function to remove event listeners
 */
export function setupPlayerControls(playerRef: { current: PlayerState }): () => void {
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
      case 'Tab':
        e.preventDefault(); // Prevent tab from changing focus
        playerRef.current.inventoryOpen = !playerRef.current.inventoryOpen;
        break;
      // Skill activation keys
      case '1':
        playerRef.current.skills.skill1 = true;
        break;
      case '2':
        playerRef.current.skills.skill2 = true;
        break;
      case '3':
        playerRef.current.skills.skill3 = true;
        break;
      case '4':
        playerRef.current.skills.skill4 = true;
        break;
      case ' ': // Space bar as an alternative for skill1 (basic attack)
        playerRef.current.skills.skill1 = true;
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
      // We don't need key up handlers for skills since they
      // are reset in the update loop after activation
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}

/**
 * Creates a new player state object
 * @returns Initial player state
 */
export function createPlayerState(): PlayerState {
  const inventory = Array(15).fill(null);
  const ironSword = new IronSword(); 
  inventory[0] = ironSword; // Add Iron Sword to the first inventory slot
  
  // Initialize empty equipment
  const equipment: Equipment = {
    [EquipmentSlot.HEAD]: null,
    [EquipmentSlot.BODY]: null,
    [EquipmentSlot.MAIN_HAND]: null,
    [EquipmentSlot.OFF_HAND]: null,
    [EquipmentSlot.GLOVES]: null,
    LEFT_RING: null,
    RIGHT_RING: null,
    [EquipmentSlot.AMULET]: null
  };
  
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    speed: 2,
    color: '#FF0000',
    inventoryOpen: false,
    inventory,
    equipment,
    moving: {
      up: false,
      down: false,
      left: false,
      right: false
    },
    skills: {
      skill1: false,
      skill2: false,
      skill3: false,
      skill4: false
    }
  };
}

/**
 * Updates player position based on movement state using delta time
 * @param player Current player state
 * @param deltaTime Time elapsed since last frame in seconds
 * @param checkCollision Function to check for collisions
 * @param mapWidth Total map width in pixels
 * @param mapHeight Total map height in pixels
 */
export function updatePlayerPosition(
  player: PlayerState, 
  deltaTime: number,
  checkCollision: (x: number, y: number, width: number, height: number) => boolean,
  mapWidth: number,
  mapHeight: number
): void {
  // Calculate movement distance based on delta time (pixels per second)
  const moveDistance = player.speed * 60 * deltaTime; // base movement on 60 FPS
  
  let newX = player.x;
  let newY = player.y;
  
  // Update position based on movement
  if (player.moving.up) newY -= moveDistance;
  if (player.moving.down) newY += moveDistance;
  if (player.moving.left) newX -= moveDistance;
  if (player.moving.right) newX += moveDistance;

  // Check collision before updating position
  if (!checkCollision(newX, newY, player.width, player.height)) {
    player.x = newX;
    player.y = newY;
  }

  // Keep player within map bounds
  player.x = Math.max(0, Math.min(mapWidth - player.width, player.x));
  player.y = Math.max(0, Math.min(mapHeight - player.height, player.y));
}

/**
 * Synchronizes equipment from the PlayerState to the Player object
 * @param player The player object to update
 * @param state The player state containing equipment data
 */
export function syncEquipmentToPlayer(player: Player, state: PlayerState): void {
  // Sync each equipment slot
  for (const slot of Object.keys(state.equipment) as Array<keyof Equipment>) {
    const item = state.equipment[slot];
    if (item !== player.equipment[slot]) {
      player.equip(item, slot);
    }
  }
}

/**
 * Synchronizes skill inputs from PlayerState to the Player object
 * @param player The player object to update
 * @param state The player state containing skill input data
 */
export function syncSkillInputsToPlayer(player: Player, state: PlayerState): void {
  // Update player's input state with skill keys
  player.updateInput({
    skill1: state.skills.skill1,
    skill2: state.skills.skill2,
    skill3: state.skills.skill3,
    skill4: state.skills.skill4
  });
  
  // Reset skills after syncing to prevent continuous activation
  state.skills.skill1 = false;
  state.skills.skill2 = false;
  state.skills.skill3 = false;
  state.skills.skill4 = false;
} 