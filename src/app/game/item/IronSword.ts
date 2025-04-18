import { Weapon } from './Weapon';
import { ItemRarity, EquipmentSlot } from './Item';

/**
 * Iron Sword - A basic weapon for beginner adventures
 * A common one-handed weapon with moderate damage
 */
export class IronSword extends Weapon {
  constructor() {
    super(
      'iron_sword',       // id
      'Iron Sword',       // name
      '/gameAssets/sword1.png', // image path
      2,                  // attack speed
      11,                 // min damage
      22,                 // max damage
      ItemRarity.COMMON,  // rarity
      EquipmentSlot.MAIN_HAND // equipment slot
    );
  }
} 