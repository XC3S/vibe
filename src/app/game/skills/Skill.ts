import Player from '../core/Player';

/**
 * Base Skill class that all skills will extend
 */
export default abstract class Skill {
  protected _name: string;
  protected _description: string;
  protected _iconSrc: string;
  protected _cooldown: number; // Cooldown in milliseconds
  protected _lastUsed: number = 0; // Timestamp of last use
  protected _manaCost: number = 0;
  
  /**
   * Create a new skill
   * @param name Name of the skill
   * @param description Short description of what the skill does
   * @param iconSrc Path to the skill icon image
   * @param cooldown Cooldown time in milliseconds
   * @param manaCost Mana cost to use the skill (if applicable)
   */
  constructor(
    name: string,
    description: string,
    iconSrc: string,
    cooldown: number = 0,
    manaCost: number = 0
  ) {
    this._name = name;
    this._description = description;
    this._iconSrc = iconSrc;
    this._cooldown = cooldown;
    this._manaCost = manaCost;
  }
  
  /**
   * Get the name of the skill
   */
  get name(): string {
    return this._name;
  }
  
  /**
   * Get the description of the skill
   */
  get description(): string {
    return this._description;
  }
  
  /**
   * Get the path to the skill icon image
   */
  get iconSrc(): string {
    return this._iconSrc;
  }
  
  /**
   * Get the cooldown time in milliseconds
   */
  get cooldown(): number {
    return this._cooldown;
  }
  
  /**
   * Get the mana cost
   */
  get manaCost(): number {
    return this._manaCost;
  }
  
  /**
   * Check if the skill is currently on cooldown
   */
  isOnCooldown(): boolean {
    return Date.now() - this._lastUsed < this._cooldown;
  }
  
  /**
   * Get remaining cooldown time in milliseconds
   */
  getRemainingCooldown(): number {
    if (!this.isOnCooldown()) {
      return 0;
    }
    return this._cooldown - (Date.now() - this._lastUsed);
  }
  
  /**
   * Execute the skill - to be implemented by child classes
   * @param player The player using the skill
   * @param ctx Canvas rendering context
   * @param target Optional target for the skill
   * @param params Additional optional parameters
   */
  abstract execute(
    player: Player,
    ctx: CanvasRenderingContext2D, 
    target?: any,
    params?: any
  ): boolean;
  
  /**
   * Try to use the skill if it's not on cooldown
   * @param player The player using the skill
   * @param ctx Canvas rendering context
   * @param target Optional target for the skill
   * @param params Additional optional parameters
   * @returns Success status of the skill execution
   */
  use(
    player: Player,
    ctx: CanvasRenderingContext2D,
    target?: any,
    params?: any
  ): boolean {
    // Check if skill is on cooldown
    console.log('Skill is on cooldown:', this.isOnCooldown());

    if (this.isOnCooldown()) {
      return false;
    }
    
    // Execute the skill and update last used time if successful
    const success = this.execute(player, ctx, target, params);
    
    if (success) {
      this._lastUsed = Date.now();
    }
    
    return success;
  }
  
  /**
   * Render the skill icon on the UI
   * @param ctx Canvas rendering context
   * @param x X position to render
   * @param y Y position to render
   * @param width Width of the icon
   * @param height Height of the icon
   */
  renderIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number = 32,
    height: number = 32
  ): void {
    // Create and cache icon image
    const iconImage = new Image();
    iconImage.src = this._iconSrc;
    
    // Draw icon background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Draw icon if loaded
    if (iconImage.complete) {
      ctx.drawImage(iconImage, x, y, width, height);
    }
    
    // If on cooldown, draw darkened overlay with timer
    if (this.isOnCooldown()) {
      // Darkened overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(x, y, width, height);
      
      // Show cooldown percentage
      const remainingPct = this.getRemainingCooldown() / this._cooldown;
      const cooldownHeight = height * remainingPct;
      
      // Cooldown indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x, y + height - cooldownHeight, width, cooldownHeight);
    }
  }
} 