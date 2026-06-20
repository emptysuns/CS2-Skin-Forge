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
  knifeIndex: number;
  knifePaint: number;
  gloveIndex: number;
  glovePaint: number;
  agentModel: number;
  musicKit: number;
  useRandom: boolean;
}
