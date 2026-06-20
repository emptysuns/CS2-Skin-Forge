import { useState } from 'react';
import { Loadout } from '../utils/types';
import { gloves } from '../data/skins';
import { useT } from '../i18n';

interface GlovePanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function GlovePanel({ loadout, updateLoadout }: GlovePanelProps) {
  const { t } = useT();
  const [selectedGlove, setSelectedGlove] = useState<number | null>(
    loadout.gloveIndex >= 0 ? loadout.gloveIndex : null
  );

  const handleGloveSelect = (index: number) => {
    setSelectedGlove(index);
    const glove = gloves[index];
    updateLoadout({
      gloveIndex: index,
      glovePaint: loadout.glovePaint >= 0 ? loadout.glovePaint : glove.paints[0].id,
      useRandom: false,
    });
  };

  const handlePaintSelect = (paintId: number) => {
    updateLoadout({ glovePaint: paintId, useRandom: false });
  };

  const handleRandom = () => {
    setSelectedGlove(null);
    updateLoadout({ gloveIndex: -1, glovePaint: -1, useRandom: true });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${loadout.gloveIndex === -1
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
            : 'hover:border-gray-500'
          }
        `}
      >
        <div className="text-sm font-semibold text-white">🧤 {t("preview.random")}</div>
        <div className="text-xs text-gray-400 mt-0.5">{t("glove.selectType")}</div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {gloves.map((glove, index) => (
          <button
            key={glove.defindex}
            onClick={() => handleGloveSelect(index)}
            className={`
              card p-3 text-left transition-all duration-200
              ${selectedGlove === index
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
                : 'hover:border-gray-500'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🧤</span>
              <div>
                <div className="text-xs font-semibold text-white">{glove.name}</div>
                <div className="text-xs text-gray-400">{glove.paints.length} {t("tab.gloves").toLowerCase()}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedGlove !== null && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">
            {gloves[selectedGlove].name} - {t("glove.selectPaint")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {gloves[selectedGlove].paints.map(paint => (
              <button
                key={paint.id}
                onClick={() => handlePaintSelect(paint.id)}
                className={`
                  p-2 rounded-md text-xs font-medium transition-all duration-200
                  ${loadout.glovePaint === paint.id
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
