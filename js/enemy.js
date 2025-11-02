// enemy.js

// --- Random number utility (local helper) ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Enemy Generator ---
export function generateEnemy(depth) {
  const baseHP = 10 + Math.floor(depth * 4 + Math.random() * 6);
  const baseAtk = 3 + Math.floor(depth * 1 + Math.random() * 2);
  const baseDef = Math.max(1, Math.floor(depth / 2 + Math.random() * 2));

  const types = [
    { name: 'Goblin Raider', emoji: '👺' },
    { name: 'Cave Rat', emoji: '🐀' },
    { name: 'Skeleton Warrior', emoji: '💀' },
    { name: 'Cave Bear', emoji: '🐻' },
    { name: 'Wight Guard', emoji: '👻' }
  ];

  const t = types[Math.floor(Math.random() * types.length)];
  return {
    name: t.name,
    emoji: t.emoji,
    hp: baseHP,
    maxHp: baseHP,
    atk: baseAtk,
    def: baseDef
  };
}

// --- Enemy UI Update ---
export function updateEnemyUI(enemy) {
  if (!enemy) return;
  const eHpEl = document.getElementById('e-hp-text');
  const eHpBar = document.getElementById('e-hp-bar');
  if (eHpEl) eHpEl.textContent = enemy.hp;
  if (eHpBar) eHpBar.style.width = Math.max(0, (enemy.hp / enemy.maxHp) * 100) + '%';
}

// --- Enemy Turn ---
export function enemyTurn(enemy, player, depth, log, updateUI, playerDies, dealDamage) {
  if (!enemy || !player) return;

  const res = dealDamage(enemy.atk, player.def);
  player.hp = Math.max(0, player.hp - res.damage);
  log(`The ${enemy.name} hits you for <strong>${res.damage}</strong> damage${res.crit ? ' (critical!)' : ''}.`);

  // ✅ Reduce cooldowns each turn
  player.skill.cooldown = Math.max(0, player.skill.cooldown - 1);

  // Small MP regen per enemy turn
  player.mp = Math.min(player.maxMp, player.mp + 1);

  updateUI();
  if (player.hp <= 0) playerDies();
}

