import { useState, useMemo, useEffect } from 'react';
import { Loadout } from '../utils/types';
import { weapons, weaponCategories, getWeaponsByCategory } from '../data/weapons';
import { weaponPaints } from '../data/skins';
import { allStickers, getStickerImageUrl } from '../data/stickers';
import { allKeychains, getKeychainImageUrl } from '../data/keychains';
import { getWeaponDefaultImage } from '../data/weaponImages';
import { useT } from '../i18n';

interface WeaponPanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function WeaponPanel({ loadout, updateLoadout }: WeaponPanelProps) {
  const { t, lang } = useT();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWeapon, setSelectedWeapon] = useState<number | null>(null);
  const [activeStickerSlot, setActiveStickerSlot] = useState(0);
  const [stickerSearch, setStickerSearch] = useState('');
  const [stickerLimit, setStickerLimit] = useState(100);
  const [keychainSearch, setKeychainSearch] = useState('');
  const [keychainLimit, setKeychainLimit] = useState(100);

  const filteredWeapons = getWeaponsByCategory(selectedCategory);
  const isChinese = lang === 'schinese' || lang === 'tchinese';

  const translateStickerName = (name: string): string => {
    if (!isChinese) return name;
    return name
      .replace(/\(Holo\)/g, '(全息)')
      .replace(/\(Foil\)/g, '(箔金)')
      .replace(/\(Gold\)/g, '(金色)')
      .replace(/\(Glitter\)/g, '(闪亮)')
      .replace(/\(Paper\)/g, '(纸贴)')
      .replace(/\(Lenticular\)/g, '(光栅)');
  };

  const getDisplayName = (weapon: { name: string; nameZh: string }) => {
    return isChinese ? weapon.nameZh : weapon.name;
  };

  const handlePaintSelect = (defindex: number, paintId: number) => {
    updateLoadout({
      weaponPaints: { ...loadout.weaponPaints, [defindex]: paintId },
      useRandom: false,
    });
  };

  const clearWeaponPaint = (defindex: number) => {
    const newPaints = { ...loadout.weaponPaints };
    delete newPaints[defindex];
    const newStickers = { ...loadout.weaponStickers };
    delete newStickers[defindex];
    const newWears = { ...loadout.weaponWears };
    delete newWears[defindex];
    const newSeeds = { ...loadout.weaponSeeds };
    delete newSeeds[defindex];
    const newKeychains = { ...loadout.weaponKeychains };
    delete newKeychains[defindex];
    const newNametags = { ...loadout.weaponNametags };
    delete newNametags[defindex];
    const newStatTrak = { ...loadout.weaponStatTrak };
    delete newStatTrak[defindex];
    updateLoadout({
      weaponPaints: newPaints,
      weaponStickers: newStickers,
      weaponWears: newWears,
      weaponSeeds: newSeeds,
      weaponKeychains: newKeychains,
      weaponNametags: newNametags,
      weaponStatTrak: newStatTrak,
      useRandom: Object.keys(newPaints).length === 0,
    });
  };

  const handleStickerSelect = (defindex: number, stickerId: number) => {
    const existing = loadout.weaponStickers[defindex] ? [...loadout.weaponStickers[defindex]] : [{ id: 0 }, { id: 0 }, { id: 0 }, { id: 0 }, { id: 0 }];
    existing[activeStickerSlot] = { id: stickerId, scale: 1, wear: 0, rotation: 0, offsetX: 0, offsetY: 0 };
    updateLoadout({
      weaponStickers: { ...loadout.weaponStickers, [defindex]: existing },
    });
  };

  const clearStickerSlot = (defindex: number, slot: number) => {
    const existing = loadout.weaponStickers[defindex] ? [...loadout.weaponStickers[defindex]] : [{ id: 0 }, { id: 0 }, { id: 0 }, { id: 0 }, { id: 0 }];
    existing[slot] = { id: 0 };
    updateLoadout({
      weaponStickers: { ...loadout.weaponStickers, [defindex]: existing },
    });
  };

  const handleWearChange = (defindex: number, wear: number) => {
    updateLoadout({
      weaponWears: { ...loadout.weaponWears, [defindex]: wear },
    });
  };

  const handleSeedChange = (defindex: number, seed: number) => {
    updateLoadout({
      weaponSeeds: { ...loadout.weaponSeeds, [defindex]: seed },
    });
  };

  // Keychain handlers
  const handleKeychainSelect = (defindex: number, keychainId: number) => {
    const existing = loadout.weaponKeychains[defindex] || { id: 0, offsetX: 0, offsetY: 0, offsetZ: 0, seed: 0 };
    updateLoadout({
      weaponKeychains: { ...loadout.weaponKeychains, [defindex]: { ...existing, id: keychainId } },
    });
  };

  const clearKeychain = (defindex: number) => {
    const newKeychains = { ...loadout.weaponKeychains };
    delete newKeychains[defindex];
    updateLoadout({ weaponKeychains: newKeychains });
  };

  // Nametag handlers
  const handleNametagChange = (defindex: number, name: string) => {
    const newNametags = { ...loadout.weaponNametags };
    if (name.trim() === '') {
      delete newNametags[defindex];
    } else {
      newNametags[defindex] = name;
    }
    updateLoadout({ weaponNametags: newNametags });
  };

  // StatTrak handlers
  const handleStatTrakToggle = (defindex: number) => {
    const existing = loadout.weaponStatTrak[defindex] || { enabled: false, count: 0 };
    const newStatTrak = { ...loadout.weaponStatTrak };
    if (existing.enabled) {
      delete newStatTrak[defindex];
    } else {
      newStatTrak[defindex] = { enabled: true, count: 0 };
    }
    updateLoadout({ weaponStatTrak: newStatTrak });
  };

  const handleStatTrakCountChange = (defindex: number, count: number) => {
    const existing = loadout.weaponStatTrak[defindex] || { enabled: true, count: 0 };
    updateLoadout({
      weaponStatTrak: { ...loadout.weaponStatTrak, [defindex]: { ...existing, count } },
    });
  };

  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      'All': 'weapon.all', 'Pistols': 'weapon.pistols', 'Rifles': 'weapon.rifles',
      'Snipers': 'weapon.snipers', 'SMGs': 'weapon.smgs', 'Heavy': 'weapon.heavy',
    };
    return t(keyMap[category] as any) || category;
  };

  // Filter stickers based on search
  const allFilteredStickers = useMemo(() => {
    let filtered = allStickers;
    if (stickerSearch.trim()) {
      const query = stickerSearch.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [stickerSearch]);

  // Filter keychains based on search
  const allFilteredKeychains = useMemo(() => {
    let filtered = allKeychains;
    if (keychainSearch.trim()) {
      const query = keychainSearch.toLowerCase();
      filtered = filtered.filter(k => k.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [keychainSearch]);

  // Reset limits when search changes
  useEffect(() => {
    setStickerLimit(100);
  }, [stickerSearch]);

  useEffect(() => {
    setKeychainLimit(100);
  }, [keychainSearch]);

  const filteredStickers = useMemo(() => {
    return allFilteredStickers.slice(0, stickerLimit);
  }, [allFilteredStickers, stickerLimit]);

  const filteredKeychains = useMemo(() => {
    return allFilteredKeychains.slice(0, keychainLimit);
  }, [allFilteredKeychains, keychainLimit]);

  const wearLabels = ['FN', 'MW', 'FT', 'WW', 'BS'];
  const wearValues = [0.01, 0.07, 0.15, 0.38, 0.45];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {weaponCategories.map(category => (
          <button key={category} onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              selectedCategory === category ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}>
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredWeapons.map(weapon => {
          const hasCustomPaint = loadout.weaponPaints[weapon.defindex] !== undefined;
          const isSelected = selectedWeapon === weapon.defindex;
          return (
            <button key={weapon.defindex} onClick={() => setSelectedWeapon(isSelected ? null : weapon.defindex)}
              className={`card p-2 text-left transition-all duration-200 cursor-pointer overflow-hidden
                ${isSelected ? 'ring-2 ring-amber-500 border-amber-500' : ''}
                ${hasCustomPaint ? 'border-l-2 border-l-green-500' : ''}`}>
              <img src={getWeaponDefaultImage(weapon.defindex)} alt={weapon.name}
                className="w-full h-12 object-contain mb-1 opacity-90"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="text-xs font-semibold text-white truncate">{getDisplayName(weapon)}</div>
              {hasCustomPaint && <div className="text-xs text-green-400 mt-0.5">✓ {t("preview.custom")}</div>}
            </button>
          );
        })}
      </div>

      {selectedWeapon && weaponPaints[selectedWeapon] && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              {getDisplayName(weapons.find(w => w.defindex === selectedWeapon)!)} - {t("weapon.selectPaint")}
            </h3>
            {loadout.weaponPaints[selectedWeapon] !== undefined && (
              <button onClick={() => clearWeaponPaint(selectedWeapon)} className="text-xs text-red-400 hover:text-red-300">
                {t("btn.reset")}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {weaponPaints[selectedWeapon].map(paint => (
              <button key={paint.id} onClick={() => handlePaintSelect(selectedWeapon, paint.id)}
                className={`flex flex-col items-center p-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  loadout.weaponPaints[selectedWeapon] === paint.id
                    ? 'bg-amber-600 text-white ring-1 ring-amber-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                {paint.image && (
                  <img src={paint.image} alt={paint.name}
                    className="w-full h-12 object-contain mb-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="truncate w-full text-center">{paint.name}</span>
              </button>
            ))}
          </div>

          {/* Wear & Seed controls */}
          {loadout.weaponPaints[selectedWeapon] !== undefined && (
            <div className="mt-4 border-t border-gray-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-300 mb-2">{t("weapon.settings")}</h4>
              <div className="space-y-3 p-2 bg-gray-800 rounded-lg">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    {t("weapon.wear")} ({wearLabels[wearValues.findIndex(v => Math.abs(v - (loadout.weaponWears[selectedWeapon] ?? 0.01)) < 0.02)] || 'Custom'})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={loadout.weaponWears[selectedWeapon] ?? 0.01}
                      onChange={(e) => handleWearChange(selectedWeapon, parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs text-gray-300 w-12 text-right">{(loadout.weaponWears[selectedWeapon] ?? 0.01).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    {wearValues.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => handleWearChange(selectedWeapon, v)}
                        className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                          Math.abs((loadout.weaponWears[selectedWeapon] ?? 0.01) - v) < 0.02
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {wearLabels[i]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    {t("weapon.seed")} (0 = random)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="1"
                      value={loadout.weaponSeeds[selectedWeapon] ?? 0}
                      onChange={(e) => handleSeedChange(selectedWeapon, parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs text-gray-300 w-10 text-right">{loadout.weaponSeeds[selectedWeapon] ?? 0}</span>
                  </div>
                </div>

                {/* Nametag */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">{t("weapon.nametag")}</label>
                  <input
                    type="text"
                    placeholder={t("weapon.nametagPlaceholder")}
                    value={loadout.weaponNametags[selectedWeapon] ?? ''}
                    onChange={(e) => handleNametagChange(selectedWeapon, e.target.value)}
                    maxLength={64}
                    className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* StatTrak */}
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">{t("weapon.stattrak")}</label>
                  <button
                    onClick={() => handleStatTrakToggle(selectedWeapon)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      loadout.weaponStatTrak[selectedWeapon]?.enabled
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {loadout.weaponStatTrak[selectedWeapon]?.enabled ? 'ON' : 'OFF'}
                  </button>
                </div>
                {loadout.weaponStatTrak[selectedWeapon]?.enabled && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">{t("weapon.stattrakCount")}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="999999"
                        value={loadout.weaponStatTrak[selectedWeapon]?.count ?? 0}
                        onChange={(e) => handleStatTrakCountChange(selectedWeapon, parseInt(e.target.value) || 0)}
                        className="w-24 bg-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sticker Section */}
          <div className="mt-4 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">Stickers</h4>
            <div className="flex gap-1.5 mb-2">
              {[0,1,2,3,4].map(slot => {
                const stickers = loadout.weaponStickers[selectedWeapon] || [];
                const hasSticker = stickers[slot]?.id > 0;
                return (
                  <button key={slot} onClick={() => setActiveStickerSlot(slot)}
                    className={`relative px-2 py-1 rounded text-xs transition-all ${
                      activeStickerSlot === slot ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}>
                    Slot {slot + 1}
                    {hasSticker && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />}
                  </button>
                );
              })}
            </div>

            {/* Current sticker in slot */}
            {(() => {
              const stickers = loadout.weaponStickers[selectedWeapon] || [];
              const current = stickers[activeStickerSlot];
              if (current?.id > 0) {
                const stickerData = allStickers.find(s => s.id === current.id);
                return (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800 rounded">
                    <img src={getStickerImageUrl(stickerData?.image || `econ/stickers/community01`)}
                      alt={stickerData?.name || 'Sticker'} className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span className="text-xs text-white">{translateStickerName(stickerData?.name || `Sticker #${current.id}`)}</span>
                    <button onClick={() => clearStickerSlot(selectedWeapon, activeStickerSlot)}
                      className="ml-auto text-xs text-red-400 hover:text-red-300">✕</button>
                  </div>
                );
              }
              return <p className="text-xs text-gray-500 mb-2">Empty slot</p>;
            })()}

            {/* Sticker search */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={t("weapon.stickerSearch")}
                value={stickerSearch}
                onChange={(e) => setStickerSearch(e.target.value)}
                className="flex-1 bg-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Sticker grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
              {filteredStickers.map(sticker => (
                <button key={sticker.id} onClick={() => handleStickerSelect(selectedWeapon, sticker.id)}
                  className="flex flex-col items-center p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-all"
                  title={sticker.name}>
                  <img src={getStickerImageUrl(sticker.image)} alt={sticker.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center mt-0.5">{translateStickerName(sticker.name.split(' - ').pop() || sticker.name)}</span>
                </button>
              ))}
              {filteredStickers.length === 0 && (
                <div className="col-span-full text-center text-xs text-gray-500 py-2">
                  No stickers found
                </div>
              )}
            </div>
            {allFilteredStickers.length > stickerLimit && (
              <button
                onClick={() => setStickerLimit(prev => prev + 100)}
                className="w-full mt-2 py-1.5 text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-all"
              >
                Load More ({filteredStickers.length} / {allFilteredStickers.length})
              </button>
            )}
            {!stickerSearch && allFilteredStickers.length > 100 && (
              <p className="text-[10px] text-gray-600 mt-1">
                {`Showing ${filteredStickers.length} of ${allFilteredStickers.length} stickers - use search to find specific stickers`}
              </p>
            )}
          </div>

          {/* Keychain Section */}
          <div className="mt-4 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">{t("weapon.keychain")}</h4>
            
            {/* Current keychain */}
            {(() => {
              const current = loadout.weaponKeychains[selectedWeapon];
              if (current?.id > 0) {
                const keychainData = allKeychains.find(k => k.id === current.id);
                return (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800 rounded">
                    <img src={getKeychainImageUrl(keychainData?.image || '')}
                      alt={keychainData?.name || 'Keychain'} className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span className="text-xs text-white">{keychainData?.name || `Keychain #${current.id}`}</span>
                    <button onClick={() => clearKeychain(selectedWeapon)}
                      className="ml-auto text-xs text-red-400 hover:text-red-300">✕</button>
                  </div>
                );
              }
              return <p className="text-xs text-gray-500 mb-2">No keychain equipped</p>;
            })()}

            {/* Keychain search */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={t("weapon.keychainSearch")}
                value={keychainSearch}
                onChange={(e) => setKeychainSearch(e.target.value)}
                className="flex-1 bg-gray-700 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Keychain grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
              {filteredKeychains.map(keychain => (
                <button key={keychain.id} onClick={() => handleKeychainSelect(selectedWeapon, keychain.id)}
                  className={`flex flex-col items-center p-1.5 rounded transition-all ${
                    loadout.weaponKeychains[selectedWeapon]?.id === keychain.id
                      ? 'bg-amber-600 ring-1 ring-amber-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={keychain.name}>
                  <img src={getKeychainImageUrl(keychain.image)} alt={keychain.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center mt-0.5">{keychain.name.split(' | ').pop() || keychain.name}</span>
                </button>
              ))}
              {filteredKeychains.length === 0 && (
                <div className="col-span-full text-center text-xs text-gray-500 py-2">
                  No keychains found
                </div>
              )}
            </div>
            {allFilteredKeychains.length > keychainLimit && (
              <button
                onClick={() => setKeychainLimit(prev => prev + 100)}
                className="w-full mt-2 py-1.5 text-xs text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-all"
              >
                Load More ({filteredKeychains.length} / {allFilteredKeychains.length})
              </button>
            )}
          </div>
        </div>
      )}

      {selectedWeapon && !weaponPaints[selectedWeapon] && (
        <div className="card text-center py-6">
          <p className="text-sm text-gray-400">{t("weapon.noPaint")}</p>
        </div>
      )}
    </div>
  );
}
