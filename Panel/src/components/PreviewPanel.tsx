import { Loadout } from '../utils/types';
import { weapons } from '../data/weapons';
import { knives } from '../data/knives';
import { gloves, musicKits, knifePaints } from '../data/skins';

interface PreviewPanelProps {
  loadout: Loadout;
}

export default function PreviewPanel({ loadout }: PreviewPanelProps) {
  const getKnifeName = () => {
    if (loadout.knifeIndex === -1) return 'Random';
    return knives[loadout.knifeIndex]?.name || 'Random';
  };

  const getKnifePaintName = () => {
    if (loadout.knifePaint === -1) return 'Random';
    return knifePaints.find(p => p.id === loadout.knifePaint)?.name || 'Random';
  };

  const getGloveName = () => {
    if (loadout.gloveIndex === -1) return 'Random';
    return gloves[loadout.gloveIndex]?.name || 'Random';
  };

  const getGlovePaintName = () => {
    if (loadout.glovePaint === -1) return 'Random';
    for (const glove of gloves) {
      const paint = glove.paints.find(p => p.id === loadout.glovePaint);
      if (paint) return paint.name;
    }
    return 'Random';
  };

  const getMusicKitName = () => {
    if (loadout.musicKit === -1) return 'Random';
    return musicKits.find(k => k.id === loadout.musicKit)?.name || 'Random';
  };

  const getCustomWeaponCount = () => Object.keys(loadout.weaponPaints).length;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
        <span>👁️</span>
        <span>Current Loadout</span>
      </h3>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <span className="text-base">🔪</span>
          <div>
            <div className="text-xs font-medium text-gray-400">Knife</div>
            <div className="text-xs text-white">{getKnifeName()}</div>
            <div className="text-xs text-gray-500">Skin: {getKnifePaintName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🧤</span>
          <div>
            <div className="text-xs font-medium text-gray-400">Gloves</div>
            <div className="text-xs text-white">{getGloveName()}</div>
            <div className="text-xs text-gray-500">Skin: {getGlovePaintName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🎵</span>
          <div>
            <div className="text-xs font-medium text-gray-400">Music Kit</div>
            <div className="text-xs text-white">{getMusicKitName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🔫</span>
          <div>
            <div className="text-xs font-medium text-gray-400">Weapons</div>
            <div className="text-xs text-white">
              {getCustomWeaponCount() > 0 ? `${getCustomWeaponCount()} custom skins` : 'All random'}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 my-2"></div>

        <div className="text-center">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            loadout.useRandom
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {loadout.useRandom ? '🎲 Random Mode' : '🎨 Custom Mode'}
          </span>
        </div>
      </div>
    </div>
  );
}
