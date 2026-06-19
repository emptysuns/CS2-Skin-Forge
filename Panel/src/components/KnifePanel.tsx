import { useState } from 'react';
import { Loadout } from '../utils/types';
import { knives } from '../data/knives';
import { knifePaints } from '../data/skins';

interface KnifePanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function KnifePanel({ loadout, updateLoadout }: KnifePanelProps) {
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
        <div className="text-sm font-semibold text-white">🎲 Random Knife</div>
        <div className="text-xs text-gray-400 mt-0.5">Randomly select from all available knives</div>
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
            {knives[selectedKnife].name} Skins
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

      <div className="card bg-blue-900/20 border-blue-500/30">
        <div className="flex items-start space-x-2">
          <span className="text-blue-400">ℹ️</span>
          <div>
            <h4 className="text-xs font-semibold text-blue-300">Knife Skins</h4>
            <p className="text-xs text-blue-200/70 mt-0.5">
              Select a knife type and skin. Changes visible on next spawn. Visual only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
