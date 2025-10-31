export function renderCompanionSprites(companions) {
  const field = document.getElementById('battle-field');
  field.innerHTML = "";
  companions.forEach(c => {
    const sprite = c.sprite || "src/assets/images/companions/sprites/placeholder.png";
    field.innerHTML += `
      <div class="companion-sprite" style="display:inline-block;margin:0 10px;text-align:center;">
        <img src="${sprite}" alt="${c.name}" style="width:128px;height:auto;">
        <p>${c.name}</p>
      </div>
    `;
  });
}