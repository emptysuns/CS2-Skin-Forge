import { useState } from 'react';
import { Loadout } from '../utils/types';
import { agentModels } from '../data/skins';
import { useT } from '../i18n';

interface AgentPanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function AgentPanel({ loadout, updateLoadout }: AgentPanelProps) {
  const { t } = useT();
  const [selectedTeam, setSelectedTeam] = useState<'ct' | 't'>('ct');

  const handleAgentSelect = (modelId: string) => {
    const idx = parseInt(modelId, 10);
    if (selectedTeam === 'ct') {
      updateLoadout({ agentModelCt: idx, useRandom: false });
    } else {
      updateLoadout({ agentModelT: idx, useRandom: false });
    }
  };

  const handleRandom = () => {
    updateLoadout({ agentModelCt: -1, agentModelT: -1, useRandom: true });
  };

  const models = selectedTeam === 'ct' ? agentModels.ct : agentModels.t;
  const currentIdx = selectedTeam === 'ct' ? loadout.agentModelCt : loadout.agentModelT;
  const isBothRandom = loadout.agentModelCt === -1 && loadout.agentModelT === -1;

  // Find selected agent names for display
  const selectedCtName = loadout.agentModelCt >= 0
    ? agentModels.ct[Math.min(loadout.agentModelCt, agentModels.ct.length - 1)]?.name ?? '—'
    : t("preview.random");
  const selectedTName = loadout.agentModelT >= 0
    ? agentModels.t[Math.min(loadout.agentModelT, agentModels.t.length - 1)]?.name ?? '—'
    : t("preview.random");

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedTeam('ct')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 'ct' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {t("agent.ct")}
        </button>
        <button
          onClick={() => setSelectedTeam('t')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 't' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {t("agent.t")}
        </button>
      </div>

      {/* Show current selections for both teams */}
      <div className="flex space-x-2 text-xs">
        <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2">
          <span className="text-blue-400 font-semibold">{t("agent.ct")}:</span>{' '}
          <span className="text-gray-200">{selectedCtName}</span>
        </div>
        <div className="flex-1 rounded-lg bg-gray-800/50 border border-gray-700 px-3 py-2">
          <span className="text-orange-400 font-semibold">{t("agent.t")}:</span>{' '}
          <span className="text-gray-200">{selectedTName}</span>
        </div>
      </div>

      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${isBothRandom
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
            : 'hover:border-gray-500'
          }
        `}
      >
        <div className="text-sm font-semibold text-white">{t("preview.random")}</div>
        <div className="text-xs text-gray-400 mt-0.5">{t("agent.title")}</div>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleAgentSelect(model.id)}
            className={`
              card p-2.5 text-center transition-all duration-200
              ${currentIdx === parseInt(model.id, 10)
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
                : 'hover:border-gray-500'
              }
            `}
          >
            {model.image ? (
              <img src={model.image} alt={model.name}
                className="w-full h-16 object-contain mb-1"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className={`w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                selectedTeam === 'ct' ? 'bg-blue-600/50' : 'bg-orange-600/50'
              }`}>
                {model.name.charAt(0)}
              </div>
            )}
            <div className="text-xs font-medium text-white truncate">{model.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
