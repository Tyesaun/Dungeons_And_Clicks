import { COMPANION_TEMPLATES } from "../data/companions.js";
import { renderCompanionSprites } from "../core/ui.js";

export let player = {
  name: "Hero",
  hp: 50,
  atk: 8,
  def: 5,
  className: "Warrior",
  companions: []
};

export function startGame() {
  document.getElementById("log").innerText = "Your adventure begins...";
  renderCompanionSprites(player.companions);
}

window.onload = startGame;