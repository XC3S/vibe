import { Enemy, EnemyState } from '../core';

class BasicEnemy extends Enemy {
  constructor(
    x: number = 0, 
    y: number = 0
  ) {
    // Pass the required parameters to the Enemy constructor
    super(
      'basic-enemy', // id
      x, 
      y, 
      32, // width
      32, // height
      1.5, // speed
      '/assets/enemies/basic_enemy.png', // image source
      150, // detection range
      100  // health
    );
    
    // Configure additional enemy properties
    this.attackDamage = 10;
    this._attackRange = 30;
  }

  // Override the render method to customize the enemy appearance
  render(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    // Call the parent's render method first
    super.render(ctx, offsetX, offsetY);
    
    // Add custom rendering if needed
    // For example, draw an indicator or special effect
    if (this.state === EnemyState.CHASING) {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2 - offsetX, this.y - 10 - offsetY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default BasicEnemy; 