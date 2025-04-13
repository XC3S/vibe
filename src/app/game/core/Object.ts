/**
 * Base Object class that serves as the foundation for all game objects.
 * Currently empty but will be extended with common functionality as needed.
 */
export default class GameObject {
  // Unique identifier for the object
  private _id: string;
  
  // Position in the game world
  protected _x: number = 0;
  protected _y: number = 0;
  
  // Flag to indicate if object is active in the game
  protected _active: boolean = true;
  
  /**
   * Create a new game object
   * @param id Unique identifier for the object (optional)
   */
  constructor(id?: string) {
    this._id = id || `obj_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Get object's unique identifier
   */
  get id(): string {
    return this._id;
  }
  
  /**
   * Get X position
   */
  get x(): number {
    return this._x;
  }
  
  /**
   * Set X position
   */
  set x(value: number) {
    this._x = value;
  }
  
  /**
   * Get Y position
   */
  get y(): number {
    return this._y;
  }
  
  /**
   * Set Y position
   */
  set y(value: number) {
    this._y = value;
  }
  
  /**
   * Check if object is active
   */
  get active(): boolean {
    return this._active;
  }
  
  /**
   * Set object active state
   */
  set active(value: boolean) {
    this._active = value;
  }
  
  /**
   * Update method to be overridden by child classes
   * @param deltaTime Time elapsed since last frame in seconds
   */
  update(deltaTime: number): void {
    // Base implementation does nothing
  }
  
  /**
   * Render method to be overridden by child classes
   * @param ctx Canvas rendering context
   * @param offsetX X offset for rendering (for camera)
   * @param offsetY Y offset for rendering (for camera)
   */
  render(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    // Base implementation does nothing
  }
} 