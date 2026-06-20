import { useState } from 'react';
import { Loadout } from '../utils/types';
import { weapons, weaponCategories, getWeaponsByCategory } from '../data/weapons';
import { weaponPaints } from '../data/skins';
import { useT } from '../i18n';

interface WeaponPanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function WeaponPanel({ loadout, updateLoadout }: WeaponPanelProps) {
  const { t } = useT();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWeapon, setSelectedWeapon] = useState<number | null>(null);

  const filteredWeapons = getWeaponsByCategory(selectedCategory);

  const handlePaintSelect = (defindex: number, paintId: number) => {
    updateLoadout({
      weaponPaints: { ...loadout.weaponPaints, [defindex]: paintId },
      useRandom: false,
    });
  };

  const clearWeaponPaint = (defindex: number) => {
    const newPaints = { ...loadout.weaponPaints };
    delete newPaints[defindex];
    updateLoadout({
      weaponPaints: newPaints,
      useRandom: Object.keys(newPaints).length === 0,
    });
  };

  // Translate category names
  const getCategoryLabel = (category: string) => {
    const keyMap: Record<string, string> = {
      'All': 'weapon.all',
      'Pistols': 'weapon.pistols',
      'Rifles': 'weapon.rifles',
      'Snipers': 'weapon.snipers',
      'SMGs': 'weapon.smgs',
      'Heavy': 'weapon.heavy',
    };
    return t(keyMap[category] as any) || category;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {weaponCategories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-amber-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredWeapons.map(weapon => {
          const hasCustomPaint = loadout.weaponPaints[weapon.defindex] !== undefined;
          const isSelected = selectedWeapon === weapon.defindex;

          return (
            <button
              key={weapon.defindex}
              onClick={() => setSelectedWeapon(isSelected ? null : weapon.defindex)}
              className={`
                card p-2.5 text-left transition-all duration-200 cursor-pointer
                ${isSelected ? 'ring-2 ring-amber-500 border-amber-500' : ''}
                ${hasCustomPaint ? 'border-l-2 border-l-green-500' : ''}
              `}
            >
              <div className="text-xs font-semibold text-white truncate">{weapon.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{weapon.category}</div>
              {hasCustomPaint && (
                <div className="text-xs text-green-400 mt-1">✓ {t("preview.custom")}</div>
              )}
            </button>
          );
        })}
      </div>

      {selectedWeapon && weaponPaints[selectedWeapon] && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              {weapons.find(w => w.defindex === selectedWeapon)?.name} - {t("weapon.selectPaint")}
            </h3>
            {loadout.weaponPaints[selectedWeapon] !== undefined && (
              <button
                onClick={() => clearWeaponPaint(selectedWeapon)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                {t("btn.reset")}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {weaponPaints[selectedWeapon].map(paint => (
              <button
                key={paint.id}
                onClick={() => handlePaintSelect(selectedWeapon, paint.id)}
                className={`
                  p-2 rounded-md text-xs font-medium transition-all duration-200 truncate
                  ${loadout.weaponPaints[selectedWeapon] === paint.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                {paint.name}
              </button>
            ))}
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
