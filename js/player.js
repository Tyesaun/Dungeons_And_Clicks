// player.js

// --- Player (Hero) class ---
export class Hero {
  constructor({
    name,
    className,
    maxHp,
    maxMp,
    atk,
    def,
    skill
  }) {
    this.name = name;
    this.class = className;
    this.baseHp = maxHp;
    this.baseMp = maxMp;
    this.baseAtk = atk;
    this.baseDef = def;

    this.hp = maxHp;
    this.mp = maxMp;
    this.level = 1;
    this.kills = 0;
    this.exp = 0;
    this.expToNext = 20;
    this.gold = 0;

    this.inventory = [];
    this.skill = skill;

    // 🛡️ Equipment slots
    this.equipment = {
      head: null,
      chest: null,
      arms: null,
      legs: null,
      back: null,
      accessory1: null,
      accessory2: null,
      weapon: null
    };
  }

  // --- Dynamic Stat Getters ---
  get maxHp() {
    return this.baseHp + this.getBonus('hp');
  }

  get maxMp() {
    return this.baseMp + this.getBonus('mp');
  }

  get atk() {
    return this.baseAtk + this.getBonus('atk');
  }

  get def() {
    return this.baseDef + this.getBonus('def');
  }

  // --- Sum bonuses from equipment ---
  getBonus(stat) {
    let total = 0;
    for (const slot of Object.values(this.equipment)) {
      if (slot && slot.bonuses && slot.bonuses[stat]) {
        total += slot.bonuses[stat];
      }
    }
    return total;
  }

  // --- Equip / Unequip ---
  equip(slotName, item) {
    const validSlots = Object.keys(this.equipment);
    if (!validSlots.includes(slotName)) {
      console.warn(`Invalid slot: ${slotName}`);
      return false;
    }

    this.equipment[slotName] = item;
    if (item && item.equipSound) {
      console.log(`*${item.equipSound}*`); // optional sound integration
    }
    return true;
  }

  unequip(slotName) {
    const item = this.equipment[slotName];
    this.equipment[slotName] = null;
    return item;
  }

  // --- Rest ---
  rest() {
    const heal = Math.floor(4 + Math.random() * 6);
    const stamina = 2;
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.mp = Math.min(this.maxMp, this.mp + stamina);
    return { heal, stamina };
  }

  // --- Add Gold ---
  addGold(amount) {
    this.gold += amount;
    return amount;
  }

  // --- Add Experience ---
  addExp(amount, logCallback) {
    this.exp += amount;
    if (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.levelUp(logCallback);
    }
  }

  // --- Level Up ---
  levelUp(logCallback) {
    this.level++;
    this.expToNext = Math.floor(this.expToNext * 1.3);
    this.baseHp += 4;
    this.baseMp += 2;
    this.baseAtk++;
    this.baseDef++;
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    if (logCallback) logCallback(`<strong>You feel stronger.</strong> Level up! You are now level ${this.level}.`);
  }

  // --- Reset (for new run) ---
  resetFromTemplate(template) {
    Object.assign(this, new Hero(template));
  }
}
