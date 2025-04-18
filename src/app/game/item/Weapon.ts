import { Item, ItemRarity, EquipmentSlot } from './Item';

/**
 * Weapon class that extends the base Item class
 * Adds combat-related properties like damage and attack speed
 */
export class Weapon extends Item {
  baseAttackSpeed: number;
  minDamage: number;
  maxDamage: number;

  constructor(
    id: string,
    name: string,
    image: string,
    baseAttackSpeed: number,
    minDamage: number,
    maxDamage: number,
    rarity: ItemRarity = ItemRarity.COMMON,
    equipmentSlot: EquipmentSlot = EquipmentSlot.MAIN_HAND
  ) {
    // Weapons are always equipable and not stackable
    super(id, name, image, rarity, false, undefined, true, equipmentSlot);
    
    this.baseAttackSpeed = baseAttackSpeed;
    this.minDamage = minDamage;
    this.maxDamage = maxDamage;
  }

  /**
   * Calculate the damage per second (DPS) of the weapon
   */
  getDps(): number {
    const avgDamage = (this.minDamage + this.maxDamage) / 2;
    return avgDamage * this.baseAttackSpeed;
  }

  /**
   * Generate a random damage value between min and max
   */
  rollDamage(): number {
    return Math.floor(
      Math.random() * (this.maxDamage - this.minDamage + 1) + this.minDamage
    );
  }

  /**
   * Override toString to include weapon stats
   */
  toString(): string {
    return `${this.name} (${this.rarity}) - DMG: ${this.minDamage}-${this.maxDamage}, SPD: ${this.baseAttackSpeed}`;
  }
} 