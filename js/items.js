// items.js

// --- Item Definitions ---
export const ITEMS = {
  // 🧪 Consumables
  minorPotion: {
    id: 'minorPotion',
    name: 'Minor Healing Potion',
    icon: '🧪',
    description: 'Restores 10 HP.',
    type: 'consumable',
    effect: (player, log) => {
      const heal = 10;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      if (log) log(`<span class="muted">You drink a <strong>Minor Healing Potion</strong> and recover <strong>${heal} HP</strong>.</span>`);
    }
  },

  // ⚔️ Weapons
  rustySword: {
    id: 'rustySword',
    name: 'Rusty Sword',
    icon: '⚔️',
    description: '+3 ATK. Old but still sharp.',
    type: 'weapon',
    slot: 'weapon',
    bonuses: { atk: 3 }
  },

  woodenStaff: {
    id: 'woodenStaff',
    name: 'Wooden Staff',
    icon: '🪄',
    description: '+2 ATK, +2 MP.',
    type: 'weapon',
    slot: 'weapon',
    bonuses: { atk: 2, mp: 2 }
  },

  // 🛡️ Armor
  ironHelmet: {
    id: 'ironHelmet',
    name: 'Iron Helmet',
    icon: '🪖',
    description: '+2 DEF when worn.',
    type: 'armor',
    slot: 'head',
    bonuses: { def: 2 }
  },

  leatherArmor: {
    id: 'leatherArmor',
    name: 'Leather Armor',
    icon: '🥋',
    description: '+3 DEF.',
    type: 'armor',
    slot: 'chest',
    bonuses: { def: 3 }
  },

  // 💍 Accessories
  silverRing: {
    id: 'silverRing',
    name: 'Silver Ring',
    icon: '💍',
    description: '+1 DEF, +1 ATK.',
    type: 'accessory',
    slot: 'accessory1',
    bonuses: { def: 1, atk: 1 }
  }
};

// --- Inventory Handling ---
export function addItemToInventory(player, item) {
  if (!player.inventory) player.inventory = [];
  if (player.inventory.length >= 20) {
    console.warn("Inventory full!");
    return false;
  }
  player.inventory.push(item);
  updateInventoryUI(player);
  return true;
}

export function removeItemFromInventory(player, item) {
  const idx = player.inventory.indexOf(item);
  if (idx !== -1) {
    player.inventory.splice(idx, 1);
    updateInventoryUI(player);
  }
}

// --- Use Item (Consumables) ---
export function useItem(player, item, log) {
  if (!item || item.type !== 'consumable') {
    if (log) log(`<em>You can’t use that item right now.</em>`);
    return;
  }
  item.effect(player, log);
  removeItemFromInventory(player, item);
  updateInventoryUI(player);
}

// --- Equip Item ---
export function equipItem(player, item, log) {
  if (!item || (item.type !== 'weapon' && item.type !== 'armor' && item.type !== 'accessory')) {
    if (log) log(`<em>This item cannot be equipped.</em>`);
    return false;
  }

  const slot = item.slot;
  const unequipped = player.equipment[slot];
  if (unequipped) {
    // return old item to inventory
    addItemToInventory(player, unequipped);
    if (log) log(`<span class="muted">You unequip your <strong>${unequipped.name}</strong>.</span>`);
  }

  player.equip(slot, item);
  removeItemFromInventory(player, item);
  if (log) log(`<strong>${item.name}</strong> equipped in ${slot} slot!`);
  updateInventoryUI(player);
  return true;
}

// --- Update Inventory UI ---
export function updateInventoryUI(player) {
  const container = document.getElementById('inventory');
  if (!container) return;
  container.innerHTML = '';

  player.inventory.forEach((item, index) => {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.title = `${item.name}\n${item.description}`;
    slot.textContent = item.icon;

    // click behavior
    slot.addEventListener('click', () => {
      if (item.type === 'consumable') {
        useItem(player, item, window.log);
      } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
        equipItem(player, item, window.log);
      }
    });

    container.appendChild(slot);
  });

  // Fill empty slots visually
  const remaining = 20 - player.inventory.length;
  for (let i = 0; i < remaining; i++) {
    const empty = document.createElement('div');
    empty.className = 'slot empty';
    empty.textContent = '';
    container.appendChild(empty);
  }
}
