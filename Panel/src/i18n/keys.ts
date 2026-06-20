// English is the source of truth and the fallback for any missing key/locale.
export const EN = {
  // Header
  "app.title": "CS2 Skin Mod",
  "app.vacSafe": "VAC Safe*",
  "app.localOnly": "Local Only",

  // Tabs
  "tab.weapons": "Weapons",
  "tab.knives": "Knives",
  "tab.gloves": "Gloves",
  "tab.agents": "Agents",
  "tab.music": "Music",

  // Weapon Panel
  "weapon.title": "Weapon Skins",
  "weapon.all": "All",
  "weapon.pistols": "Pistols",
  "weapon.rifles": "Rifles",
  "weapon.snipers": "Snipers",
  "weapon.smgs": "SMGs",
  "weapon.heavy": "Heavy",
  "weapon.selectPaint": "Select Paint",
  "weapon.noPaint": "No paint selected",
  "weapon.wear": "Wear",
  "weapon.seed": "Seed",
  "weapon.settings": "Skin Settings",
  "weapon.stickerSearch": "Search stickers...",

  // Knife Panel
  "knife.title": "Knife Selection",
  "knife.selectType": "Knife Type",
  "knife.selectPaint": "Knife Paint",
  "knife.wear": "Wear",
  "knife.seed": "Seed",

  // Glove Panel
  "glove.title": "Glove Selection",
  "glove.selectType": "Glove Type",
  "glove.selectPaint": "Glove Paint",
  "glove.wear": "Wear",
  "glove.seed": "Seed",

  // Agent Panel
  "agent.title": "Agent Models",
  "agent.ct": "Counter-Terrorist",
  "agent.t": "Terrorist",

  // Music Panel
  "music.title": "Music Kits",

  // Preview
  "preview.title": "Current Loadout",
  "preview.knife": "Knife",
  "preview.gloves": "Gloves",
  "preview.music": "Music Kit",
  "preview.weapons": "Weapons",
  "preview.random": "Random Mode",
  "preview.custom": "Custom Mode",
  "preview.notSelected": "Not selected",

  // Buttons
  "btn.apply": "Apply Loadout",
  "btn.reset": "Reset to Random",
  "btn.save": "Save",
  "btn.cancel": "Cancel",

  // Settings
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.cs2Path": "CS2 Installation Path",
  "settings.cs2PathHint": "Path to game/csgo directory",
  "settings.browse": "Browse...",
  "settings.detect": "Auto Detect",
  "settings.deployAddons": "Deploy Addons",
  "settings.deployAddonsHint": "Copy plugin files to CS2 directory",

  // Status
  "status.applied": "Loadout applied! Changes will take effect on next spawn.",
  "status.reset": "All skins reset to random!",
  "status.saved": "Loadout saved!",
  "status.error": "Error occurred",
  "status.reloaded": "Loadout reloaded! Respawn to apply.",
  "status.deployed": "Addons deployed successfully!",
  "status.deployError": "Failed to deploy addons",

  // Common
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.close": "Close",
} as const;

export type I18nKey = keyof typeof EN;
