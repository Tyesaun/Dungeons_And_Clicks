// combat.js
import { updateEnemyUI } from './enemy.js';
import { ITEMS, addItemToInventory } from './items.js';

// Utility RNG
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Damage calculation ---
export function dealDamage(attackerAtk, targetDef) {
  const variance = rand(0, 2);
  const raw = Math.max(1, attackerAtk - Math.floor(targetDef / 2) + variance);
  const crit = Math.random() < 0.08;
  return { damage: raw * (crit ? 2 : 1), crit };
}

// --- Player basic attack ---
export function playerAttack(player, enemy, state, log, updateUI, playerDies, enemyDies) {
  if (!state.inCombat || !enemy) return;

  const result = dealDamage(player.atk, enemy.def);
  enemy.hp -= result.damage;
  log(`You strike the ${enemy.name} for <strong>${result.damage}</strong> damage${result.crit ? ' (critical!)' : ''}.`);

  updateEnemyUI(enemy);
  if (enemy.hp <= 0) return enemyDies();

  enemyTurn(player, enemy, state, log, updateUI, playerDies);
}

// --- Player skill ---
export function playerSkill(player, enemy, state, log, updateUI, playerDies, enemyDies) {
  if (!state.inCombat || !enemy) return;
  const skill = player.skill;

  if (player.cooldown > 0) {
    log(`${skill.name} is not ready.`);
    return;
  }

  if (player.mp < skill.mpCost) {
    log(`Not enough Mana to use ${skill.name}.`);
    return;
  }

  player.mp -= skill.mpCost;
  player.cooldown = skill.cooldown; // store cooldown directly on player
  let dmg = Math.max(1, player.atk + skill.baseDamage - Math.floor(enemy.def / 3) + rand(0, 2));

  if (player.class === "Warrior") {
    const stunned = Math.random() < skill.stunChance;
    log(`You use <strong>${skill.name}</strong>, dealing <strong>${dmg}</strong> damage${stunned ? " and stunning the enemy!" : "."}`);
    enemy.hp -= dmg;
    if (enemy.hp <= 0) return enemyDies();
    if (!stunned) enemyTurn(player, enemy, state, log, updateUI, playerDies);
    else log(`<em>The ${enemy.name} is stunned and cannot retaliate this turn.</em>`);
  }

  else if (player.class === "Mage") {
    const burned = Math.random() < skill.burnChance;
    log(`You cast <strong>${skill.name}</strong>, blasting the ${enemy.name} for <strong>${dmg}</strong> damage${burned ? " and setting them ablaze!" : "."}`);
    enemy.hp -= dmg;

    if (burned) {
      const burnDamage = Math.floor(dmg * 0.3);
      setTimeout(() => {
        if (enemy && state.inCombat) {
          enemy.hp -= burnDamage;
          log(`<em>The flames scorch the ${enemy.name} for ${burnDamage} burning damage.</em>`);
          if (enemy.hp <= 0) enemyDies();
          else updateEnemyUI(enemy);
        }
      }, 1000);
    }

    if (enemy.hp <= 0) return enemyDies();
    enemyTurn(player, enemy, state, log, updateUI, playerDies);
  }

  else if (player.class === "Rogue") {
    log(`You use <strong>${skill.name}</strong> and strike swiftly for <strong>${dmg}</strong> damage!`);
    enemy.hp -= dmg;

    if (Math.random() < skill.extraAttackChance && enemy.hp > 0) {
      const dmg2 = Math.max(1, player.atk - Math.floor(enemy.def / 2) + rand(0, 2));
      enemy.hp -= dmg2;
      log(`<em>You follow up with a second Quick Shot, hitting for <strong>${dmg2}</strong> more damage!</em>`);
    }

    updateEnemyUI(enemy);
    if (enemy.hp <= 0) return enemyDies();
    enemyTurn(player, enemy, state, log, updateUI, playerDies);
  }

  updateUI();
}

// --- Enemy turn ---
export function enemyTurn(player, enemy, state, log, updateUI, playerDies) {
  if (!enemy) return;

  const res = dealDamage(enemy.atk, player.def);
  player.hp = Math.max(0, player.hp - res.damage);
  log(`The ${enemy.name} hits you for <strong>${res.damage}</strong> damage${res.crit ? ' (critical!)' : ''}.`);

  // ✅ Decrease skill cooldown each round
  if (player.cooldown > 0) player.cooldown = Math.max(0, player.cooldown - 1);

  // MP regen
  player.mp = Math.min(player.maxMp, player.mp + 1);

  updateUI();
  if (player.hp <= 0) playerDies();
}

// --- Flee attempt ---
export function attemptFlee(player, enemy, state, log, updateUI, playerDies) {
  if (!state.inCombat || !enemy) return;
  const chance = 0.4 - (state.depth * 0.02);

  if (Math.random() < chance) {
    log("You successfully slip past the enemy and move deeper.");
    state.inCombat = false;
    state.enemy = null;
    state.depth++;
    player.cooldown = Math.max(0, player.cooldown - 1);
    const old = document.getElementById('enemy-section');
    if (old) old.remove();
    updateUI();
  } else {
    log("Flee failed! The enemy strikes as you try to run.");
    enemyTurn(player, enemy, state, log, updateUI, playerDies);
  }
}

// --- When enemy dies ---
export function enemyDies(player, enemy, state, log, updateUI) {
  log(`<strong>The ${enemy.name} falls.</strong>`);
  player.kills++;

  // Gold
  const goldDrop = Math.floor(Math.random() * 8 + 3 + state.depth * 1.2);
  player.addGold(goldDrop);
  log(`You loot <strong>${goldDrop}</strong> gold coins. 💰`);

  // 20% chance for item
  if (Math.random() < 0.2) {
    const item = ITEMS.minorPotion;
    addItemToInventory(player, item);
    log(`You found a <strong>${item.name}</strong> ${item.icon}!`);
  }

  // Level up every 3 kills
  if (player.kills % 3 === 0) player.levelUp(log);

  // EXP gain
  const expGain = 8 + Math.floor(Math.random() * 6) + state.depth;
  player.addExp(expGain, log);

  // End combat
  state.inCombat = false;
  state.enemy = null;
  state.depth++;

  const old = document.getElementById('enemy-section');
  if (old) old.remove();

  updateUI();
}
