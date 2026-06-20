use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Loadout {
    #[serde(rename = "weaponPaints")]
    pub weapon_paints: std::collections::HashMap<u16, i32>,
    #[serde(rename = "knifeIndex")]
    pub knife_index: i32,
    #[serde(rename = "knifePaint")]
    pub knife_paint: i32,
    #[serde(rename = "gloveIndex")]
    pub glove_index: i32,
    #[serde(rename = "glovePaint")]
    pub glove_paint: i32,
    #[serde(rename = "agentModel")]
    pub agent_model: i32,
    #[serde(rename = "musicKit")]
    pub music_kit: i32,
    #[serde(rename = "useRandom")]
    pub use_random: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub language: Option<String>,
    #[serde(rename = "cs2Path")]
    pub cs2_path: Option<String>,
}

fn get_config_path() -> PathBuf {
    let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("CS2-Skin-Mod");
    fs::create_dir_all(&path).ok();
    path.push("config.json");
    path
}

fn get_loadout_path_from_config() -> Option<PathBuf> {
    let config_path = get_config_path();
    if !config_path.exists() {
        return None;
    }
    let data = fs::read_to_string(&config_path).ok()?;
    let config: AppConfig = serde_json::from_str(&data).ok()?;
    let cs2_path = config.cs2_path?;
    let mut path = PathBuf::from(cs2_path);
    path.push("addons");
    path.push("counterstrikesharp");
    path.push("plugins");
    path.push("PlayerSkinMod");
    path.push("player_loadout.json");
    Some(path)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to CS2 Skin Mod.", name)
}

#[tauri::command]
fn get_config() -> Result<AppConfig, String> {
    let path = get_config_path();
    if !path.exists() {
        return Ok(AppConfig {
            language: Some("english".to_string()),
            cs2_path: None,
        });
    }
    let data = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let config: AppConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
fn save_config(config: AppConfig) -> Result<(), String> {
    let path = get_config_path();
    let data = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_loadout(slot: u32, loadout: Loadout) -> Result<(), String> {
    let loadout_path = get_loadout_path_from_config()
        .ok_or_else(|| "CS2 path not configured. Please set it in Settings.".to_string())?;

    // Read existing loadouts or create new map
    let mut loadouts: std::collections::HashMap<u32, Loadout> = if loadout_path.exists() {
        let data = fs::read_to_string(&loadout_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        std::collections::HashMap::new()
    };

    loadouts.insert(slot, loadout);

    // Ensure the directory exists
    if let Some(parent) = loadout_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let data = serde_json::to_string_pretty(&loadouts).map_err(|e| e.to_string())?;
    fs::write(&loadout_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_loadout(slot: u32) -> Result<Option<Loadout>, String> {
    let loadout_path = match get_loadout_path_from_config() {
        Some(p) => p,
        None => return Ok(None),
    };

    if !loadout_path.exists() {
        return Ok(None);
    }

    let data = fs::read_to_string(&loadout_path).map_err(|e| e.to_string())?;
    let loadouts: std::collections::HashMap<u32, Loadout> =
        serde_json::from_str(&data).map_err(|e| e.to_string())?;
    Ok(loadouts.get(&slot).cloned())
}

#[tauri::command]
fn detect_cs2_path() -> Result<Option<String>, String> {
    // Common CS2 installation paths
    let candidates = if cfg!(target_os = "windows") {
        vec![
            "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo",
            "D:\\Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo",
            "D:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo",
            "E:\\SteamLibrary\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo",
        ]
    } else {
        vec![
            "/home/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/csgo",
            "~/.steam/steam/steamapps/common/Counter-Strike Global Offensive/game/csgo",
            "~/.local/share/Steam/steamapps/common/Counter-Strike Global Offensive/game/csgo",
        ]
    };

    for path in &candidates {
        let expanded = if path.starts_with('~') {
            if let Some(home) = dirs::home_dir() {
                home.join(&path[2..])
            } else {
                continue;
            }
        } else {
            PathBuf::from(path)
        };

        if expanded.exists() {
            return Ok(Some(expanded.to_string_lossy().to_string()));
        }
    }

    Ok(None)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_config,
            save_config,
            save_loadout,
            load_loadout,
            detect_cs2_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
