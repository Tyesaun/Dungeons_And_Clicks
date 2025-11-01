// 📦 items.js

// Item definitions
export const ITEMS = {
  minorPotion: {
    id: 'minorPotion',
    name: 'Minor Potion',
    icon: '🧪',
    description: 'Restores 10 HP when used.',
    type: 'consumable',
    use: (player) => {
      const heal = 10;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      log(`You use a <strong>Minor Potion</strong> and restore ${heal} HP.`);
      updateUI(); // this comes from game.js
    }
  }
};

// ➕ Add an item to player inventory
export function addItemToInventory(player, item) {
  if (player.inventory.length >= 10) {
    log('Your inventory is full! You leave the item behind.');
    return;
  }
  player.inventory.push(item);
  updateInventoryUI(player);
}

// 🍷 Use an item by index
export function useItem(player, index) {
  const item = player.inventory[index];
  if (!item) return;
  if (item.use) item.use(player);
  player.inventory.splice(index, 1); // remove after use
  updateInventoryUI(player);
}

// 🔄 Refresh inventory visuals
export function updateInventoryUI(player) {
  const slots = document.querySelectorAll('#inventory .slot');
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const item = player.inventory[i];

    if (item) {
      slot.textContent = item.icon;
      slot.title = `${item.name} — ${item.description}`;
      slot.onclick = () => useItem(player, i);
    } else {
      slot.textContent = '';
      slot.title = 'Empty Slot';
      slot.onclick = null;
    }
  }
}
