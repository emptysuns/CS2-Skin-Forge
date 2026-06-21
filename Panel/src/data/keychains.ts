// Keychain/Charm data placeholder
// Source: CS2 keychain items - add more as needed

export interface KeychainData {
  id: number;
  name: string;
  image: string;
}

export const allKeychains: KeychainData[] = [
  // CS2 Launch Charms
  { id: 1, name: "Charm | Baby Karat T", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_bbq.717c696cf48e4d4f2e0b69d49bc8f76f0a99b10e.png" },
  { id: 2, name: "Charm | Baby Karat CT", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_bbc.01db67b60e8b22b96eb979e0a2a3a2e4bf58b1e0.png" },
  { id: 3, name: "Charm | Pin Ups", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_pinups.a7f1e93521fb67c7e0d69fc8e3a0b5f0cb2af67e.png" },
  { id: 4, name: "Charm | Hot Sauce", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_hotsauce.c66a8a30c0f05ef4a23f6e8e0f0f8d5e6b8b4c7e.png" },
  { id: 5, name: "Charm | Gold Brick", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_goldbrick.a1b2c3d4e5f6789012345678901234567890abcd.png" },
  { id: 6, name: "Charm | Where Is My Head?", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_wherehead.b2c3d4e5f6789012345678901234567890abcdef0.png" },
  { id: 7, name: "Charm | Chicken Lil", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_chickenlil.c3d4e5f6789012345678901234567890abcdef01.png" },
  { id: 8, name: "Charm | Diamond Dog", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_diamonddog.d4e5f6789012345678901234567890abcdef012.png" },
  { id: 9, name: "Charm | Die-cast AK", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_diecastak.e5f6789012345678901234567890abcdef01234.png" },
  { id: 10, name: "Charm | Lil' Monster", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_lilmonster.f6789012345678901234567890abcdef0123456.png" },
  { id: 11, name: "Charm | Pocket AWP", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_pocketawp.6789012345678901234567890abcdef01234567.png" },
  { id: 12, name: "Charm | Retro Renegade", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_retro.789012345678901234567890abcdef012345678.png" },
  { id: 13, name: "Charm | Lil' SAS", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_lilsas.89012345678901234567890abcdef0123456789.png" },
  { id: 14, name: "Charm | Lucky Cat", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_luckycat.9012345678901234567890abcdef01234567890.png" },
  { id: 15, name: "Charm | CT in Banana", image: "https://cdn.steamstatic.com/apps/730/icons/econ/charms/charm_ctbanana.012345678901234567890abcdef012345678901.png" },
];

export function getKeychainImageUrl(image: string): string {
  return image;
}
