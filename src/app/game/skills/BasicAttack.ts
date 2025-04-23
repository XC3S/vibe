import Skill from './Skill';
import Player from '../core/Player';
import { Direction } from '../core/Actor';

/**
 * Basic attack skill that deals damage in front of the player
 */
export default class BasicAttack extends Skill {
  private _damage: number;
  private _range: number;
  private _width: number;
  
  /**
   * Create a new basic attack skill
   * @param damage Base damage of the attack
   * @param range Range of the attack in pixels
   * @param width Width of the attack arc in pixels
   */
  constructor(
    damage: number = 10,
    range: number = 32,
    width: number = 32
  ) {
    super(
      'Basic Attack',
      'A simple swing attack that deals damage to enemies in front of you',
      '/gameAssets/skills/basic_attack.png', // Fixed the skill name
      500 // 500ms cooldown
    );
    
    this._damage = damage;
    this._range = range;
    this._width = width;
  }
  
  /**
   * Execute the basic attack
   * @param player The player performing the attack
   * @param ctx Canvas rendering context
   * @param enemies Array of enemies to check for hits
   */
  execute(
    player: Player,
    ctx: CanvasRenderingContext2D,
    enemies?: any[],
    params?: any
  ): boolean {
    console.log('BasicAttack executed');

    // If no enemies to check, just animate the attack
    if (!enemies || enemies.length === 0) {
      this.showAttackAnimation(player, ctx);
      return true;
    }
    
    // Calculate attack area based on player position and direction
    const attackArea = this.calculateAttackArea(player);
    
    // Check for enemies in attack area
    let hitAny = false;
    for (const enemy of enemies) {
      // Simple box collision detection
      if (this.isEnemyInAttackArea(enemy, attackArea)) {
        // Deal damage to enemy
        if (typeof enemy.takeDamage === 'function') {
          enemy.takeDamage(this._damage);
          hitAny = true;
        }
      }
    }
    
    // Show attack animation regardless of hit
    this.showAttackAnimation(player, ctx);
    
    return true; // Attack executed successfully
  }
  
  /**
   * Calculate the attack area based on player position and direction
   * @param player The player performing the attack
   * @returns Object representing the attack area
   */
  private calculateAttackArea(player: Player): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const { x, y, width, height } = player;
    let attackX = x;
    let attackY = y;
    let attackWidth = this._width;
    let attackHeight = this._range;
    
    // Position the attack area based on player direction
    switch (player.direction) {
      case Direction.UP:
        attackX = x - (attackWidth - width) / 2;
        attackY = y - attackHeight;
        break;
      case Direction.DOWN:
        attackX = x - (attackWidth - width) / 2;
        attackY = y + height;
        break;
      case Direction.LEFT:
        attackX = x - attackHeight;
        attackY = y - (attackWidth - height) / 2;
        [attackWidth, attackHeight] = [attackHeight, attackWidth]; // Swap for horizontal
        break;
      case Direction.RIGHT:
        attackX = x + width;
        attackY = y - (attackWidth - height) / 2;
        [attackWidth, attackHeight] = [attackHeight, attackWidth]; // Swap for horizontal
        break;
    }
    
    return {
      x: attackX,
      y: attackY,
      width: attackWidth,
      height: attackHeight
    };
  }
  
  /**
   * Check if an enemy is in the attack area
   * @param enemy Enemy object to check
   * @param attackArea Attack area rectangle
   * @returns True if the enemy is in the attack area
   */
  private isEnemyInAttackArea(
    enemy: { x: number; y: number; width: number; height: number },
    attackArea: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      enemy.x < attackArea.x + attackArea.width &&
      enemy.x + enemy.width > attackArea.x &&
      enemy.y < attackArea.y + attackArea.height &&
      enemy.y + enemy.height > attackArea.y
    );
  }
  
  /**
   * Show attack animation
   * @param player The player performing the attack
   * @param ctx Canvas rendering context
   */
  private showAttackAnimation(player: Player, ctx: CanvasRenderingContext2D): void {
    // Get the attack area
    const attackArea = this.calculateAttackArea(player);
    
    // Draw a temporary attack effect
    ctx.save();
    
    // Set semi-transparent white for the attack animation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(
      attackArea.x,
      attackArea.y,
      attackArea.width,
      attackArea.height
    );
    
    // Add a border to the attack area
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      attackArea.x,
      attackArea.y,
      attackArea.width,
      attackArea.height
    );
    
    ctx.restore();
  }
} 