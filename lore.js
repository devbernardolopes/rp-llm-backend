// lore.js
// Returns lore entries whose tags appear in the recent conversation
async function getRelevantLore(history) {
  const allLore = await db.lorebooks.toArray();
  if (allLore.length === 0) return [];

  // Look at last 6 messages for keyword matching
  const recentText = history
    .slice(-6)
    .map((m) => m.content)
    .join(" ")
    .toLowerCase();

  return allLore.filter((entry) => {
    if (!entry.tags) return false;
    const tags = entry.tags.split(",").map((t) => t.trim().toLowerCase());
    return tags.some((tag) => recentText.includes(tag));
  });
}

async function openLoreEditor() {
  const name = prompt("Lore entry name:");
  if (!name) return;
  const content = prompt("Lore content:");
  if (!content) return;
  const tags = prompt("Trigger keywords (comma separated):");
  await db.lorebooks.add({ name, content, tags });
  alert("Lore entry saved!");
}
