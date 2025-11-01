import { ITEMS, addItemToInventory, useItem, updateInventoryUI } from './items.js';
import { classes, Player } from './Classes.js';

// --- Game data ---

let player = null;
let depth = 1;
let enemy = null;
let inCombat = false;
let cooldown = 0; // Spec Skill cooldown in turns
let logEl = document.getElementById('log');
// Class selection
document.getElementById("choose-warrior").addEventListener("click", () => startGame("warrior"));
document.getElementById("choose-mage").addEventListener("click", () => startGame("mage"));
document.getElementById("choose-rogue").addEventListener("click", () => startGame("rogue"));

function startGame(selectedClass) {
  player = new Player(classes[selectedClass]); // or cloneClass('warrior')
  document.getElementById("class-select").style.display = "none";
  document.getElementById("game-container").style.display = "grid";

  log(`<em>Welcome, ${player.name} the ${player.class}!</em>`);
  updateUI();
  updateInventoryUI(player);
}

const armorSlots = {
  head: null,
  chest: null,
  arms: null,
  legs: null,
  back: null,
  accessory1: null,
  accessory2: null
};

function updateArmorUI() {
  document.querySelectorAll('.armor-slot').forEach(slot => {
    const key = slot.dataset.slot;
    if (armorSlots[key]) {
      slot.textContent = armorSlots[key].icon;
      slot.title = armorSlots[key].name;
    } else {
      slot.textContent = '⬚'; // Empty placeholder
      slot.title = `Empty ${key.charAt(0).toUpperCase() + key.slice(1)} Slot`;
    }
  });
}

const inventorySlots = document.querySelectorAll('#inventory .slot');
let inventory = new Array(10).fill(null);

function updateInventory() {
  inventorySlots.forEach((slot, i) => {
    if (inventory[i]) {
      slot.textContent = inventory[i].icon;
      slot.title = inventory[i].name;
    } else {
      slot.textContent = '';
      slot.title = 'Empty Slot';
    }
  });
}

// Utility
function log(text, cls='') {
  const p = document.createElement('p');
  p.innerHTML = text;
  if (cls) p.className = cls;
  logEl.appendChild(p);

  // ⬇️ Restrict to the last 10 entries
  const maxLines = 10;
  while (logEl.children.length > maxLines) {
    logEl.removeChild(logEl.firstChild);
  }

  logEl.scrollTop = logEl.scrollHeight;
}

function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

// Enemy generator (scales with depth)
function generateEnemy(depth) {
  const baseHP = 10 + Math.floor(depth * 4 + Math.random()*6);
  const baseAtk = 3 + Math.floor(depth * 1 + Math.random()*2);
  const baseDef = Math.max(1, Math.floor(depth/2 + Math.random()*2));
  const types = [
    {name:'Goblin Raider', emoji:'👺'},
    {name:'Cave Rat', emoji:'🐀'},
    {name:'Skeleton Warrior', emoji:'💀'},
    {name:'Cave Bear', emoji:'🐻'},
    {name:'Wight Guard', emoji:'👻'}
  ];
  const t = types[Math.min(types.length-1, Math.floor(Math.random()*types.length))];
  return {
    name: t.name,
    emoji: t.emoji,
    hp: baseHP,
    maxHp: baseHP,
    atk: baseAtk,
    def: baseDef
  };
}

// UI updates
function updateUI() {
  document.getElementById('p-name').textContent = player.name;
  document.getElementById('p-level').textContent = 'Level ' + player.level;
  document.getElementById('p-hp-text').textContent = `${player.hp} / ${player.maxHp}`;
  document.getElementById('p-mp-text').textContent = `${player.mp} / ${player.maxMp}`;
  document.querySelector('.player .avatar').textContent = player.class.charAt(0);
  document.getElementById('p-atk').textContent = player.atk;
  document.getElementById('p-def').textContent = player.def;
  document.getElementById('p-hp-bar').style.width = Math.max(0, (player.hp/player.maxHp)*100) + '%';
  document.getElementById('p-mp-bar').style.width = Math.max(0, (player.mp/player.maxMp)*100) + '%';
  document.getElementById('depth').textContent = depth;
  document.getElementById('depth2').textContent = depth;
  document.getElementById('kills').textContent = player.kills;
  document.getElementById('skill-btn').disabled = (cooldown>0) || !inCombat;
  document.getElementById('skill-btn').classList.toggle('cooldown', cooldown>0);
  document.getElementById('skill-btn').innerHTML = `
    ${player.skill.name} 
    ${cooldown > 0 
      ? '<span class="small muted"> (' + cooldown + ')</span>' 
      : '<span class="small muted"> (' + player.skill.cooldown + ' turn cooldown)</span>'}
  `;
  document.getElementById('p-exp-text').textContent = `${player.exp} / ${player.expToNext}`;
  document.getElementById('p-exp-bar').style.width = Math.min(100, (player.exp / player.expToNext) * 100) + '%';
  document.getElementById('rest').disabled = player.hp <= 0;
  document.getElementById('enter-room').disabled = player.hp <= 0;
  document.getElementById('player-class').textContent = player.class;
  document.getElementById('gold').textContent = player.gold;
}

// Combat calculation helpers
function dealDamage(attackerAtk, targetDef) {
  const variance = rand(0,2);
  const raw = Math.max(1, attackerAtk - Math.floor(targetDef/2) + variance);
  const crit = (Math.random() < 0.08); // small crit chance
  return {damage: raw * (crit?2:1), crit};
}

// Start a room
function enterRoom() {
  if (inCombat) { log("You are already fighting!"); return; }
  // Random event: 80% enemy, 20% treasure/trap
  const roll = Math.random();
  if (roll < 0.8) {
    enemy = generateEnemy(depth);
    inCombat = true;
    cooldown = Math.max(0, cooldown); // keep cooldown
    log(`<strong>Depth ${depth} — Encounter:</strong> ${enemy.name} ${enemy.emoji} (HP ${enemy.hp})`);
    spawnEnemyUI();
  } else {
    // treasure or trap
    if (Math.random() < 0.6) {
      const hpGain = Math.floor(3 + Math.random()*4);
      player.hp = Math.min(player.maxHp, player.hp + hpGain);
      log(`<strong>Treasure chest:</strong> You find a minor potion and recover <strong>+${hpGain} HP</strong>.`);
    } else {
      const dmg = rand(2 + depth, 5 + depth*2);
      player.hp = Math.max(0, player.hp - dmg);
      log(`<strong>Trap:</strong> A hidden spike! You take <strong>${dmg}</strong> damage.`);
      if (player.hp <= 0) return playerDies();
    }
    depth++;
    updateUI();
  }
}

// Enemy UI spawn
function spawnEnemyUI() {
  const room = document.getElementById('room');
  // remove any previous enemy node
  const old = document.getElementById('enemy-section');
  if (old) old.remove();

  const div = document.createElement('div');
  div.id = 'enemy-section';
  div.innerHTML = `<div class="enemy"><div class="avatar" aria-hidden="true">${enemy.emoji}</div>
    <div style="flex:1">
      <div style="display:flex; justify-content:space-between; align-items:center"><div style="font-weight:600">${enemy.name}</div><div class="small muted">ATK ${enemy.atk} · DEF ${enemy.def}</div></div>
      <div style="margin-top:6px" class="small muted">HP <span id="e-hp-text">${enemy.hp}</span> / ${enemy.maxHp}</div>
      <div class="bar" style="margin-top:6px"><i id="e-hp-bar" style="width:100%"></i></div>
    </div></div>`;
  // action buttons for combat
  const actionRow = document.createElement('div');
  actionRow.style.marginTop='10px';
  actionRow.className = 'choices';
  actionRow.innerHTML = `
    <button id="attack-btn" class="btn big">Attack</button>
    <button id="skill-btn2" class="btn big">${player.skill.name}</button>
    <button id="flee-btn" class="btn secondary big">Attempt Flee</button>
  `;
  div.appendChild(actionRow);
  document.getElementById('room').appendChild(div);

  document.getElementById('attack-btn').addEventListener('click', playerAttack);
  document.getElementById('skill-btn2').addEventListener('click', playerSkill);
  document.getElementById('flee-btn').addEventListener('click', attemptFlee);

  updateUI();
}

// Combat flow
function playerAttack() {
  if (!inCombat || !enemy) return;
  const result = dealDamage(player.atk, enemy.def);
  enemy.hp -= result.damage;
  log(`You strike the ${enemy.name} for <strong>${result.damage}</strong> damage${result.crit? ' (critical!)' : ''}.`);
  updateEnemyUI();
  if (enemy.hp <= 0) return enemyDies();
  enemyTurn();
}

function playerSkill() {
  if (!inCombat || !enemy) return;
  const skill = player.skill;

  if (cooldown > 0) { log(`${skill.name} is not ready.`); return; }
  if (player.mp < skill.mpCost) { log(`Not enough Mana to use ${skill.name}.`); return; }

  player.mp -= skill.mpCost;
  let dmg = Math.max(1, player.atk + skill.baseDamage - Math.floor(enemy.def/3) + rand(0,2));

  if (player.class === "Warrior") {
    const stunned = Math.random() < skill.stunChance;
    cooldown = skill.cooldown;
    log(`You use <strong>${skill.name}</strong>, dealing <strong>${dmg}</strong> damage${stunned ? " and stunning the enemy!" : "."}`);
    enemy.hp -= dmg;
    if (enemy.hp <= 0) return enemyDies();
    if (!stunned) enemyTurn();
    else log(`<em>The ${enemy.name} is stunned and cannot retaliate this turn.</em>`);
  }

  if (player.class === "Mage") {
    const burned = Math.random() < skill.burnChance;
    cooldown = skill.cooldown;
    log(`You cast <strong>${skill.name}</strong>, blasting the ${enemy.name} for <strong>${dmg}</strong> damage${burned ? " and setting them ablaze!" : "."}`);
    enemy.hp -= dmg;

    if (burned) {
      const burnDamage = Math.floor(dmg * 0.3);
      setTimeout(() => {
        if (enemy && inCombat) {
          enemy.hp -= burnDamage;
          log(`<em>The flames scorch the ${enemy.name} for ${burnDamage} burning damage.</em>`);
          if (enemy.hp <= 0) enemyDies();
          else updateEnemyUI();
        }
      }, 1000);
    }
    if (player.class === "Rogue") {
  const skill = player.skill;
  if (cooldown > 0) { log(`${skill.name} is not ready.`); return; }
  if (player.mp < skill.mpCost) { log(`Not enough Stamina to use ${skill.name}.`); return; }

  player.mp -= skill.mpCost;
  cooldown = skill.cooldown;

  // First attack
  let dmg1 = Math.max(1, player.atk + skill.baseDamage - Math.floor(enemy.def/3) + rand(0,2));
  enemy.hp -= dmg1;
  log(`You use <strong>${skill.name}</strong> and strike swiftly for <strong>${dmg1}</strong> damage!`);

  // Second attack
  if (Math.random() < skill.extraAttackChance && enemy.hp > 0) {
    const dmg2 = Math.max(1, player.atk - Math.floor(enemy.def/2) + rand(0,2));
    enemy.hp -= dmg2;
    log(`<em>You follow up with a second Quick Shot, hitting for <strong>${dmg2}</strong> more damage!</em>`);
  }

  updateEnemyUI(); updateUI();

  if (enemy.hp <= 0) return enemyDies();
  enemyTurn();
}

    updateEnemyUI();
    if (enemy.hp <= 0) return enemyDies();
    enemyTurn();
  }

  updateEnemyUI(); updateUI();
}


function attemptFlee() {
  if (!inCombat || !enemy) return;
  const chance = 0.4 - (depth*0.02);
  if (Math.random() < chance) {
    log("You successfully slip past the enemy and move deeper.");
    inCombat = false;
    enemy = null;
    depth++;
    cooldown = Math.max(0, cooldown-1);
    updateUI();
    const old = document.getElementById('enemy-section'); if (old) old.remove();
  } else {
    log("Flee failed! The enemy strikes as you try to run.");
    enemyTurn();
  }
}

function enemyTurn() {
  // enemy attacks
  if (!enemy) return;
  const res = dealDamage(enemy.atk, player.def);
  player.hp = Math.max(0, player.hp - res.damage);
  log(`The ${enemy.name} hits you for <strong>${res.damage}</strong> damage${res.crit? ' (critical!)' : ''}.`);
  // reduce cooldowns and regen small MP each full round
  cooldown = Math.max(0, cooldown-1);
  player.mp = Math.min(player.maxMp, player.mp + 1);
  updateUI();
  if (player.hp <= 0) playerDies();
}

function enemyDies() {
  log(`<strong>The ${enemy.name} falls.</strong>`);
  player.kills++;

  // 💰 Gold drop calculation
  const goldDrop = Math.floor(Math.random() * 8 + 3 + depth * 1.2); // 3–10 + depth scaling
  player.gold = (player.gold || 0) + goldDrop; // ensure player.gold exists

  const lootMessages = [
    `You scoop up <strong>${goldDrop}</strong> gold coins.`,
    `The ${enemy.name} dropped <strong>${goldDrop}</strong> coins!`,
    `You find <strong>${goldDrop}</strong> gold among the remains.`,
    `A small pouch jingles with <strong>${goldDrop}</strong> gold coins.`
  ];
  log(lootMessages[Math.floor(Math.random() * lootMessages.length)] + " 💰");

  // 🎁 20% chance to drop an item (e.g., Minor Potion)
  if (Math.random() < 0.2) {
    const item = ITEMS.minorPotion;
    addItemToInventory(player, item);
    log(`You found a <strong>${item.name}</strong> ${item.icon}! It’s been added to your inventory.`);
  }

  // 🔼 Small level progression every 3 kills
  if (player.kills % 3 === 0) {
    player.level++;
    player.maxHp += 4;
    player.hp = player.maxHp;
    player.atk += 1;
    player.def += 1;
    log(`<strong>You feel stronger.</strong> Level up! You are now level ${player.level}.`);
  }

  inCombat = false;
  enemy = null;
  depth++;

  // Remove enemy UI if it exists
  const old = document.getElementById('enemy-section');
  if (old) old.remove();

  // ⭐ EXP gain
  const expGain = 8 + Math.floor(Math.random() * 6) + depth;
  player.exp += expGain;
  log(`<span class="muted">You gain <strong>${expGain} EXP</strong>.</span>`);

  // 🎚 Level-up check
  if (player.exp >= player.expToNext) {
    player.exp -= player.expToNext;
    player.level++;
    player.expToNext = Math.floor(player.expToNext * 1.3);
    player.maxHp += 4;
    player.hp = player.maxHp;
    player.atk += 1;
    player.def += 1;
    log(`<strong>You feel stronger.</strong> Level up! You are now level ${player.level}.`);
  }

  // 🧾 Update all UI elements, including gold and inventory if displayed
  updateUI();
}



function updateEnemyUI() {
  if (!enemy) return;
  const eHpEl = document.getElementById('e-hp-text');
  const eHpBar = document.getElementById('e-hp-bar');
  if (eHpEl) eHpEl.textContent = enemy.hp;
  if (eHpBar) eHpBar.style.width = Math.max(0, (enemy.hp/enemy.maxHp)*100) + '%';
}

function playerDies() {
  log(`<strong>You collapse in the cold stone.</strong> Your run ends at depth ${depth}.`);
  inCombat = false;
  // show restart prompt
  const old = document.getElementById('enemy-section'); if (old) old.remove();
  node = document.createElement('p');
  node.innerHTML = `<em class="muted">Press Restart Run to try again.</em>`;
  logEl.appendChild(node);
  updateUI();
}

// Rest (out of combat)
function rest() {
  if (inCombat) { log("You cannot rest while in combat!"); return; }
  const heal = Math.floor(4 + Math.random()*6);
  player.hp = Math.min(player.maxHp, player.hp + heal);
  // small stamina restore too
  player.mp = Math.min(player.maxMp, player.mp + 2);
  log(`You take a moment to rest and recover <strong>+${heal} HP</strong> and +2 Stamina.`);
  // small chance of ambush
  if (Math.random() < 0.12) {
    log("An ambush! While resting, something attacks!");
    depth = Math.max(1, depth);
    enterRoom();
  }
  updateUI();
}

// Restart run
function restart() {
  player = JSON.parse(JSON.stringify(playerTemplate));
  depth = 1;
  enemy = null;
  inCombat = false;
  cooldown = 0;
  logEl.innerHTML = `<p>You are ${player.name}, a warrior set upon ancient stone and secret trials.</p><p class="center-note">Click <strong>Enter Room</strong> to step forward.</p>`;
  updateUI();
  const old = document.getElementById('enemy-section'); if (old) old.remove();
}

// Buttons
document.getElementById('enter-room').addEventListener('click', () => { enterRoom(); updateUI(); });
document.getElementById('rest').addEventListener('click', () => { rest(); });
document.getElementById('restart').addEventListener('click', () => { restart(); });

// Skill (side button in left panel)
document.getElementById('skill-btn').addEventListener('click', () => { playerSkill(); });
// Keep UI in sync with changes
// updateUI();

// Accessibility hint
log(`<em class="muted">Tip: this prototype is intentionally simple. Combat is short — good for quick plays.</em>`);
