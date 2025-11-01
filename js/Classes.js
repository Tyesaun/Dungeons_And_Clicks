// 🧱 Base Player class — defines shared player properties and basic methods
export class Player {
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
    this.class = className; // <-- matches game.js updateUI() usage
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.maxMp = maxMp;
    this.mp = maxMp;
    this.atk = atk;
    this.def = def;
    this.level = 1;
    this.kills = 0;
    this.exp = 0;
    this.expToNext = 20;
    this.gold = 0;
    this.inventory = [];
    this.skill = skill;
  }

  // 🩹 Rest to recover HP and MP
  rest() {
    const heal = 5;
    const mana = 3;
    this.hp = Math.min(this.maxHp, this.hp + heal);
    this.mp = Math.min(this.maxMp, this.mp + mana);
    return { heal, mana };
  }

  // ⬆️ Level up logic
  levelUp() {
    this.level++;
    this.expToNext = Math.floor(this.expToNext * 1.3);
    this.maxHp += 4;
    this.maxMp += 2;
    this.atk++;
    this.def++;
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }
}

// 🎭 Class templates built from the base Player class
export const classes = {
  warrior: {
    name: "Valen the Stalwart",
    className: "Warrior",
    maxHp: 30,
    maxMp: 10,
    atk: 6,
    def: 4,
    skill: {
      name: "Shoulder Bash",
      mpCost: 3,
      baseDamage: 2,
      stunChance: 0.35,
      cooldown: 2,
      description: "A powerful shoulder strike that deals bonus damage and may stun the foe."
    }
  },

  mage: {
    name: "Lyra the Emberweaver",
    className: "Mage",
    maxHp: 20,
    maxMp: 20,
    atk: 4,
    def: 2,
    skill: {
      name: "Fire Bolt",
      mpCost: 5,
      baseDamage: 5,
      burnChance: 0.4,
      cooldown: 1,
      description: "Hurls a blazing bolt that scorches the target, with a chance to inflict burning damage over time."
    }
  },

  rogue: {
    name: "Kira the Swift",
    className: "Rogue",
    maxHp: 25,
    maxMp: 12,
    atk: 5,
    def: 3,
    skill: {
      name: "Quick Shot",
      mpCost: 4,
      baseDamage: 1,
      cooldown: 2,
      extraAttackChance: 1.0, // always triggers extra attack
      description: "A rapid attack that allows you to strike twice in one turn."
    }
  }
};
