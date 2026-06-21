import { useState } from 'react';
import { Loadout } from '../utils/types';
import { gloves, getGloveTypeImage } from '../data/skins';
import { getGloveLocalizedName, getGlovePaintLocalizedName } from '../data/localNames';
import { useT } from '../i18n';

interface GlovePanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function GlovePanel({ loadout, updateLoadout }: GlovePanelProps) {
  const { t, lang } = useT();
  const [selectedTeam, setSelectedTeam] = useState<'ct' | 't'>('ct');
  const [selectedGlove, setSelectedGlove] = useState<number | null>(() => {
    const idx = selectedTeam === 'ct' ? loadout.gloveIndexCt : loadout.gloveIndexT;
    return idx >= 0 ? idx : null;
  });

  const wearLabels = ['FN', 'MW', 'FT', 'WW', 'BS'];
  const wearValues = [0.01, 0.07, 0.15, 0.38, 0.45];

  const getIndexField = () => selectedTeam === 'ct' ? 'gloveIndexCt' : 'gloveIndexT';
  const getPaintField = () => selectedTeam === 'ct' ? 'glovePaintCt' : 'glovePaintT';
  const getWearField = () => selectedTeam === 'ct' ? 'gloveWearCt' : 'gloveWearT';
  const getSeedField = () => selectedTeam === 'ct' ? 'gloveSeedCt' : 'gloveSeedT';

  const currentPaint = selectedTeam === 'ct' ? loadout.glovePaintCt : loadout.glovePaintT;
  const currentWear = selectedTeam === 'ct' ? loadout.gloveWearCt : loadout.gloveWearT;
  const currentSeed = selectedTeam === 'ct' ? loadout.gloveSeedCt : loadout.gloveSeedT;

  const handleGloveSelect = (index: number) => {
    setSelectedGlove(index);
    const glove = gloves[index];
    // Validate: if current paint is not valid for this glove type, reset to first valid paint
    const validPaintIds = glove.paints.map(p => p.id);
    const isPaintValid = validPaintIds.includes(currentPaint);
    const newPaint = isPaintValid ? currentPaint : glove.paints[0].id;

    updateLoadout({
      [getIndexField()]: index,
      [getPaintField()]: newPaint,
      ...(selectedTeam === 'ct'
        ? { gloveDefIndexCt: glove.defindex }
        : { gloveDefIndexT: glove.defindex }),
      useRandom: false,
    } as any);
  };

  const handlePaintSelect = (paintId: number) => {
    const glove = gloves[selectedGlove!];
    updateLoadout({
      [getPaintField()]: paintId,
      ...(selectedTeam === 'ct'
        ? { gloveDefIndexCt: glove.defindex }
        : { gloveDefIndexT: glove.defindex }),
      useRandom: false,
    } as any);
  };

  const handleWearChange = (wear: number) => {
    updateLoadout({ [getWearField()]: wear } as any);
  };

  const handleSeedChange = (seed: number) => {
    updateLoadout({ [getSeedField()]: seed } as any);
  };

  const handleRandom = () => {
    setSelectedGlove(null);
    updateLoadout({
      gloveIndexCt: -1, glovePaintCt: -1,
      gloveIndexT: -1, glovePaintT: -1,
      useRandom: true,
    });
  };

  // Find glove names for both teams (localized)
  const getGloveName = (idx: number) => {
    if (idx < 0 || idx >= gloves.length) return t("preview.random");
    return getGloveLocalizedName(gloves[idx].defindex, gloves[idx].name, lang);
  };

  const selectedCtName = getGloveName(loadout.gloveIndexCt);
  const selectedTName = getGloveName(loadout.gloveIndexT);

  return (
    <div className="space-y-3">
      {/* Team toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setSelectedTeam('ct');
            setSelectedGlove(loadout.gloveIndexCt >= 0 ? loadout.gloveIndexCt : null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 'ct' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {t("glove.ct")}
        </button>
        <button
          onClick={() => {
            setSelectedTeam('t');
            setSelectedGlove(loadout.gloveIndexT >= 0 ? loadout.gloveIndexT : null);
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 't' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {t("glove.t")}
        </button>
      </div>

      {/* Current selections for both teams */}
      <div className="flex space-x-2 text-xs">
        <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2">
          <span className="text-blue-400 font-semibold">{t("glove.ct")}:</span>{' '}
          <span className="text-gray-200">{selectedCtName}</span>
        </div>
        <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2">
          <span className="text-orange-400 font-semibold">{t("glove.t")}:</span>{' '}
          <span className="text-gray-200">{selectedTName}</span>
        </div>
      </div>

      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${loadout.gloveIndexCt === -1 && loadout.gloveIndexT === -1
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
                <div className="text-xs font-semibold text-white">
                  {getGloveLocalizedName(glove.defindex, glove.name, lang)}
                </div>
                <div className="text-xs text-gray-400">{glove.paints.length} {t("tab.gloves").toLowerCase()}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedGlove !== null && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">
            {getGloveLocalizedName(gloves[selectedGlove].defindex, gloves[selectedGlove].name, lang)} - {t("glove.selectPaint")}
          </h3>

          {/* Wear + Seed controls */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                {t("glove.wear")} ({wearLabels[wearValues.findIndex(v => Math.abs(v - currentWear) < 0.02)] || 'Custom'})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={currentWear}
                  onChange={(e) => handleWearChange(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-gray-300 w-12 text-right">{currentWear.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-1">
                {wearValues.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleWearChange(v)}
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                      Math.abs(currentWear - v) < 0.02
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
                  value={currentSeed}
                  onChange={(e) => handleSeedChange(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-xs text-gray-300 w-10 text-right">{currentSeed}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {gloves[selectedGlove].paints.map(paint => (
              <button
                key={paint.id}
                onClick={() => handlePaintSelect(paint.id)}
                className={`flex flex-col items-center p-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  currentPaint === paint.id
                    ? 'bg-amber-600 text-white ring-1 ring-amber-400'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {paint.image && (
                  <img src={paint.image} alt={paint.name}
                    className="w-full h-12 object-contain mb-1"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <span className="truncate w-full text-center">
                  {getGlovePaintLocalizedName(gloves[selectedGlove].defindex, paint.id, paint.name, lang)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
