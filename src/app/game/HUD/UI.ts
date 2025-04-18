import { PlayerState } from "../core/PlayerController";

export class UI {
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
  }

  /**
   * Render all UI elements on top of the game
   * @param player Current player state
   */
  render(player: PlayerState): void {
    // Save current context state
    this.context.save();
    
    // If inventory is open, render inventory UI
    if (player.inventoryOpen) {
      this.renderInventory();
    }
    
    // Render any other persistent UI elements here
    
    // Restore context state
    this.context.restore();
  }

  /**
   * Render the player's inventory screen
   */
  private renderInventory(): void {
    const { width, height } = this.canvas;
    
    // Semi-transparent dark background
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    
    // Inventory border
    this.context.strokeStyle = '#fff';
    this.context.lineWidth = 2;
    this.context.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    
    // Inventory title
    this.context.fillStyle = '#fff';
    this.context.font = '24px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('Inventory', width * 0.5, height * 0.15);
    
    // Inventory slots/grid could be added here
  }
} 