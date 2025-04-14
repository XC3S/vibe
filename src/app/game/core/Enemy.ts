import Actor, { Direction } from './Actor';
import Player from './Player';

/**
 * Enemy behavior states
 */
export enum EnemyState {
  IDLE,
  PATROLLING,
  CHASING,
  ATTACKING,
  STUNNED,
  DEAD
}

/**
 * Base Enemy class representing enemy entities in the game.
 * Extends the Actor class.
 */
export default class Enemy extends Actor {
  // Enemy-specific properties
  protected _health: number = 50;
  protected _maxHealth: number = 50;
  protected _attackDamage: number = 10;
  protected _attackRange: number = 32; // Range at which enemy can attack player
  protected _detectionRange: number = 200; // Range at which enemy detects player
  protected _state: EnemyState = EnemyState.IDLE;
  protected _isAggressive: boolean = true;
  protected _chaseSpeed: number = 1.5; // Speed multiplier when chasing player
  protected _baseSpeed: number;
  
  // Patrolling properties
  protected _patrolPoints: { x: number, y: number }[] = [];
  protected _currentPatrolIndex: number = 0;
  protected _patrolWaitTime: number = 1; // Time to wait at patrol points
  protected _patrolTimer: number = 0;
  
  /**
   * Create a new Enemy
   * @param id Unique identifier for the enemy (optional)
   * @param x Initial x position
   * @param y Initial y position
   * @param width Width of the enemy
   * @param height Height of the enemy
   * @param speed Movement speed
   * @param imageSrc Optional path to image source
   * @param detectionRange Range at which enemy detects player
   * @param health Initial health points
   */
  constructor(
    id?: string,
    x: number = 0, 
    y: number = 0, 
    width: number = 16, 
    height: number = 16,
    speed: number = 10,
    imageSrc: string = '',
    detectionRange: number = 200,
    health: number = 50
  ) {
    super(id, x, y, width, height, speed, imageSrc);
    this._baseSpeed = speed;
    this._detectionRange = detectionRange;
    this._health = health;
    this._maxHealth = health;
  }
  
  /**
   * Get enemy health
   */
  get health(): number {
    return this._health;
  }
  
  /**
   * Set enemy health (capped at maxHealth)
   */
  set health(value: number) {
    this._health = Math.max(0, Math.min(value, this._maxHealth));
    if (this._health <= 0) {
      this._state = EnemyState.DEAD;
    }
  }
  
  /**
   * Get enemy's max health
   */
  get maxHealth(): number {
    return this._maxHealth;
  }
  
  /**
   * Set enemy's max health
   */
  set maxHealth(value: number) {
    this._maxHealth = value;
    if (this._health > this._maxHealth) {
      this._health = this._maxHealth;
    }
  }
  
  /**
   * Get enemy's current state
   */
  get state(): EnemyState {
    return this._state;
  }
  
  /**
   * Set enemy's state
   */
  set state(value: EnemyState) {
    this._state = value;
  }
  
  /**
   * Get enemy's attack damage
   */
  get attackDamage(): number {
    return this._attackDamage;
  }
  
  /**
   * Set enemy's attack damage
   */
  set attackDamage(value: number) {
    this._attackDamage = value;
  }
  
  /**
   * Apply damage to the enemy
   * @param amount Amount of damage to apply
   * @returns Remaining health
   */
  takeDamage(amount: number): number {
    this._health = Math.max(0, this._health - amount);
    if (this._health <= 0) {
      this._state = EnemyState.DEAD;
    }
    return this._health;
  }
  
  /**
   * Check if the enemy is alive
   */
  get isAlive(): boolean {
    return this._health > 0;
  }
  
  /**
   * Set patrol points for this enemy
   * @param points Array of patrol point coordinates
   */
  setPatrolPoints(points: { x: number, y: number }[]): void {
    this._patrolPoints = points;
    if (points.length > 0) {
      this._state = EnemyState.PATROLLING;
    }
  }
  
  /**
   * Check if player is within detection range
   * @param player The player to check
   * @returns Boolean indicating if player is detected
   */
  canDetectPlayer(player: Player): boolean {
    if (!player.isAlive) return false;
    
    // Calculate distance to player
    const dx = player.x - this._x;
    const dy = player.y - this._y;
    const distanceSquared = dx * dx + dy * dy;
    
    return distanceSquared <= this._detectionRange * this._detectionRange;
  }
  
  /**
   * Check if player is within attack range
   * @param player The player to check
   * @returns Boolean indicating if player can be attacked
   */
  canAttackPlayer(player: Player): boolean {
    if (!player.isAlive) return false;
    
    // Calculate distance to player
    const dx = player.x - this._x;
    const dy = player.y - this._y;
    const distanceSquared = dx * dx + dy * dy;
    
    return distanceSquared <= this._attackRange * this._attackRange;
  }
  
  /**
   * Make the enemy move toward the player
   * @param player The player to move toward
   * @param deltaTime Time elapsed since last frame
   * @param speed Speed multiplier for chase (default is chase speed)
   * @returns Whether the enemy moved or not
   */
  moveTowardPlayer(
    player: Player, 
    deltaTime: number,
    speed: number = this._chaseSpeed * this._baseSpeed
  ): boolean {
    if (!player.isAlive) return false;
    
    // Calculate direction to player
    const dx = player.x - this._x;
    const dy = player.y - this._y;
    
    // Calculate distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= 0) return false;
    
    // Normalize direction and apply speed
    const moveDistance = speed * deltaTime;
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Move enemy
    this._x += normalizedDx * moveDistance;
    this._y += normalizedDy * moveDistance;
    
    // Update direction based on movement
    if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
      this._direction = normalizedDx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      this._direction = normalizedDy > 0 ? Direction.DOWN : Direction.UP;
    }
    
    return true;
  }
  
  /**
   * Move along patrol path
   * @param deltaTime Time elapsed since last frame
   * @param checkCollision Function to check for collisions
   * @returns Whether the enemy moved or not
   */
  patrol(
    deltaTime: number,
    checkCollision?: (x: number, y: number, width: number, height: number) => boolean
  ): boolean {
    if (this._patrolPoints.length === 0) return false;
    
    // If waiting at patrol point
    if (this._patrolTimer > 0) {
      this._patrolTimer -= deltaTime;
      return false;
    }
    
    // Get current patrol target
    const target = this._patrolPoints[this._currentPatrolIndex];
    
    // Calculate direction to target
    const dx = target.x - this._x;
    const dy = target.y - this._y;
    
    // Calculate distance
    const distanceSquared = dx * dx + dy * dy;
    
    // Check if we've reached the target (within 5 pixels)
    if (distanceSquared < 25) { // 5^2 = 25
      // Move to next patrol point
      this._currentPatrolIndex = (this._currentPatrolIndex + 1) % this._patrolPoints.length;
      this._patrolTimer = this._patrolWaitTime;
      return false;
    }
    
    // Calculate distance and normalized direction
    const distance = Math.sqrt(distanceSquared);
    const moveDistance = this._speed * deltaTime;
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    // Try moving
    const newX = this._x + normalizedDx * moveDistance;
    const newY = this._y + normalizedDy * moveDistance;
    
    // Check collision if collision checking is provided
    let canMoveX = true;
    let canMoveY = true;
    
    if (checkCollision) {
      canMoveX = !checkCollision(newX, this._y, this._width, this._height);
      canMoveY = !checkCollision(this._x, newY, this._width, this._height);
    }
    
    // Move enemy if no collision
    if (canMoveX) {
      this._x = newX;
    }
    
    if (canMoveY) {
      this._y = newY;
    }
    
    // Update direction based on movement
    if (Math.abs(normalizedDx) > Math.abs(normalizedDy)) {
      this._direction = normalizedDx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      this._direction = normalizedDy > 0 ? Direction.DOWN : Direction.UP;
    }
    
    return canMoveX || canMoveY;
  }
  
  /**
   * Make enemy attack player
   * @param player The player to attack
   * @returns Damage dealt (0 if no attack occurred)
   */
  attackPlayer(player: Player): number {
    if (!this.canAttackPlayer(player) || !player.isAlive) return 0;
    
    player.takeDamage(this._attackDamage);
    return this._attackDamage;
  }
  
  /**
   * Update enemy based on player position and delta time
   * @param deltaTime Time elapsed since last frame in seconds
   * @param player The player to react to
   * @param checkCollision Function to check for collisions
   */
  update(
    deltaTime: number,
    player?: Player,
    checkCollision?: (x: number, y: number, width: number, height: number) => boolean
  ): void {
    if (!this._active || !this.isAlive) return;
    
    // State-based behavior
    switch (this._state) {
      case EnemyState.IDLE:
        // Do nothing when idle, but check for player
        if (player && this._isAggressive && this.canDetectPlayer(player)) {
          this._state = EnemyState.CHASING;
          this._speed = this._baseSpeed * this._chaseSpeed;
        } else if (this._patrolPoints.length > 0) {
          this._state = EnemyState.PATROLLING;
        }
        break;
        
      case EnemyState.PATROLLING:
        this.patrol(deltaTime, checkCollision);
        
        // Check for player detection during patrol
        if (player && this._isAggressive && this.canDetectPlayer(player)) {
          this._state = EnemyState.CHASING;
          this._speed = this._baseSpeed * this._chaseSpeed;
        }
        break;
        
      case EnemyState.CHASING:
        if (!player || !player.isAlive || !this.canDetectPlayer(player)) {
          // Lost sight of player, go back to patrolling or idle
          this._state = this._patrolPoints.length > 0 ? EnemyState.PATROLLING : EnemyState.IDLE;
          this._speed = this._baseSpeed;
        } else if (this.canAttackPlayer(player)) {
          this._state = EnemyState.ATTACKING;
        } else {
          // Move toward player
          this.moveTowardPlayer(player, deltaTime, this._chaseSpeed * this._baseSpeed);
        }
        break;
        
      case EnemyState.ATTACKING:
        if (!player || !player.isAlive) {
          // Player is dead or not provided, go back to idle/patrolling
          this._state = this._patrolPoints.length > 0 ? EnemyState.PATROLLING : EnemyState.IDLE;
          this._speed = this._baseSpeed;
        } else if (!this.canAttackPlayer(player)) {
          // Player moved out of range, chase again
          this._state = EnemyState.CHASING;
        } else {
          // Attack the player
          this.attackPlayer(player);
        }
        break;
        
      case EnemyState.STUNNED:
        // Do nothing while stunned
        break;
        
      case EnemyState.DEAD:
        // Do nothing when dead
        this._active = false;
        break;
    }
  }
  
  /**
   * Render the enemy with health bar
   * @param ctx Canvas rendering context
   * @param offsetX X offset for rendering (for camera)
   * @param offsetY Y offset for rendering (for camera)
   */
  render(
    ctx: CanvasRenderingContext2D, 
    offsetX: number = 0, 
    offsetY: number = 0
  ): void {
    if (!this._active || this._state === EnemyState.DEAD) return;
    
    const renderX = this._x - offsetX;
    const renderY = this._y - offsetY;
    
    // Check if facing left to flip the image horizontally
    const isFlipped = this._direction === Direction.LEFT;
    
    if (isFlipped) {
      // Save the current state
      ctx.save();
      
      // Move to the right edge of where we want to draw, flip, and draw
      ctx.translate(renderX + this._width, renderY);
      ctx.scale(-1, 1);
      
      if (this._image && this._imageLoaded) {
        ctx.drawImage(this._image, 0, 0, this._width, this._height);
      } else {
        // Fallback rendering
        ctx.fillStyle = '#DD0000'; // Dark red for enemies
        ctx.fillRect(0, 0, this._width, this._height);
      }
      
      // Restore the context
      ctx.restore();
    } else {
      // Normal rendering (no flip)
      if (this._image && this._imageLoaded) {
        ctx.drawImage(this._image, renderX, renderY, this._width, this._height);
      } else {
        // Fallback rendering
        ctx.fillStyle = '#DD0000'; // Dark red for enemies
        ctx.fillRect(renderX, renderY, this._width, this._height);
      }
    }
    
    // Draw health bar above enemy
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
    ctx.fillStyle = healthPercentage > 0.5 ? '#FF0000' : healthPercentage > 0.25 ? '#FF4500' : '#FF6347';
    ctx.fillRect(
      renderX,
      healthBarY,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );
  }
} 