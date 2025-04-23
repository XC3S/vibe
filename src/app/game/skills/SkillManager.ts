import Skill from './Skill';
import Player from '../core/Player';
import BasicAttack from './BasicAttack';

/**
 * Manages skills for a player
 */
export default class SkillManager {
  private _skills: Map<string, Skill> = new Map();
  private _equippedSkills: Skill[] = [];
  private _player: Player;
  private _maxEquippedSkills: number = 4; // Maximum number of equipped skills
  
  /**
   * Create a new SkillManager
   * @param player The player to manage skills for
   */
  constructor(player: Player) {
    this._player = player;
    
    // Add default skills
    const basicAttack = new BasicAttack();
    this.addSkill('basicAttack', basicAttack);
    this.equipSkill('basicAttack', 0); // Equip to first slot
  }
  
  /**
   * Add a skill to the player's available skills
   * @param id Unique identifier for the skill
   * @param skill The skill to add
   */
  addSkill(id: string, skill: Skill): void {
    this._skills.set(id, skill);
  }
  
  /**
   * Remove a skill from the player's available skills
   * @param id Identifier of the skill to remove
   */
  removeSkill(id: string): void {
    // Also un-equip if currently equipped
    this.unequipSkillById(id);
    this._skills.delete(id);
  }
  
  /**
   * Get a skill by its ID
   * @param id Identifier of the skill to get
   * @returns The skill or undefined if not found
   */
  getSkill(id: string): Skill | undefined {
    return this._skills.get(id);
  }
  
  /**
   * Equip a skill to a specific slot
   * @param id Identifier of the skill to equip
   * @param slot Slot number (0-based)
   * @returns Success status
   */
  equipSkill(id: string, slot: number): boolean {
    // Verify slot is valid
    if (slot < 0 || slot >= this._maxEquippedSkills) {
      return false;
    }
    
    // Get the skill
    const skill = this._skills.get(id);
    if (!skill) {
      return false;
    }
    
    // Ensure array is sized properly
    while (this._equippedSkills.length <= slot) {
      this._equippedSkills.push(null as unknown as Skill);
    }
    
    // Equip the skill
    this._equippedSkills[slot] = skill;
    return true;
  }
  
  /**
   * Unequip a skill from a specific slot
   * @param slot Slot number (0-based)
   */
  unequipSkill(slot: number): void {
    if (slot >= 0 && slot < this._equippedSkills.length) {
      this._equippedSkills[slot] = null as unknown as Skill;
    }
  }
  
  /**
   * Unequip a skill by its ID
   * @param id ID of the skill to unequip
   */
  unequipSkillById(id: string): void {
    for (let i = 0; i < this._equippedSkills.length; i++) {
      const equippedSkill = this._equippedSkills[i];
      if (equippedSkill && this.getSkillId(equippedSkill) === id) {
        this.unequipSkill(i);
      }
    }
  }
  
  /**
   * Get the ID of a skill
   * @param skill The skill to find the ID for
   * @returns The ID or null if not found
   */
  private getSkillId(skill: Skill): string | null {
    for (const [id, s] of this._skills.entries()) {
      if (s === skill) {
        return id;
      }
    }
    return null;
  }
  
  /**
   * Get all equipped skills
   */
  get equippedSkills(): Skill[] {
    return [...this._equippedSkills];
  }
  
  /**
   * Use a skill by its slot number
   * @param slot Slot number (0-based)
   * @param ctx Canvas rendering context
   * @param target Optional target for the skill
   * @param params Additional parameters
   * @returns Success status
   */
  useSkill(
    slot: number, 
    ctx: CanvasRenderingContext2D, 
    target?: any, 
    params?: any
  ): boolean {
    console.log('useSkill called with slot:', slot);

    // Check valid slot
    if (slot < 0 || slot >= this._equippedSkills.length) {
      return false;
    }
    
    // Get the skill
    const skill = this._equippedSkills[slot];
    if (!skill) {
      return false;
    }
    
    // Use the skill
    return skill.use(this._player, ctx, target, params);
  }
  
  /**
   * Render all equipped skill icons on the canvas
   * @param ctx Canvas rendering context
   * @param startX Starting X position
   * @param startY Starting Y position
   * @param size Size of each icon
   * @param padding Padding between icons
   */
  renderSkillBar(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    size: number = 40,
    padding: number = 10
  ): void {
    // Render each equipped skill
    for (let i = 0; i < this._maxEquippedSkills; i++) {
      const x = startX + i * (size + padding);
      const y = startY;
      
      // Draw empty slot if no skill equipped
      if (i >= this._equippedSkills.length || !this._equippedSkills[i]) {
        // Empty skill slot background
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(x, y, size, size);
      } else {
        // Render the skill icon
        this._equippedSkills[i].renderIcon(ctx, x, y, size, size);
        
        // Draw the slot number
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`${i + 1}`, x + 5, y + 15);
      }
    }
  }
} 