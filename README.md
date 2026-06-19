# CS2 Skin Mod

A local-only skin customization plugin for Counter-Strike 2 that allows players to customize weapon skins, knives, gloves, agent models, and music kits.

**[中文文档 / Chinese Documentation](README_CN.md)**

## ⚠️ VAC Risk Warning

**IMPORTANT: This plugin modifies CS2 game files and requires the `-insecure` launch option.**

While this plugin:
- Only modifies local client-side rendering
- Does not affect real Steam inventory
- Is designed for offline/local play only

**Using any third-party software with CS2 carries inherent risk.** Valve's anti-cheat system (VAC) may flag modified game files. The authors are **NOT responsible** for any VAC bans or account restrictions that may occur.

**Use at your own risk.**

## Features

- 🔫 **Weapon Skins**: Customize skins for 30+ weapons
- 🔪 **Knives**: Choose from 20 knife types with 28 skin options
- 🧤 **Gloves**: 8 glove types with multiple skin variants
- 👤 **Agent Models**: 35 CT + 44 T agent models
- 🎵 **Music Kits**: 18+ music kits to choose from
- 🎲 **Random Mode**: Randomize all skins on each spawn
- 🎨 **Custom Mode**: Mix and match specific skins
- 🖥️ **Desktop Panel**: Native Tauri application for easy customization

## Installation

### Prerequisites

1. Counter-Strike 2 installed
2. CounterStrikeSharp installed on your CS2 server/client

### Step 1: Download

Download the latest release for your platform:
- Windows: `CS2.Skin.Mod_x.x.x_x64-setup.exe`
- Linux: `cs2-skin-mod-panel_x.x.x_amd64.AppImage`
- macOS: `CS2 Skin Mod.app.tar.gz`

### Step 2: Install Plugin Files

Copy the `addons` folder from the release to your CS2 game directory:
```
<CS2 Install Path>/game/csgo/addons/
```

### Step 3: Configure CS2 Launch Options

1. Open Steam
2. Right-click on Counter-Strike 2
3. Select "Properties"
4. In "Launch Options", add: `-insecure`

**⚠️ Warning: This will prevent you from playing on VAC-secured servers.**

### Step 4: Run the Panel

Launch the CS2 Skin Mod Panel application.

## Usage

### Starting a Local Match

1. Launch CS2 with `-insecure` option
2. Start a local match (Offline with Bots or Workshop map)
3. Open the CS2 Skin Mod Panel
4. Customize your loadout:
   - **Weapons**: Select weapons and choose skins
   - **Knives**: Choose knife type and skin
   - **Gloves**: Select glove type and skin
   - **Agents**: Pick CT or T agent model
   - **Music**: Choose your MVP music kit
5. Click "Apply Loadout"
6. Respawn in-game to see changes

### In-Game Commands

| Command | Description |
|---------|-------------|
| `skin_menu` | Show panel connection info |
| `skin_random` | Enable random skin mode |
| `skin_reset` | Reset all skins to default |

### How It Works

The plugin uses CounterStrikeSharp to hook into CS2's weapon system:
- Intercepts `GiveNamedItem` calls to apply skins when weapons are given
- Modifies `FallbackPaintKit`, `FallbackSeed`, and `FallbackWear` attributes
- Changes knife models via `ChangeSubclass` input
- Replaces agent models on player spawn

All changes are **client-side only** and do not affect other players or the server.

## Building from Source

### Prerequisites

- Node.js 18+
- Rust toolchain
- Tauri CLI

### Build Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/CS2-Skin-local-mod.git
cd CS2-Skin-local-mod

# Install frontend dependencies
cd Panel
npm install

# Build the Tauri app
npm run tauri build
```

## Troubleshooting

### Skins not showing

1. Verify `-insecure` is in launch options
2. Ensure CounterStrikeSharp is installed
3. Respawn after applying changes
4. Check server console for errors

### Panel not connecting

1. Make sure you're in a local match
2. Check if the plugin is loaded (server console)
3. Try restarting the panel

### Game crashes

1. Verify game files integrity
2. Remove conflicting plugins
3. Check CS2 console for errors

## File Structure

```
CS2-Skin-local-mod/
├── addons/
│   └── counterstrikesharp/
│       └── plugins/
│           └── PlayerSkinMod/
│               ├── PlayerSkinMod.cs      # Main plugin
│               ├── PlayerSkinMod.csproj  # C# project
│               └── skins_en.json         # Skin data
├── Panel/
│   ├── src/                              # React frontend
│   ├── src-tauri/                        # Tauri backend
│   └── package.json
├── .github/
│   └── workflows/
│       └── build.yml                     # CI/CD config
├── README.md                             # This file
└── README_CN.md                          # Chinese documentation
```

## Credits

- Based on [CS2-Bot-Improver](https://github.com/ed0ard/CS2-Bot-Improver) by ed0ard
- Uses [CounterStrikeSharp](https://github.com/roflmuffin/CounterStrikeSharp)
- Built with [Tauri](https://tauri.app/) + [React](https://react.dev/)

## License

GPL-3.0

## Disclaimer

This software is provided for **educational purposes only**. Use at your own risk. The authors are not responsible for:
- VAC bans or account restrictions
- Game crashes or instability
- Any other consequences of using this software

By using this software, you acknowledge that you understand the risks involved.
