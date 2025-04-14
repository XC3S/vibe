import { Enemy, EnemyState } from '../core';

/**
 * SkeletonWarrior enemy class
 * A dangerous undead warrior that patrols and attacks the player
 */
class SkeletonWarrior extends Enemy {
  // Track attack cooldown
  private _attackCooldown: number = 0;
  private _attackCooldownTime: number = 1.0; // 1 second between attacks
  
  constructor(
    x: number = 0, 
    y: number = 0
  ) {
    // Pass the required parameters to the Enemy constructor
    super(
      'skeleton-warrior', // id
      x, 
      y, 
      48, // width
      48, // height
      3, // speed - slower than basic enemy but more powerful
      '/gameAssets/skelett_warrior.png', // image source
      180, // detection range - better sight than basic enemies
      150  // health - tougher than basic enemies
    );
    
    // Configure additional enemy properties
    this.attackDamage = 20; // stronger attack
    this._attackRange = 40; // longer attack range (sword)
    this._chaseSpeed = 10; // faster chase speed
  }
  
  /**
   * Override attackPlayer to add attack cooldown
   */
  attackPlayer(player: any): number {
    if (this._attackCooldown > 0) return 0;
    
    // If attack is successful, set cooldown
    const damage = super.attackPlayer(player);
    if (damage > 0) {
      this._attackCooldown = this._attackCooldownTime;
    }
    
    return damage;
  }
  
  /**
   * Override update to handle cooldown
   */
  update(
    deltaTime: number,
    player?: any,
    checkCollision?: (x: number, y: number, width: number, height: number) => boolean
  ): void {
    // Update cooldown
    if (this._attackCooldown > 0) {
      this._attackCooldown = Math.max(0, this._attackCooldown - deltaTime);
    }
    
    // Call parent update
    super.update(deltaTime, player, checkCollision);
  }

  /**
   * Override render to add visual attack indicator
   */
  render(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    // Call the parent's render method first
    super.render(ctx, offsetX, offsetY);
    
    // Add attack indicator when in attack mode
    if (this.state === EnemyState.ATTACKING) {
      // Calculate position with offset
      const renderX = this.x - offsetX;
      const renderY = this.y - offsetY;
      
      // Draw attack indicator (red glow when about to attack)
      if (this._attackCooldown < 0.3) { // About to attack
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(
          renderX + this.width / 2, 
          renderY + this.height / 2, 
          this._attackRange, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    
    // Draw an indicator when chasing (like in BasicEnemy)
    if (this.state === EnemyState.CHASING) {
      const renderX = this.x - offsetX;
      const renderY = this.y - offsetY;
      
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(renderX + this.width / 2, renderY - 10, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default SkeletonWarrior; 