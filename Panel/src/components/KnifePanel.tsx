import { useState } from 'react';
import { Loadout } from '../utils/types';
import { knives } from '../data/knives';
import { knifePaints } from '../data/skins';
import { useT } from '../i18n';

interface KnifePanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function KnifePanel({ loadout, updateLoadout }: KnifePanelProps) {
  const { t } = useT();
  const [selectedKnife, setSelectedKnife] = useState<number | null>(
    loadout.knifeIndex >= 0 ? loadout.knifeIndex : null
  );

  const handleKnifeSelect = (index: number) => {
    setSelectedKnife(index);
    updateLoadout({
      knifeIndex: index,
      knifePaint: loadout.knifePaint >= 0 ? loadout.knifePaint : -1,
      useRandom: false,
    });
  };

  const handlePaintSelect = (paintId: number) => {
    updateLoadout({ knifePaint: paintId, useRandom: false });
  };

  const handleRandom = () => {
    setSelectedKnife(null);
    updateLoadout({ knifeIndex: -1, knifePaint: -1, useRandom: true });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${loadout.knifeIndex === -1
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
            : 'hover:border-gray-500'
          }
        `}
      >
        <div className="text-sm font-semibold text-white">🎲 {t("preview.random")}</div>
        <div className="text-xs text-gray-400 mt-0.5">{t("knife.selectType")}</div>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {knives.map((knife, index) => (
          <button
            key={knife.defindex}
            onClick={() => handleKnifeSelect(index)}
            className={`
              card p-3 text-center transition-all duration-200
              ${selectedKnife === index
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
                : 'hover:border-gray-500'
              }
            `}
          >
            <div className="text-2xl mb-1">🔪</div>
            <div className="text-xs font-semibold text-white">{knife.name}</div>
          </button>
        ))}
      </div>

      {selectedKnife !== null && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">
            {knives[selectedKnife].name} - {t("knife.selectPaint")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {knifePaints.map(paint => (
              <button
                key={paint.id}
                onClick={() => handlePaintSelect(paint.id)}
                className={`
                  p-2 rounded-md text-xs font-medium transition-all duration-200
                  ${loadout.knifePaint === paint.id
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
    </div>
  );
}
