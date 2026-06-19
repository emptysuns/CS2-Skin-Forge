import { Loadout } from '../utils/types';
import { musicKits } from '../data/skins';

interface MusicKitPanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function MusicKitPanel({ loadout, updateLoadout }: MusicKitPanelProps) {
  const handleMusicKitSelect = (kitId: number) => {
    updateLoadout({ musicKit: kitId, useRandom: false });
  };

  const handleRandom = () => {
    updateLoadout({ musicKit: -1, useRandom: true });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${loadout.musicKit === -1
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
            : 'hover:border-gray-500'
          }
        `}
      >
        <div className="text-sm font-semibold text-white">🎵 Random Music Kit</div>
        <div className="text-xs text-gray-400 mt-0.5">Randomly select from available music kits</div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
        {musicKits.map(kit => (
          <button
            key={kit.id}
            onClick={() => handleMusicKitSelect(kit.id)}
            className={`
              card p-2.5 text-left transition-all duration-200
              ${loadout.musicKit === kit.id
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
                : 'hover:border-gray-500'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <span className="text-base">🎵</span>
              <div className="text-xs font-medium text-white truncate">{kit.name}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="card bg-pink-900/20 border-pink-500/30">
        <div className="flex items-start space-x-2">
          <span className="text-pink-400">🎵</span>
          <div>
            <h4 className="text-xs font-semibold text-pink-300">Music Kits</h4>
            <p className="text-xs text-pink-200/70 mt-0.5">
              Music kits play when you get MVP. Displayed in MVP screen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
