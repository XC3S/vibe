import Actor, { Direction } from './Actor';
import { Item, EquipmentSlot } from '../item/Item';
import { Weapon } from '../item/Weapon';
import SkillManager from '../skills/SkillManager';

/**
 * Player input state interface
 */
export interface PlayerInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action: boolean;
  skill1: boolean;
  skill2: boolean;
  skill3: boolean;
  skill4: boolean;
}

/**
 * Equipment interface for player
 */
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

/**
 * Player class representing the player-controlled character.
 * Extends the Actor class.
 */
export default class Player extends Actor {
  // Input state
  private _input: PlayerInput = {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    skill1: false,
    skill2: false,
    skill3: false,
    skill4: false
  };
  
  // Player-specific properties
  private _health: number = 100;
  private _maxHealth: number = 100;
  
  // Equipment
  private _equipment: Equipment = {
    [EquipmentSlot.HEAD]: null,
    [EquipmentSlot.BODY]: null,
    [EquipmentSlot.MAIN_HAND]: null,
    [EquipmentSlot.OFF_HAND]: null,
    [EquipmentSlot.GLOVES]: null,
    LEFT_RING: null,
    RIGHT_RING: null,
    [EquipmentSlot.AMULET]: null
  };
  
  // Skills management
  private _skillManager: SkillManager;
  
  // Weapon images
  private _weaponImages: Map<string, HTMLImageElement> = new Map();
  private _weaponImagesLoaded: Map<string, boolean> = new Map();
  
  // Directional images for player
  private _directionalImages: {
    [key in Direction]?: HTMLImageElement;
  } = {};
  
  private _directionalImageLoaded: {
    [key in Direction]?: boolean;
  } = {};
  
  /**
   * Create a new Player
   * @param id Unique identifier for the player (optional)
   * @param x Initial x position
   * @param y Initial y position
   * @param width Width of the player
   * @param height Height of the player
   * @param speed Movement speed
   * @param imageSrc Optional path to default image source
   */
  constructor(
    id?: string,
    x: number = 0, 
    y: number = 0, 
    width: number = 16, 
    height: number = 16,
    speed: number = 2,
    imageSrc: string = ''
  ) {
    super(id, x, y, width, height, speed, imageSrc);
    this._skillManager = new SkillManager(this);
  }
  
  /**
   * Set a directional image for the player
   * @param direction The direction for this image
   * @param src Image source path
   */
  setDirectionalImage(direction: Direction, src: string): void {
    if (!src) {
      this._directionalImages[direction] = undefined;
      this._directionalImageLoaded[direction] = false;
      return;
    }
    
    const img = new Image();
    this._directionalImages[direction] = img;
    this._directionalImageLoaded[direction] = false;
    
    img.onload = () => {
      this._directionalImageLoaded[direction] = true;
    };
    
    img.src = src;
  }

  /**
   * Get player equipment
   */
  get equipment(): Equipment {
    return this._equipment;
  }

  /**
   * Equip an item to a specific slot
   * @param item The item to equip
   * @param slot The equipment slot 
   */
  equip(item: Item | null, slot: keyof Equipment): void {
    if (item && item.image && !this._weaponImages.has(item.image)) {
      // Load weapon image if not already loaded
      const img = new Image();
      this._weaponImages.set(item.image, img);
      this._weaponImagesLoaded.set(item.image, false);
      
      img.onload = () => {
        this._weaponImagesLoaded.set(item.image, true);
      };
      
      img.src = item.image;
    }
    
    this._equipment[slot] = item;
  }
  
  /**
   * Update player input state
   * @param input New input state
   */
  updateInput(input: Partial<PlayerInput>) {
    this._input = { ...this._input, ...input };
  }
  
  /**
   * Get current input state
   */
  get input(): PlayerInput {
    return this._input;
  }
  
  /**
   * Get player health
   */
  get health(): number {
    return this._health;
  }
  
  /**
   * Set player health (capped at maxHealth)
   */
  set health(value: number) {
    this._health = Math.max(0, Math.min(value, this._maxHealth));
  }
  
  /**
   * Get player's max health
   */
  get maxHealth(): number {
    return this._maxHealth;
  }
  
  /**
   * Set player's max health
   */
  set maxHealth(value: number) {
    this._maxHealth = value;
    // Ensure current health doesn't exceed max
    if (this._health > this._maxHealth) {
      this._health = this._maxHealth;
    }
  }
  
  /**
   * Check if player is alive
   */
  get isAlive(): boolean {
    return this._health > 0;
  }
  
  /**
   * Apply damage to the player
   * @param amount Amount of damage to apply
   * @returns Remaining health
   */
  takeDamage(amount: number): number {
    this._health = Math.max(0, this._health - amount);
    return this._health;
  }
  
  /**
   * Heal the player
   * @param amount Amount to heal
   * @returns New health value
   */
  heal(amount: number): number {
    this._health = Math.min(this._maxHealth, this._health + amount);
    return this._health;
  }
  
  /**
   * Get the skill manager
   */
  get skillManager(): SkillManager {
    return this._skillManager;
  }
  
  /**
   * Update player based on input and delta time
   * @param deltaTime Time elapsed since last frame in seconds
   * @param checkCollision Function to check for collisions
   * @param enemies Array of enemies for skill targeting
   * @param ctx Canvas rendering context
   */
  update(
    deltaTime: number, 
    checkCollision?: (x: number, y: number, width: number, height: number) => boolean,
    enemies?: any[],
    ctx?: CanvasRenderingContext2D
  ): void {
    if (!this._active || !this.isAlive) return;
    
    // Calculate movement based on input and speed
    const moveDistance = this._speed * 60 * deltaTime;
    let dx = 0;
    let dy = 0;
    
    if (this._input.up) {
      dy -= moveDistance;
      this._direction = Direction.UP;
    }
    if (this._input.down) {
      dy += moveDistance;
      this._direction = Direction.DOWN;
    }
    if (this._input.left) {
      dx -= moveDistance;
      this._direction = Direction.LEFT;
    }
    if (this._input.right) {
      dx += moveDistance;
      this._direction = Direction.RIGHT;
    }
    
    // Try to move if we have movement
    if (dx !== 0 || dy !== 0) {
      // If collision checking is provided
      if (checkCollision) {
        // Check x movement
        const newX = this._x + dx;
        if (!checkCollision(newX, this._y, this._width, this._height)) {
          this._x = newX;
        }
        
        // Check y movement
        const newY = this._y + dy;
        if (!checkCollision(this._x, newY, this._width, this._height)) {
          this._y = newY;
        }
      } else {
        // No collision checking, just move
        this._x += dx;
        this._y += dy;
      }
    }
    
    // Check for skill activation
    if (ctx) {
      if (this._input.skill1) {
        console.log('skill1**');
        this._skillManager.useSkill(0, ctx, enemies);
        this._input.skill1 = false; // Reset to prevent continuous triggering
      }
      if (this._input.skill2) {
        this._skillManager.useSkill(1, ctx, enemies);
        this._input.skill2 = false;
      }
      if (this._input.skill3) {
        this._skillManager.useSkill(2, ctx, enemies);
        this._input.skill3 = false;
      }
      if (this._input.skill4) {
        this._skillManager.useSkill(3, ctx, enemies);
        this._input.skill4 = false;
      }
    }
    else {
      console.log('no ctx');
    }
  }
  
  /**
   * Render the player with directional sprite, health bar, and skill bar
   * @param ctx Canvas rendering context
   * @param offsetX X offset for rendering (for camera)
   * @param offsetY Y offset for rendering (for camera)
   */
  render(
    ctx: CanvasRenderingContext2D, 
    offsetX: number = 0, 
    offsetY: number = 0
  ): void {
    if (!this._active) return;
    
    const renderX = this._x - offsetX;
    const renderY = this._y - offsetY;
    
    // Check for directional image
    const dirImg = this._directionalImages[this._direction];
    const dirImgLoaded = this._directionalImageLoaded[this._direction];
    
    // Check if facing left to flip the image horizontally
    const isFlipped = this._direction === Direction.LEFT;
    
    // Render player character
    if (isFlipped) {
      // Simplified approach for flipping
      ctx.save();
      
      // Draw the image flipped
      ctx.translate(renderX + this._width, renderY);
      ctx.scale(-1, 1);
      
      if (dirImg && dirImgLoaded) {
        ctx.drawImage(dirImg, 0, 0, this._width, this._height);
      } else if (this._image && this._imageLoaded) {
        ctx.drawImage(this._image, 0, 0, this._width, this._height);
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, this._width, this._height);
      }
      
      ctx.restore();
    } else {
      // Normal rendering (no flip)
      if (dirImg && dirImgLoaded) {
        ctx.drawImage(dirImg, renderX, renderY, this._width, this._height);
      } else if (this._image && this._imageLoaded) {
        ctx.drawImage(this._image, renderX, renderY, this._width, this._height);
      } else {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(renderX, renderY, this._width, this._height);
      }
    }
    
    // Render equipped weapon (main hand)
    const mainHandWeapon = this._equipment[EquipmentSlot.MAIN_HAND];
    if (mainHandWeapon && mainHandWeapon.image) {
      const weaponImg = this._weaponImages.get(mainHandWeapon.image);
      const weaponImgLoaded = this._weaponImagesLoaded.get(mainHandWeapon.image);
      
      if (weaponImg && weaponImgLoaded) {
        ctx.save();
        
        // Position weapon relative to player
        const weaponWidth = this._width * 0.75;  // Scale weapon size relative to player
        const weaponHeight = this._height * 0.75;
        
        // Position weapon based on direction
        let weaponRenderX = renderX;
        let weaponRenderY = renderY;
        
        if (isFlipped) {
            // Position to the left
            weaponRenderX = renderX + 12;
            weaponRenderY = renderY + this._height / 2 + 12.5;
            ctx.translate(weaponRenderX, weaponRenderY);
            ctx.rotate(-Math.PI / 2); // 90 degrees (as specified for flipped)
            ctx.translate(-weaponWidth / 2, -weaponHeight / 2);
        } else {
            // Position to the right
            weaponRenderX = renderX + 42;
            weaponRenderY = renderY + this._height / 2 + 12.5;
            ctx.translate(weaponRenderX, weaponRenderY);
            ctx.rotate(Math.PI / 2); // -90 degrees (as specified for non-flipped)
            ctx.translate(-weaponWidth / 2, -weaponHeight / 2);
        }
        
        // Draw the weapon
        ctx.drawImage(weaponImg, 0, 0, weaponWidth, weaponHeight);
        
        ctx.restore();
      }
    }
    
    // Draw simple health bar above player (not affected by flip)
    const healthBarWidth = this._width;
    const healthBarHeight = 4;
    const healthBarY = renderY - healthBarHeight - 2;
    
    // Background (empty part)
    ctx.fillStyle = '#333333';
    ctx.fillRect(
      renderX,
      healthBarY,
      healthBarWidth,
      healthBarHeight
    );
    
    // Health (filled part)
    const healthPercentage = this._health / this._maxHealth;
    ctx.fillStyle = healthPercentage > 0.5 ? '#00FF00' : healthPercentage > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(
      renderX,
      healthBarY,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );
    
    // Render skill bar at the bottom of the screen
    const canvasHeight = ctx.canvas.height;
    this._skillManager.renderSkillBar(
      ctx,
      10, // X position 
      canvasHeight - 50, // Y position (bottom of screen with margin)
      40, // Size of each skill icon
      10 // Padding between icons
    );
  }
} 