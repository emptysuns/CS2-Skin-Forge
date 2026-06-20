import { Loadout } from '../utils/types';
import { knives } from '../data/knives';
import { gloves, musicKits } from '../data/skins';
import { useT } from '../i18n';

interface PreviewPanelProps {
  loadout: Loadout;
}

export default function PreviewPanel({ loadout }: PreviewPanelProps) {
  const { t } = useT();

  const getKnifeName = () => {
    if (loadout.knifeIndex === -1) return t("preview.notSelected");
    return knives[loadout.knifeIndex]?.name || t("preview.notSelected");
  };

  const getGloveName = () => {
    if (loadout.gloveIndex === -1) return t("preview.notSelected");
    return gloves[loadout.gloveIndex]?.name || t("preview.notSelected");
  };

  const getMusicKitName = () => {
    if (loadout.musicKit === -1) return t("preview.notSelected");
    return musicKits.find(k => k.id === loadout.musicKit)?.name || t("preview.notSelected");
  };

  const getCustomWeaponCount = () => Object.keys(loadout.weaponPaints).length;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
        <span>👁️</span>
        <span>{t("preview.title")}</span>
      </h3>

      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <span className="text-base">🔪</span>
          <div>
            <div className="text-xs font-medium text-gray-400">{t("preview.knife")}</div>
            <div className="text-xs text-white">{getKnifeName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🧤</span>
          <div>
            <div className="text-xs font-medium text-gray-400">{t("preview.gloves")}</div>
            <div className="text-xs text-white">{getGloveName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🎵</span>
          <div>
            <div className="text-xs font-medium text-gray-400">{t("preview.music")}</div>
            <div className="text-xs text-white">{getMusicKitName()}</div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className="text-base">🔫</span>
          <div>
            <div className="text-xs font-medium text-gray-400">{t("preview.weapons")}</div>
            <div className="text-xs text-white">
              {getCustomWeaponCount() > 0
                ? `${getCustomWeaponCount()} ${t("preview.custom").toLowerCase()}`
                : t("preview.random")}
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
            {loadout.useRandom ? `🎲 ${t("preview.random")}` : `🎨 ${t("preview.custom")}`}
          </span>
        </div>
      </div>
    </div>
  );
}
