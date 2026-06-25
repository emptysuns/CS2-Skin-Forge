use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StickerInfo {
    pub id: u32,
    #[serde(default, rename = "offsetX")]
    pub offset_x: f32,
    #[serde(default, rename = "offsetY")]
    pub offset_y: f32,
    #[serde(default)]
    pub wear: f32,
    #[serde(default = "default_scale")]
    pub scale: f32,
    #[serde(default)]
    pub rotation: f32,
}

fn default_scale() -> f32 {
    1.0
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KeychainInfo {
    pub id: u32,
    #[serde(default, rename = "offsetX")]
    pub offset_x: f32,
    #[serde(default, rename = "offsetY")]
    pub offset_y: f32,
    #[serde(default, rename = "offsetZ")]
    pub offset_z: f32,
    #[serde(default)]
    pub seed: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatTrakInfo {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default)]
    pub count: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Loadout {
    #[serde(rename = "weaponPaints")]
    pub weapon_paints: std::collections::HashMap<u16, i32>,
    #[serde(rename = "weaponStickers", default)]
    pub weapon_stickers: std::collections::HashMap<u16, Vec<StickerInfo>>,
    #[serde(rename = "weaponWears", default)]
    pub weapon_wears: std::collections::HashMap<u16, f32>,
    #[serde(rename = "weaponSeeds", default)]
    pub weapon_seeds: std::collections::HashMap<u16, i32>,
    #[serde(rename = "weaponKeychains", default)]
    pub weapon_keychains: std::collections::HashMap<u16, KeychainInfo>,
    #[serde(rename = "weaponNametags", default)]
    pub weapon_nametags: std::collections::HashMap<u16, String>,
    #[serde(rename = "weaponStatTrak", default)]
    pub weapon_stattrak: std::collections::HashMap<u16, StatTrakInfo>,
    #[serde(rename = "knifeIndex")]
    pub knife_index: i32,
    #[serde(rename = "knifePaint")]
    pub knife_paint: i32,
    #[serde(rename = "knifeWear", default = "default_wear")]
    pub knife_wear: f32,
    #[serde(rename = "knifeSeed", default)]
    pub knife_seed: i32,
    // Per-team gloves
    #[serde(rename = "gloveIndexCt", default = "default_glove")]
    pub glove_index_ct: i32,
    #[serde(rename = "glovePaintCt", default = "default_glove")]
    pub glove_paint_ct: i32,
    #[serde(rename = "gloveWearCt", default = "default_wear")]
    pub glove_wear_ct: f32,
    #[serde(rename = "gloveSeedCt", default)]
    pub glove_seed_ct: i32,
    #[serde(rename = "gloveDefIndexCt", default)]
    pub glove_defindex_ct: u16,
    #[serde(rename = "gloveIndexT", default = "default_glove")]
    pub glove_index_t: i32,
    #[serde(rename = "glovePaintT", default = "default_glove")]
    pub glove_paint_t: i32,
    #[serde(rename = "gloveWearT", default = "default_wear")]
    pub glove_wear_t: f32,
    #[serde(rename = "gloveSeedT", default)]
    pub glove_seed_t: i32,
    #[serde(rename = "gloveDefIndexT", default)]
    pub glove_defindex_t: u16,
    #[serde(rename = "agentModelCt", default = "default_agent")]
    pub agent_model_ct: i32,
    #[serde(rename = "agentModelT", default = "default_agent")]
    pub agent_model_t: i32,
    #[serde(rename = "agentModelPathCt", default)]
    pub agent_model_path_ct: String,
    #[serde(rename = "agentModelPathT", default)]
    pub agent_model_path_t: String,
    #[serde(rename = "musicKit")]
    pub music_kit: i32,
    #[serde(rename = "useRandom")]
    pub use_random: bool,
}

fn default_agent() -> i32 {
    -1
}

fn default_glove() -> i32 {
    -1
}

fn default_wear() -> f32 {
    0.01
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub language: Option<String>,
    #[serde(rename = "cs2Path")]
    pub cs2_path: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginCheckResult {
    pub all_present: bool,
    pub missing_files: Vec<String>,
    pub version_mismatch: bool,
    pub deployed_version: Option<String>,
    pub panel_version: String,
}

/// Read the CS2 path from config and return the PlayerSkinMod plugin directory.
fn get_plugin_dir_from_config() -> Result<PathBuf, String> {
    let config_path = get_config_path();
    if !config_path.exists() {
        return Err("CS2 path not configured. Please set it in Settings.".to_string());
    }
    let data = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: AppConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    let cs2_path = config
        .cs2_path
        .ok_or_else(|| "CS2 path not configured.".to_string())?;
    Ok(PathBuf::from(&cs2_path)
        .join("addons")
        .join("counterstrikesharp")
        .join("plugins")
        .join("PlayerSkinMod"))
}

const PLUGIN_FILES: &[&str] = &["PlayerSkinMod.dll", "PlayerSkinMod.json", "skins_en.json"];
const VERSION_FILE: &str = "plugin_version.txt";

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

#[tauri::command]
fn check_plugin_files() -> Result<PluginCheckResult, String> {
    let panel_version = env!("CARGO_PKG_VERSION").to_string();
    let plugin_dir = match get_plugin_dir_from_config() {
        Ok(dir) => dir,
        Err(_) => {
            return Ok(PluginCheckResult {
                all_present: false,
                missing_files: PLUGIN_FILES.iter().map(|s| s.to_string()).collect(),
                version_mismatch: false,
                deployed_version: None,
                panel_version,
            });
        }
    };

    // Check each required plugin file
    let mut missing_files: Vec<String> = Vec::new();
    for file in PLUGIN_FILES {
        let path = plugin_dir.join(file);
        if !path.exists() || fs::metadata(&path).map(|m| m.len()).unwrap_or(0) == 0 {
            missing_files.push(file.to_string());
        }
    }

    // Check version file
    let version_path = plugin_dir.join(VERSION_FILE);
    let deployed_version = if version_path.exists() {
        fs::read_to_string(&version_path)
            .ok()
            .map(|s| s.trim().to_string())
    } else {
        None
    };

    let version_mismatch = deployed_version
        .as_ref()
        .map_or(false, |v| v != &panel_version);

    Ok(PluginCheckResult {
        all_present: missing_files.is_empty() && !version_mismatch,
        missing_files,
        version_mismatch,
        deployed_version,
        panel_version,
    })
}

#[tauri::command]
fn deploy_addons() -> Result<String, String> {
    let target_dir = get_plugin_dir_from_config()?;
    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    let exe_dir = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .parent()
        .ok_or_else(|| "Cannot find resource directory".to_string())?
        .to_path_buf();

    // Possible resource locations (checked in priority order).
    // Tauri NSIS installer bundles resources under _up_/_up_/resources/
    // Tauri MSI / dev builds use resources/
    let nsis_resource_dir = exe_dir
        .join("data")
        .join("resources")
        .join("addons")
        .join("counterstrikesharp")
        .join("plugins")
        .join("PlayerSkinMod");

    let resource_subdir = exe_dir
        .join("resources")
        .join("addons")
        .join("counterstrikesharp")
        .join("plugins")
        .join("PlayerSkinMod");

    let mut deployed = Vec::new();
    let mut skipped = Vec::new();
    let mut verify_failed = Vec::new();

    for file in PLUGIN_FILES {
        // Try multiple possible resource locations (priority order)
        let src = if nsis_resource_dir.join(file).exists() {
            nsis_resource_dir.join(file)
        } else if resource_subdir.join(file).exists() {
            resource_subdir.join(file)
        } else if exe_dir.join("resources").join(file).exists() {
            exe_dir.join("resources").join(file)
        } else {
            // Next to exe itself
            exe_dir.join(file)
        };

        if src.exists() {
            let dst = target_dir.join(file);
            let src_size = fs::metadata(&src).map(|m| m.len()).unwrap_or(0);
            let dst_size = if dst.exists() {
                fs::metadata(&dst).map(|m| m.len()).unwrap_or(0)
            } else {
                0
            };
            fs::copy(&src, &dst).map_err(|e| format!("Failed to copy {}: {}", file, e))?;

            // Post-copy verification: ensure destination file exists and is not empty
            match fs::metadata(&dst) {
                Ok(meta) if meta.len() > 0 => {
                    let msg = if dst_size > 0 {
                        format!("{} ({}B -> {}B)", file, dst_size, src_size)
                    } else {
                        format!("{} ({}B, new)", file, src_size)
                    };
                    deployed.push(msg);
                }
                _ => {
                    verify_failed.push(format!(
                        "{} (copy succeeded but destination is missing/empty)",
                        file
                    ));
                }
            }
        } else {
            skipped.push(file.to_string());
        }
    }

    // Fail if nothing was deployed and no verify failures (true misdeploy)
    if deployed.is_empty() && verify_failed.is_empty() {
        return Err(format!(
            "No plugin files found to deploy. Searched: {}, {}, {}",
            nsis_resource_dir.display(),
            resource_subdir.display(),
            exe_dir.join("resources").display()
        ));
    }

    let mut result = format!(
        "Deployed [{}] to {}",
        deployed.join(", "),
        target_dir.display()
    );

    if !verify_failed.is_empty() {
        result.push_str(&format!(" | Verify-failed: [{}]", verify_failed.join(", ")));
    }
    if !skipped.is_empty() {
        result.push_str(&format!(" | Skipped (not found): [{}]", skipped.join(", ")));
        result.push_str(&format!(
            " | Searched: {}, {}, {}",
            nsis_resource_dir.display(),
            resource_subdir.display(),
            exe_dir.join("resources").display()
        ));
    }

    // Write version file so we can detect panel-plugin version mismatch
    let version = env!("CARGO_PKG_VERSION");
    let version_path = target_dir.join(VERSION_FILE);
    fs::write(&version_path, version)
        .map_err(|e| format!("Failed to write version file: {}", e))?;
    result.push_str(&format!(" | Version: {}", version));

    Ok(result)
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
            detect_cs2_path,
            check_plugin_files,
            deploy_addons
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
