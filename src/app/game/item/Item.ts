/**
 * Enum representing item rarity levels
 */
export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Enum representing equipment slots
 */
export enum EquipmentSlot {
  NONE = 'none',
  HEAD = 'head',
  BODY = 'body',
  MAIN_HAND = 'main_hand',
  OFF_HAND = 'off_hand',
  GLOVES = 'gloves',
  RING = 'ring',
  AMULET = 'amulet',
}

/**
 * Base class for all items in the game
 */
export class Item {
  id: string;
  name: string;
  image: string;
  rarity: ItemRarity;
  stackable: boolean;
  maxStackSize?: number;
  equipable: boolean;
  equipmentSlot: EquipmentSlot;

  constructor(
    id: string,
    name: string,
    image: string,
    rarity: ItemRarity = ItemRarity.COMMON,
    stackable: boolean = false,
    maxStackSize?: number,
    equipable: boolean = false,
    equipmentSlot: EquipmentSlot = EquipmentSlot.NONE
  ) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.rarity = rarity;
    this.stackable = stackable;
    this.maxStackSize = stackable ? (maxStackSize || 99) : undefined;
    this.equipable = equipable;
    this.equipmentSlot = equipmentSlot;
  }

  /**
   * Returns string representation of the item
   */
  toString(): string {
    return `${this.name} (${this.rarity})`;
  }
} 