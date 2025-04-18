import { PlayerState } from "../core/PlayerController";
import { EquipmentSlot } from "../item/Item";

export class UI {
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private itemImages: Map<string, HTMLImageElement> = new Map();

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
      this.renderInventory(player);
    }
    
    // Render any other persistent UI elements here
    
    // Restore context state
    this.context.restore();
  }

  /**
   * Render the player's inventory screen
   * @param player Current player state to get inventory items
   */
  private renderInventory(player: PlayerState): void {
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
    this.renderInventorySlots(player);
    
    // Render equipment slots
    this.renderEquipmentSlots(player);
  }
  
  /**
   * Helper method to draw an item in a slot
   * @param x X position of the slot
   * @param y Y position of the slot
   * @param imagePath Path to the item image
   * @param slotSize Size of the slot
   */
  private drawItemInSlot(x: number, y: number, imagePath: string, slotSize: number): void {
    // Check if image is already loaded
    if (!this.itemImages.has(imagePath)) {
      // Load image if not already loaded
      const img = new Image();
      img.src = imagePath;
      this.itemImages.set(imagePath, img);
      
      // Return early, image will render on next frame once loaded
      return;
    }
    
    // Get the loaded image
    const img = this.itemImages.get(imagePath);
    
    // Only draw if image is loaded
    if (img && img.complete) {
      // Calculate size and position to center item in slot
      const itemSize = slotSize * 0.7; // Item takes up 70% of slot
      const itemX = x + (slotSize - itemSize) / 2;
      const itemY = y + (slotSize - itemSize) / 2;
      
      // Draw the item image
      this.context.drawImage(img, itemX, itemY, itemSize, itemSize);
    }
  }
  
  /**
   * Render a 3x5 grid of inventory slots on the left side
   * @param player Player state to get inventory items from
   */
  private renderInventorySlots(player: PlayerState): void {
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
        const inventoryIndex = row * 3 + col;
        
        // Slot background
        this.context.fillStyle = slotBgColor;
        this.context.fillRect(x, y, slotSize, slotSize);
        
        // Slot border
        this.context.strokeStyle = slotBorderColor;
        this.context.lineWidth = 1;
        this.context.strokeRect(x, y, slotSize, slotSize);
        
        // Render item if present in inventory
        const item = player.inventory[inventoryIndex];
        if (item && item.image) {
          this.drawItemInSlot(x, y, item.image, slotSize);
        }
      }
    }
  }
  
  /**
   * Render equipment slots on the right side
   * @param player Player state to get equipped items from 
   */
  private renderEquipmentSlots(player: PlayerState): void {
    const { width, height } = this.canvas;
    
    // Define equipment slot size and spacing
    const slotSize = width * 0.08;
    const padding = width * 0.02;
    const baseX = width * 0.55; // Right side position
    const baseY = height * 0.2;
    
    // Define colors
    const slotBgColor = 'rgba(50, 50, 50, 0.7)';
    const slotBorderColor = '#AAA';
    
    // Header for equipment section
    this.context.fillStyle = '#DDD';
    this.context.font = '18px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('Equipment', baseX + slotSize, baseY - 10);
    
    // Helper function to draw a slot and its item if equipped
    const drawEquipmentSlot = (x: number, y: number, slotType: EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING') => {
      // Slot background
      this.context.fillStyle = slotBgColor;
      this.context.fillRect(x, y, slotSize, slotSize);
      
      // Slot border
      this.context.strokeStyle = slotBorderColor;
      this.context.lineWidth = 1;
      this.context.strokeRect(x, y, slotSize, slotSize);
      
      // Draw item if equipped
      if (player.equipment && slotType in player.equipment) {
        const item = player.equipment[slotType as keyof typeof player.equipment];
        if (item && item.image) {
          this.drawItemInSlot(x, y, item.image, slotSize);
        }
      }
    };
    
    // Create equipment slots with appropriate spacing
    
    // Helmet at the top
    drawEquipmentSlot(baseX, baseY, EquipmentSlot.HEAD);
    
    // Chest below helmet
    drawEquipmentSlot(baseX, baseY + slotSize + padding, EquipmentSlot.BODY);
    
    // Gloves below chest
    drawEquipmentSlot(baseX, baseY + (slotSize + padding) * 2, EquipmentSlot.GLOVES);
    
    // Boots below gloves (using RING for now, add BOOTS slot later)
    drawEquipmentSlot(baseX, baseY + (slotSize + padding) * 3, 'LEFT_RING');
    
    // Mainhand (left side of chest)
    drawEquipmentSlot(baseX - slotSize - padding/2, baseY + slotSize + padding, EquipmentSlot.MAIN_HAND);
    
    // Offhand (right side of chest)
    drawEquipmentSlot(baseX + slotSize + padding/2, baseY + slotSize + padding, EquipmentSlot.OFF_HAND);
    
    // Left Ring (bottom row left)
    drawEquipmentSlot(baseX - slotSize/2 - padding/4, baseY + (slotSize + padding) * 4, 'LEFT_RING');
    
    // Right Ring (bottom row right)
    drawEquipmentSlot(baseX + slotSize/2 + padding/4, baseY + (slotSize + padding) * 4, 'RIGHT_RING');
    
    // Amulet (below helmet, above chest)
    drawEquipmentSlot(baseX + slotSize + padding/2, baseY, EquipmentSlot.AMULET);
  }
} 