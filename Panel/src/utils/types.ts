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

export interface WeaponConfig {
  paint: number;
  stickers?: StickerInfo[];
  wear?: number;
  seed?: number;
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
  gloveIndexT: number;
  glovePaintT: number;
  gloveWearT: number;
  gloveSeedT: number;
  agentModelCt: number;
  agentModelT: number;
  musicKit: number;
  useRandom: boolean;
}
