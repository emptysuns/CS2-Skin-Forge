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

export interface Loadout {
  weaponPaints: Record<number, number>;
  weaponStickers: Record<number, StickerInfo[]>;
  knifeIndex: number;
  knifePaint: number;
  gloveIndex: number;
  glovePaint: number;
  agentModel: number;
  musicKit: number;
  useRandom: boolean;
}

export interface AppConfig {
  language: string | null;
  cs2Path: string | null;
}

export const api = {
  getConfig: () => invoke<AppConfig>("get_config"),
  saveConfig: (config: AppConfig) => invoke<void>("save_config", { config }),
  saveLoadout: (slot: number, loadout: Loadout) =>
    invoke<void>("save_loadout", { slot, loadout }),
  loadLoadout: (slot: number) =>
    invoke<Loadout | null>("load_loadout", { slot }),
  detectCs2Path: () => invoke<string | null>("detect_cs2_path"),
};
