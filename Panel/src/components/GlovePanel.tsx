import { useState } from 'react';
import { Loadout } from '../utils/types';
import { gloves, getGloveTypeImage } from '../data/skins';
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
  const [wearValue, setWearValue] = useState(loadout.gloveWear ?? 0.01);
  const [seedValue, setSeedValue] = useState(loadout.gloveSeed ?? 0);

  const wearLabels = ['FN', 'MW', 'FT', 'WW', 'BS'];
  const wearValues = [0.01, 0.07, 0.15, 0.38, 0.45];

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

  const handleWearChange = (wear: number) => {
    setWearValue(wear);
    updateLoadout({ gloveWear: wear });
  };

  const handleSeedChange = (seed: number) => {
    setSeedValue(seed);
    updateLoadout({ gloveSeed: seed });
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
        <div className="text-sm font-semibold text-white">{t("preview.random")}</div>
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
              <img
                src={getGloveTypeImage(glove.defindex, glove.codename)}
                alt={glove.name}
                className="w-10 h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
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

          {/* Wear + Seed controls */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {t("glove.wear")} ({wearLabels[wearValues.findIndex(v => Math.abs(v - wearValue) < 0.02)] || 'Custom'})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={wearValue}
                  onChange={(e) => handleWearChange(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-gray-300 w-12 text-right">{wearValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                {wearValues.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleWearChange(v)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                      Math.abs(wearValue - v) < 0.02
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
                {t("glove.seed")} (0 = random)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="1"
                  value={seedValue}
                  onChange={(e) => handleSeedChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-gray-300 w-10 text-right">{seedValue}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {gloves[selectedGlove].paints.map(paint => (
              <button
                key={paint.id}
                onClick={() => handlePaintSelect(paint.id)}
                className={`flex flex-col items-center p-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  loadout.glovePaint === paint.id
                    ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {paint.image && (
                  <img src={paint.image} alt={paint.name}
                    className="w-full h-12 object-contain mb-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="truncate w-full text-center">{paint.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
