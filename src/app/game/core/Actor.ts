import GameObject from './Object';

/**
 * Actor class representing entities that can move and interact in the game world.
 * Extends the base GameObject class.
 */
export default class Actor extends GameObject {
  // Dimensions
  protected _width: number = 0;
  protected _height: number = 0;
  
  // Movement properties
  protected _speed: number = 0;
  protected _direction: Direction = Direction.DOWN;
  
  // Collision properties
  protected _solid: boolean = true;
  
  // Image/sprite properties
  protected _image: HTMLImageElement | null = null;
  protected _imageLoaded: boolean = false;
  protected _imageSrc: string = '';
  
  /**
   * Create a new Actor
   * @param id Unique identifier for the actor (optional)
   * @param x Initial x position
   * @param y Initial y position
   * @param width Width of the actor
   * @param height Height of the actor
   * @param speed Movement speed
   * @param imageSrc Optional path to image source
   */
  constructor(
    id?: string,
    x: number = 0, 
    y: number = 0, 
    width: number = 0, 
    height: number = 0,
    speed: number = 1,
    imageSrc: string = ''
  ) {
    super(id);
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._speed = speed;
    
    if (imageSrc) {
      this.setImage(imageSrc);
    }
  }
  
  /**
   * Get actor width
   */
  get width(): number {
    return this._width;
  }
  
  /**
   * Set actor width
   */
  set width(value: number) {
    this._width = value;
  }
  
  /**
   * Get actor height
   */
  get height(): number {
    return this._height;
  }
  
  /**
   * Set actor height
   */
  set height(value: number) {
    this._height = value;
  }
  
  /**
   * Get actor speed
   */
  get speed(): number {
    return this._speed;
  }
  
  /**
   * Set actor speed
   */
  set speed(value: number) {
    this._speed = value;
  }
  
  /**
   * Get actor direction
   */
  get direction(): Direction {
    return this._direction;
  }
  
  /**
   * Set actor direction
   */
  set direction(value: Direction) {
    this._direction = value;
  }
  
  /**
   * Get actor solidity (can it collide)
   */
  get solid(): boolean {
    return this._solid;
  }
  
  /**
   * Set actor solidity
   */
  set solid(value: boolean) {
    this._solid = value;
  }
  
  /**
   * Get image source path
   */
  get imageSrc(): string {
    return this._imageSrc;
  }
  
  /**
   * Check if actor has an image that's loaded
   */
  get hasImage(): boolean {
    return this._image !== null && this._imageLoaded;
  }
  
  /**
   * Set the actor's image
   * @param src Path to the image
   */
  setImage(src: string): void {
    if (src === this._imageSrc) return;
    
    this._imageSrc = src;
    this._imageLoaded = false;
    
    if (src) {
      this._image = new Image();
      this._image.onload = () => {
        this._imageLoaded = true;
      };
      this._image.src = src;
    } else {
      this._image = null;
    }
  }
  
  /**
   * Move actor in a specific direction by the given amount
   * @param dx X distance to move
   * @param dy Y distance to move
   */
  move(dx: number, dy: number): void {
    this._x += dx;
    this._y += dy;
    
    // Update direction based on movement
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal movement dominates
      this._direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else if (dy !== 0) {
      // Vertical movement dominates
      this._direction = dy > 0 ? Direction.DOWN : Direction.UP;
    }
  }
  
  /**
   * Check if this actor collides with another
   * @param other Other actor to check collision with
   * @returns True if collision detected
   */
  collidesWith(other: Actor): boolean {
    // Simple AABB collision detection
    return (
      this._x < other.x + other.width &&
      this._x + this._width > other.x &&
      this._y < other.y + other.height &&
      this._y + this._height > other.y
    );
  }
  
  /**
   * Render the actor
   * @param ctx Canvas rendering context
   * @param offsetX X offset for rendering (for camera)
   * @param offsetY Y offset for rendering (for camera)
   * @param color Fallback color if no image is available
   */
  render(
    ctx: CanvasRenderingContext2D, 
    offsetX: number = 0, 
    offsetY: number = 0,
    color: string = '#FF0000'
  ): void {
    if (!this._active) return;
    
    const renderX = this._x - offsetX;
    const renderY = this._y - offsetY;
    
    // Render image if available
    if (this._image && this._imageLoaded) {
      ctx.drawImage(
        this._image,
        renderX,
        renderY,
        this._width,
        this._height
      );
    } else {
      // Fallback to rectangle rendering
      ctx.fillStyle = color;
      ctx.fillRect(
        renderX, 
        renderY, 
        this._width, 
        this._height
      );
    }
  }
}

/**
 * Direction enum for actor movement/facing
 */
export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
} 