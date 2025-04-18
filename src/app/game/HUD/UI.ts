import { PlayerState } from "../core/PlayerController";
import { EquipmentSlot } from "../item/Item";

// Interface representing inventory slot coordinates
interface SlotCoordinates {
  x: number;
  y: number;
  slotSize: number;
  inventoryIndex?: number;
  equipmentSlot?: EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING';
}

export class UI {
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private itemImages: Map<string, HTMLImageElement> = new Map();
  
  // Drag and drop state
  private isDragging: boolean = false;
  private draggedItem: any = null;  // The item being dragged
  private draggedItemSource: {
    inventoryIndex?: number;
    equipmentSlot?: EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING';
  } | null = null;
  private dragPosition: { x: number, y: number } = { x: 0, y: 0 };
  
  // Cache for inventory slot positions
  private inventorySlots: SlotCoordinates[] = [];
  private equipmentSlots: Map<EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING', SlotCoordinates> = new Map();

  constructor(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.context = context;
    
    // Register mouse event handlers
    this.setupMouseHandlers();
  }
  
  /**
   * Set up mouse event handlers for drag and drop
   */
  private setupMouseHandlers(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  /**
   * Handle mouse down event to start dragging an item
   */
  private handleMouseDown(event: MouseEvent): void {
    // Get mouse coordinates relative to canvas
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Only handle mouse events when inventory is open
    if (!this.isInventoryOpen) return;
    
    // Check if clicked on an inventory slot with an item
    for (const slot of this.inventorySlots) {
      if (
        mouseX >= slot.x && 
        mouseX <= slot.x + slot.slotSize &&
        mouseY >= slot.y && 
        mouseY <= slot.y + slot.slotSize &&
        slot.inventoryIndex !== undefined
      ) {
        const item = this.currentPlayerState?.inventory[slot.inventoryIndex];
        if (item) {
          this.isDragging = true;
          this.draggedItem = item;
          this.draggedItemSource = { inventoryIndex: slot.inventoryIndex };
          this.dragPosition = { x: mouseX, y: mouseY };
          return;
        }
      }
    }
    
    // Check if clicked on an equipment slot with an item
    for (const [slotType, slot] of this.equipmentSlots.entries()) {
      if (
        mouseX >= slot.x && 
        mouseX <= slot.x + slot.slotSize &&
        mouseY >= slot.y && 
        mouseY <= slot.y + slot.slotSize
      ) {
        const item = this.currentPlayerState?.equipment[slotType as keyof typeof this.currentPlayerState.equipment];
        if (item) {
          this.isDragging = true;
          this.draggedItem = item;
          this.draggedItemSource = { equipmentSlot: slotType };
          this.dragPosition = { x: mouseX, y: mouseY };
          return;
        }
      }
    }
  }
  
  /**
   * Handle mouse move event to update dragged item position
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedItem) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.dragPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  /**
   * Handle mouse up event to drop an item
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.isDragging || !this.draggedItem || !this.draggedItemSource || !this.currentPlayerState) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check if dropped on an inventory slot
    for (const slot of this.inventorySlots) {
      if (
        mouseX >= slot.x && 
        mouseX <= slot.x + slot.slotSize &&
        mouseY >= slot.y && 
        mouseY <= slot.y + slot.slotSize &&
        slot.inventoryIndex !== undefined
      ) {
        this.handleItemDrop(slot);
        this.isDragging = false;
        this.draggedItem = null;
        this.draggedItemSource = null;
        return;
      }
    }
    
    // Check if dropped on an equipment slot
    for (const [slotType, slot] of this.equipmentSlots.entries()) {
      if (
        mouseX >= slot.x && 
        mouseX <= slot.x + slot.slotSize &&
        mouseY >= slot.y && 
        mouseY <= slot.y + slot.slotSize
      ) {
        // Only allow equip if item's equipment slot matches
        if (
          this.draggedItem.equipable && 
          (this.draggedItem.equipmentSlot === slotType || 
           // Handle ring slots specially
           (this.draggedItem.equipmentSlot === EquipmentSlot.RING && 
            (slotType === 'LEFT_RING' || slotType === 'RIGHT_RING')))
        ) {
          this.handleItemDrop({ equipmentSlot: slotType });
        }
        this.isDragging = false;
        this.draggedItem = null;
        this.draggedItemSource = null;
        return;
      }
    }
    
    // Dropped outside - cancel dragging
    this.isDragging = false;
    this.draggedItem = null;
    this.draggedItemSource = null;
  }
  
  /**
   * Handle dropping an item onto a slot (inventory or equipment)
   * @param targetSlot The slot where the item is being dropped
   */
  private handleItemDrop(targetSlot: {
    inventoryIndex?: number;
    equipmentSlot?: EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING';
  }): void {
    if (!this.currentPlayerState || !this.draggedItemSource) return;
    
    // Same slot - do nothing
    if (
      (targetSlot.inventoryIndex !== undefined && 
       this.draggedItemSource.inventoryIndex === targetSlot.inventoryIndex) ||
      (targetSlot.equipmentSlot !== undefined && 
       this.draggedItemSource.equipmentSlot === targetSlot.equipmentSlot)
    ) {
      return;
    }
    
    // From inventory to inventory
    if (
      this.draggedItemSource.inventoryIndex !== undefined && 
      targetSlot.inventoryIndex !== undefined
    ) {
      // Swap inventory items
      const temp = this.currentPlayerState.inventory[targetSlot.inventoryIndex];
      this.currentPlayerState.inventory[targetSlot.inventoryIndex] = 
        this.currentPlayerState.inventory[this.draggedItemSource.inventoryIndex];
      this.currentPlayerState.inventory[this.draggedItemSource.inventoryIndex] = temp;
    }
    
    // From inventory to equipment
    else if (
      this.draggedItemSource.inventoryIndex !== undefined && 
      targetSlot.equipmentSlot !== undefined
    ) {
      // Get current equipped item (if any)
      const currentEquipped = 
        this.currentPlayerState.equipment[targetSlot.equipmentSlot as keyof typeof this.currentPlayerState.equipment];
      
      // Place dragged item into equipment slot
      this.currentPlayerState.equipment[targetSlot.equipmentSlot as keyof typeof this.currentPlayerState.equipment] = 
        this.currentPlayerState.inventory[this.draggedItemSource.inventoryIndex];
      
      // Place previously equipped item (if any) into inventory slot
      this.currentPlayerState.inventory[this.draggedItemSource.inventoryIndex] = currentEquipped;
    }
    
    // From equipment to inventory
    else if (
      this.draggedItemSource.equipmentSlot !== undefined && 
      targetSlot.inventoryIndex !== undefined
    ) {
      // Get item in target inventory slot
      const inventoryItem = this.currentPlayerState.inventory[targetSlot.inventoryIndex];
      
      // Whether we can equip the inventory item to the same slot
      const canEquipInventoryItem = inventoryItem && 
        inventoryItem.equipable && 
        (inventoryItem.equipmentSlot === this.draggedItemSource.equipmentSlot || 
         (inventoryItem.equipmentSlot === EquipmentSlot.RING && 
          (this.draggedItemSource.equipmentSlot === 'LEFT_RING' || 
           this.draggedItemSource.equipmentSlot === 'RIGHT_RING')));
      
      // Place equipped item into inventory slot
      this.currentPlayerState.inventory[targetSlot.inventoryIndex] = 
        this.currentPlayerState.equipment[this.draggedItemSource.equipmentSlot as keyof typeof this.currentPlayerState.equipment];
      
      // Place inventory item into equipment slot if possible
      if (canEquipInventoryItem) {
        this.currentPlayerState.equipment[this.draggedItemSource.equipmentSlot as keyof typeof this.currentPlayerState.equipment] = inventoryItem;
      } else {
        this.currentPlayerState.equipment[this.draggedItemSource.equipmentSlot as keyof typeof this.currentPlayerState.equipment] = null;
      }
    }
    
    // From equipment to equipment
    else if (
      this.draggedItemSource.equipmentSlot !== undefined && 
      targetSlot.equipmentSlot !== undefined
    ) {
      // Only allow if compatible (e.g., ring to ring slot)
      const sourceIsRing = this.draggedItemSource.equipmentSlot === 'LEFT_RING' || 
                           this.draggedItemSource.equipmentSlot === 'RIGHT_RING';
      const targetIsRing = targetSlot.equipmentSlot === 'LEFT_RING' || 
                           targetSlot.equipmentSlot === 'RIGHT_RING';
      
      if (sourceIsRing === targetIsRing) {
        // Swap equipment items
        const temp = 
          this.currentPlayerState.equipment[targetSlot.equipmentSlot as keyof typeof this.currentPlayerState.equipment];
        this.currentPlayerState.equipment[targetSlot.equipmentSlot as keyof typeof this.currentPlayerState.equipment] = 
          this.currentPlayerState.equipment[this.draggedItemSource.equipmentSlot as keyof typeof this.currentPlayerState.equipment];
        this.currentPlayerState.equipment[this.draggedItemSource.equipmentSlot as keyof typeof this.currentPlayerState.equipment] = temp;
      }
    }
  }
  
  // Keep track of current player state for drag and drop
  private currentPlayerState: PlayerState | null = null;
  private isInventoryOpen: boolean = false;

  /**
   * Render all UI elements on top of the game
   * @param player Current player state
   */
  render(player: PlayerState): void {
    // Save current context state
    this.context.save();
    
    // Store the player state for use in drag and drop
    this.currentPlayerState = player;
    this.isInventoryOpen = player.inventoryOpen;
    
    // If inventory is open, render inventory UI
    if (player.inventoryOpen) {
      this.renderInventory(player);
      
      // Render dragged item if applicable
      if (this.isDragging && this.draggedItem) {
        this.renderDraggedItem();
      }
    }
    
    // Render any other persistent UI elements here
    
    // Restore context state
    this.context.restore();
  }

  /**
   * Render the dragged item following the cursor
   */
  private renderDraggedItem(): void {
    if (!this.draggedItem || !this.draggedItem.image) return;
    
    // Size for dragged item (slightly larger than in slots)
    const itemSize = Math.min(this.canvas.width, this.canvas.height) * 0.06;
    
    // Draw dragged item centered on cursor
    const x = this.dragPosition.x - itemSize / 2;
    const y = this.dragPosition.y - itemSize / 2;
    
    // Load image if not already loaded
    if (!this.itemImages.has(this.draggedItem.image)) {
      const img = new Image();
      img.src = this.draggedItem.image;
      this.itemImages.set(this.draggedItem.image, img);
      return; // Will render on next frame
    }
    
    // Get the loaded image
    const img = this.itemImages.get(this.draggedItem.image);
    
    // Only draw if image is loaded
    if (img && img.complete) {
      // Add semi-transparent white highlight
      this.context.save();
      this.context.shadowColor = 'white';
      this.context.shadowBlur = 10;
      this.context.globalAlpha = 0.8;
      
      // Draw the dragged item
      this.context.drawImage(img, x, y, itemSize, itemSize);
      
      this.context.restore();
    }
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
    
    // Clear slot caches
    this.inventorySlots = [];
    this.equipmentSlots.clear();
    
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
    const highlightColor = 'rgba(100, 100, 255, 0.3)';
    
    // Render 3 columns x 5 rows of inventory slots
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * (slotSize + padding);
        const y = startY + row * (slotSize + padding);
        const inventoryIndex = row * 3 + col;
        
        // Store slot coordinates for drag and drop
        this.inventorySlots.push({
          x, y, slotSize, inventoryIndex
        });
        
        // Slot background
        this.context.fillStyle = slotBgColor;
        this.context.fillRect(x, y, slotSize, slotSize);
        
        // Highlight slot if it's the source of dragged item
        if (
          this.isDragging && 
          this.draggedItemSource && 
          this.draggedItemSource.inventoryIndex === inventoryIndex
        ) {
          this.context.fillStyle = highlightColor;
          this.context.fillRect(x, y, slotSize, slotSize);
        }
        
        // Slot border
        this.context.strokeStyle = slotBorderColor;
        this.context.lineWidth = 1;
        this.context.strokeRect(x, y, slotSize, slotSize);
        
        // Render item if present in inventory
        const item = player.inventory[inventoryIndex];
        if (
          item && 
          item.image && 
          !(
            this.isDragging && 
            this.draggedItemSource && 
            this.draggedItemSource.inventoryIndex === inventoryIndex
          )
        ) {
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
    const highlightColor = 'rgba(100, 100, 255, 0.3)';
    
    // Header for equipment section
    this.context.fillStyle = '#DDD';
    this.context.font = '18px Arial';
    this.context.textAlign = 'center';
    this.context.fillText('Equipment', baseX + slotSize, baseY - 10);
    
    // Helper function to draw a slot and its item if equipped
    const drawEquipmentSlot = (x: number, y: number, slotType: EquipmentSlot | 'LEFT_RING' | 'RIGHT_RING') => {
      // Store slot coordinates for drag and drop
      this.equipmentSlots.set(slotType, { x, y, slotSize, equipmentSlot: slotType });
      
      // Slot background
      this.context.fillStyle = slotBgColor;
      this.context.fillRect(x, y, slotSize, slotSize);
      
      // Highlight slot if it's the source of dragged item
      if (
        this.isDragging && 
        this.draggedItemSource && 
        this.draggedItemSource.equipmentSlot === slotType
      ) {
        this.context.fillStyle = highlightColor;
        this.context.fillRect(x, y, slotSize, slotSize);
      }
      
      // Slot border
      this.context.strokeStyle = slotBorderColor;
      this.context.lineWidth = 1;
      this.context.strokeRect(x, y, slotSize, slotSize);
      
      // Draw item if equipped
      if (player.equipment && slotType in player.equipment) {
        const item = player.equipment[slotType as keyof typeof player.equipment];
        if (
          item && 
          item.image && 
          !(
            this.isDragging && 
            this.draggedItemSource && 
            this.draggedItemSource.equipmentSlot === slotType
          )
        ) {
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