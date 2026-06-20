import { useState } from 'react';
import { Loadout } from '../utils/types';
import { weapons, weaponCategories, getWeaponsByCategory, getWeaponImageUrl } from '../data/weapons';
import { weaponPaints, popularStickers, getStickerImageUrl } from '../data/skins';
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

  const filteredWeapons = getWeaponsByCategory(selectedCategory);
  const isChinese = lang === 'schinese' || lang === 'tchinese';

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
    updateLoadout({
      weaponPaints: newPaints,
      weaponStickers: newStickers,
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

  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      'All': 'weapon.all', 'Pistols': 'weapon.pistols', 'Rifles': 'weapon.rifles',
      'Snipers': 'weapon.snipers', 'SMGs': 'weapon.smgs', 'Heavy': 'weapon.heavy',
    };
    return t(keyMap[category] as any) || category;
  };

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
              <img src={getWeaponImageUrl(weapon.defindex)} alt={weapon.name}
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

          {/* Sticker Section */}
          <div className="mt-4 border-t border-gray-700 pt-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-2">🎨 Stickers</h4>
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
                const stickerData = popularStickers.find(s => s.id === current.id);
                return (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800 rounded">
                    <img src={getStickerImageUrl(stickerData?.image || 'econ/stickers/community01')}
                      alt={stickerData?.name || 'Sticker'} className="w-10 h-10 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span className="text-xs text-white">{stickerData?.name || `Sticker #${current.id}`}</span>
                    <button onClick={() => clearStickerSlot(selectedWeapon, activeStickerSlot)}
                      className="ml-auto text-xs text-red-400 hover:text-red-300">✕</button>
                  </div>
                );
              }
              return <p className="text-xs text-gray-500 mb-2">Empty slot</p>;
            })()}

            {/* Sticker grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
              {popularStickers.map(sticker => (
                <button key={sticker.id} onClick={() => handleStickerSelect(selectedWeapon, sticker.id)}
                  className="flex flex-col items-center p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-all"
                  title={sticker.name}>
                  <img src={getStickerImageUrl(sticker.image)} alt={sticker.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-[10px] text-gray-400 truncate w-full text-center mt-0.5">{sticker.name.split(' - ').pop()}</span>
                </button>
              ))}
            </div>
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
