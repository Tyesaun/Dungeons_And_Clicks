// classes.js
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
      cooldown: 0,
      baseCooldown: 2,
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
      cooldown: 0,
      baseCooldown: 1,
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
      cooldown: 0,
      baseCooldown: 2,
      extraAttackChance: 1.0,
      description: "A rapid attack that allows you to strike twice in one turn."
    }
  }
};
