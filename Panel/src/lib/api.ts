import { invoke } from "@tauri-apps/api/core";

// Types matching the Rust backend
export interface StickerInfo {
  id: number;
  offsetX?: number;
  offsetY?: number;
  wear?: number;
  scale?: number;
  rotation?: number;
}

export interface KeychainInfo {
  id: number;
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  seed?: number;
}

export interface StatTrakInfo {
  enabled: boolean;
  count: number;
}

export interface Loadout {
  weaponPaints: Record<number, number>;
  weaponStickers: Record<number, StickerInfo[]>;
  weaponWears: Record<number, number>;
  weaponSeeds: Record<number, number>;
  weaponKeychains: Record<number, KeychainInfo>;
  weaponNametags: Record<number, string>;
  weaponStatTrak: Record<number, StatTrakInfo>;
  knifeIndex: number;
  knifePaint: number;
  knifeWear: number;
  knifeSeed: number;
  gloveIndexCt: number;
  glovePaintCt: number;
  gloveWearCt: number;
  gloveSeedCt: number;
  gloveDefIndexCt: number;
  gloveIndexT: number;
  glovePaintT: number;
  gloveWearT: number;
  gloveSeedT: number;
  gloveDefIndexT: number;
  agentModelCt: number;
  agentModelT: number;
  agentModelPathCt: string;
  agentModelPathT: string;
  musicKit: number;
  useRandom: boolean;
}

export interface AppConfig {
  language: string | null;
  cs2Path: string | null;
}

export interface PluginCheckResult {
  allPresent: boolean;
  missingFiles: string[];
  versionMismatch: boolean;
  deployedVersion: string | null;
  panelVersion: string;
  counterstrikesharpInstalled: boolean;
}

export const api = {
  getConfig: () => invoke<AppConfig>("get_config"),
  saveConfig: (config: AppConfig) => invoke<void>("save_config", { config }),
  saveLoadout: (slot: number, loadout: Loadout) =>
    invoke<void>("save_loadout", { slot, loadout }),
  loadLoadout: (slot: number) =>
    invoke<Loadout | null>("load_loadout", { slot }),
  detectCs2Path: () => invoke<string | null>("detect_cs2_path"),
  checkPluginFiles: () => invoke<PluginCheckResult>("check_plugin_files"),
  deployAddons: () => invoke<string>("deploy_addons"),
};
