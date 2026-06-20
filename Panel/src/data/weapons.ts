export interface Weapon {
  defindex: number;
  name: string;
  category: string;
}

export function getWeaponImageUrl(defindex: number): string {
  // Map defindex to weapon code name for Steam CDN
  const weaponNames: Record<number, string> = {
    1: 'weapon_deagle', 2: 'weapon_elite', 3: 'weapon_fiveseven', 4: 'weapon_glock',
    7: 'weapon_ak47', 8: 'weapon_aug', 9: 'weapon_awp', 10: 'weapon_famas',
    11: 'weapon_g3sg1', 13: 'weapon_galilar', 14: 'weapon_m249', 16: 'weapon_m4a1',
    17: 'weapon_mac10', 19: 'weapon_p90', 23: 'weapon_mp5sd', 24: 'weapon_ump45',
    25: 'weapon_negev', 26: 'weapon_bizon', 27: 'weapon_mag7', 28: 'weapon_nova',
    29: 'weapon_sawedoff', 30: 'weapon_tec9', 32: 'weapon_hkp2000', 33: 'weapon_mp7',
    34: 'weapon_mp9', 35: 'weapon_xm1014', 36: 'weapon_p250', 38: 'weapon_scar20',
    39: 'weapon_sg556', 40: 'weapon_ssg08', 60: 'weapon_m4a1_silencer',
    61: 'weapon_usp_silencer', 63: 'weapon_cz75_auto', 64: 'weapon_revolver',
  };
  return `https://cdn.steamstatic.com/apps/730/icons/econ/default_generated/${weaponNames[defindex] || 'weapon_ak47'}_light_large.png`;
}

export const weapons: Weapon[] = [
  { defindex: 1, name: 'Desert Eagle', category: 'Pistols' },
  { defindex: 2, name: 'Dual Berettas', category: 'Pistols' },
  { defindex: 3, name: 'Five-SeveN', category: 'Pistols' },
  { defindex: 4, name: 'Glock-18', category: 'Pistols' },
  { defindex: 30, name: 'Tec-9', category: 'Pistols' },
  { defindex: 32, name: 'P2000', category: 'Pistols' },
  { defindex: 36, name: 'P250', category: 'Pistols' },
  { defindex: 61, name: 'USP-S', category: 'Pistols' },
  { defindex: 63, name: 'CZ75-Auto', category: 'Pistols' },
  { defindex: 64, name: 'R8 Revolver', category: 'Pistols' },
  { defindex: 7, name: 'AK-47', category: 'Rifles' },
  { defindex: 8, name: 'AUG', category: 'Rifles' },
  { defindex: 10, name: 'FAMAS', category: 'Rifles' },
  { defindex: 13, name: 'Galil AR', category: 'Rifles' },
  { defindex: 16, name: 'M4A4', category: 'Rifles' },
  { defindex: 60, name: 'M4A1-S', category: 'Rifles' },
  { defindex: 39, name: 'SG 553', category: 'Rifles' },
  { defindex: 40, name: 'SSG 08', category: 'Rifles' },
  { defindex: 9, name: 'AWP', category: 'Snipers' },
  { defindex: 11, name: 'G3SG1', category: 'Snipers' },
  { defindex: 38, name: 'SCAR-20', category: 'Snipers' },
  { defindex: 17, name: 'MAC-10', category: 'SMGs' },
  { defindex: 19, name: 'P90', category: 'SMGs' },
  { defindex: 23, name: 'MP5-SD', category: 'SMGs' },
  { defindex: 24, name: 'UMP-45', category: 'SMGs' },
  { defindex: 26, name: 'PP-Bizon', category: 'SMGs' },
  { defindex: 33, name: 'MP7', category: 'SMGs' },
  { defindex: 34, name: 'MP9', category: 'SMGs' },
  { defindex: 14, name: 'M249', category: 'Heavy' },
  { defindex: 25, name: 'Negev', category: 'Heavy' },
  { defindex: 27, name: 'MAG-7', category: 'Heavy' },
  { defindex: 28, name: 'Nova', category: 'Heavy' },
  { defindex: 29, name: 'Sawed-Off', category: 'Heavy' },
  { defindex: 35, name: 'XM1014', category: 'Heavy' },
];

export const weaponCategories = ['All', 'Pistols', 'Rifles', 'Snipers', 'SMGs', 'Heavy'];

export function getWeaponsByCategory(category: string): Weapon[] {
  if (category === 'All') return weapons;
  return weapons.filter(w => w.category === category);
}
