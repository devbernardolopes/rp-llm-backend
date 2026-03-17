// themes.js

function applyThemeVars(vars) {
  if (!vars) return;
  Object.entries(vars).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
}

async function getThemeById(id) {
  return await db.themes.get(id);
}

async function getAllThemes() {
  return await db.themes.toArray();
}

async function applyThemeFromDb(themeId) {
  const theme = await getThemeById(themeId);
  if (!theme) {
    console.warn("Theme not found:", themeId);
    return;
  }
  applyThemeVars(theme.variables);
  document.documentElement.setAttribute("data-theme", themeId);
  localStorage.setItem("rp-theme", themeId);
}

async function populateThemeDropdown() {
  const themeSelect = document.getElementById("theme-select");
  if (!themeSelect) return;
  const themes = await getAllThemes();
  const savedThemeId = localStorage.getItem("rp-theme") || "dark";
  themeSelect.innerHTML = "";
  themes.forEach((theme) => {
    const opt = document.createElement("option");
    opt.value = theme.id;
    opt.textContent = t(theme.nameI18n || theme.name);
    themeSelect.appendChild(opt);
  });
  if (themes.find((t) => t.id === savedThemeId)) {
    themeSelect.value = savedThemeId;
  } else if (themes.length > 0) {
    themeSelect.value = themes[0].id;
  }
}

async function applySavedTheme() {
  const savedThemeId = localStorage.getItem("rp-theme") || "dark";
  await applyThemeFromDb(savedThemeId);
}

async function seedAdditionalThemes() {
  const existing = await getAllThemes();
  const existingIds = new Set(existing.map((t) => t.id));

  const now = Date.now();
  const newThemes = [
    {
      id: "midnight",
      name: "Midnight",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#0a0e17",
        "--panel": "#101726",
        "--panel-2": "#141c2b",
        "--line": "#1e2738",
        "--text": "#d4dce8",
        "--muted": "#6b7a96",
        "--primary": "#5b8ff9",
        "--primary-hover": "#7ba3ff",
        "--danger": "#b55a5a",
        "--text-bright": "#f0f4ff",
        "--hover": "#1e2d42",
        "--chat-opacity": "1",
      },
    },
    {
      id: "forest",
      name: "Forest",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#0d1510",
        "--panel": "#142119",
        "--panel-2": "#172820",
        "--line": "#1f3b2e",
        "--text": "#d8e6d8",
        "--muted": "#7a9f7a",
        "--primary": "#4caf7a",
        "--primary-hover": "#6ab39a",
        "--danger": "#b55a5a",
        "--text-bright": "#f0fff0",
        "--hover": "#1f3b2e",
        "--chat-opacity": "1",
      },
    },
    {
      id: "sunset",
      name: "Sunset",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#1a1510",
        "--panel": "#261f19",
        "--panel-2": "#2d2620",
        "--line": "#4a3f32",
        "--text": "#f0e6d8",
        "--muted": "#c9a98c",
        "--primary": "#ff9800",
        "--primary-hover": "#ffad33",
        "--danger": "#e64a4a",
        "--text-bright": "#fff5e6",
        "--hover": "#3d3228",
        "--chat-opacity": "1",
      },
    },
    {
      id: "charcoal",
      name: "Charcoal",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#121212",
        "--panel": "#1e1e1e",
        "--panel-2": "#242424",
        "--line": "#333333",
        "--text": "#e0e0e0",
        "--muted": "#9e9e9e",
        "--primary": "#ffffff",
        "--primary-hover": "#e0e0e0",
        "--danger": "#ff5252",
        "--text-bright": "#ffffff",
        "--hover": "#2d2d2d",
        "--chat-opacity": "1",
      },
    },
    {
      id: "paper",
      name: "Paper",
      isBuiltIn: true,
      createdAt: now,
      variables: {
        "--bg": "#f5f0e6",
        "--panel": "#fffdf5",
        "--panel-2": "#faf8f0",
        "--line": "#d4cfc0",
        "--text": "#2c2c2c",
        "--muted": "#6b6b6b",
        "--primary": "#8b4513",
        "--primary-hover": "#a0522d",
        "--danger": "#c33f3f",
        "--text-bright": "#000000",
        "--hover": "#ebe7de",
        "--chat-opacity": "1",
      },
    },
  ];

  for (const theme of newThemes) {
    if (!existingIds.has(theme.id)) {
      await db.themes.put(theme);
    }
  }
}
