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
    
    // Render inventory slots grid (3x5)
    this.renderInventorySlots();
    
    // Render equipment slots
    this.renderEquipmentSlots();
  }
  
  /**
   * Render a 3x5 grid of inventory slots on the left side
   */
  private renderInventorySlots(): void {
    const { width, height } = this.canvas;
    
    // Define inventory slot size and spacing
    const slotSize = width * 0.08;
    const padding = width * 0.02;
    const startX = width * 0.15; // Move back to left side
    const startY = height * 0.2;
    
    // Define colors
    const slotBgColor = 'rgba(50, 50, 50, 0.7)';
    const slotBorderColor = '#AAA';
    
    // Render 3 columns x 5 rows of inventory slots
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * (slotSize + padding);
        const y = startY + row * (slotSize + padding);
        
        // Slot background
        this.context.fillStyle = slotBgColor;
        this.context.fillRect(x, y, slotSize, slotSize);
        
        // Slot border
        this.context.strokeStyle = slotBorderColor;
        this.context.lineWidth = 1;
        this.context.strokeRect(x, y, slotSize, slotSize);
        
        // Slot number
        const slotNumber = row * 3 + col + 1;
        this.context.fillStyle = '#FFF';
        this.context.font = '10px Arial';
        this.context.textAlign = 'start';
        this.context.fillText(`${slotNumber}`, x + 3, y + 12);
      }
    }
  }
  
  /**
   * Render equipment slots on the right side
   */
  private renderEquipmentSlots(): void {
    const { width, height } = this.canvas;
    
    // Define equipment slot size and spacing
    const slotSize = width * 0.08;
    const padding = width * 0.02;
    const baseX = width * 0.55; // Right side position
    const baseY = height * 0.2;
    
    // Define colors
    const slotBgColor = 'rgba(50, 50, 50, 0.7)';
    const slotBorderColor = '#AAA';
    const slotHighlightColor = 'rgba(70, 70, 70, 0.5)';
    
    // Header for equipment section
    this.context.fillStyle = '#DDD';
    this.context.font = '18px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('Equipment', baseX + slotSize, baseY - 10);
    
    // Helper function to draw a slot with label
    const drawSlot = (x: number, y: number, label: string, iconChar?: string) => {
      // Slot background
      this.context.fillStyle = slotBgColor;
      this.context.fillRect(x, y, slotSize, slotSize);
      
      // Slot border
      this.context.strokeStyle = slotBorderColor;
      this.context.lineWidth = 1;
      this.context.strokeRect(x, y, slotSize, slotSize);
      
      // Slot label
      this.context.fillStyle = '#CCC';
      this.context.font = '11px Arial';
      this.context.textAlign = 'start';
      this.context.fillText(label, x + slotSize + 5, y + slotSize/2 + 3);
      
      // Optional icon/symbol in slot
      if (iconChar) {
        this.context.fillStyle = '#888';
        this.context.font = '20px Arial';
        this.context.textAlign = 'center';
        this.context.fillText(iconChar, x + slotSize/2, y + slotSize/2 + 7);
      }
    };
    
    // Create equipment slots with appropriate spacing
    // Helmet at the top
    drawSlot(baseX, baseY, "Helmet", "⛑️");
    
    // Chest below helmet
    drawSlot(baseX, baseY + slotSize + padding, "Chest", "👕");
    
    // Gloves below chest
    drawSlot(baseX, baseY + (slotSize + padding) * 2, "Gloves", "🧤");
    
    // Boots below gloves
    drawSlot(baseX, baseY + (slotSize + padding) * 3, "Boots", "👢");
    
    // Mainhand (left side of chest)
    drawSlot(baseX - slotSize - padding/2, baseY + slotSize + padding, "Mainhand", "🗡️");
    
    // Offhand (right side of chest)
    drawSlot(baseX + slotSize + padding/2, baseY + slotSize + padding, "Offhand", "🛡️");
    
    // Rings (bottom row)
    drawSlot(baseX - slotSize/2 - padding/4, baseY + (slotSize + padding) * 4, "Ring 1", "💍");
    drawSlot(baseX + slotSize/2 + padding/4, baseY + (slotSize + padding) * 4, "Ring 2", "💍");
    
    // Amulet (below helmet, above chest)
    drawSlot(baseX + slotSize + padding/2, baseY, "Amulet", "📿");
  }
} 