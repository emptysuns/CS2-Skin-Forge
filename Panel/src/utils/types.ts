export interface StickerInfo {
  id: number;
  offsetX?: number;
  offsetY?: number;
  wear?: number;
  scale?: number;
  rotation?: number;
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
  knifeIndex: number;
  knifePaint: number;
  knifeWear: number;
  knifeSeed: number;
  gloveIndex: number;
  glovePaint: number;
  gloveWear: number;
  gloveSeed: number;
  agentModelCt: number;
  agentModelT: number;
  musicKit: number;
  useRandom: boolean;
}
