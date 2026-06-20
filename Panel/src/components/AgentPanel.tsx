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
    updateLoadout({ agentModel: parseInt(modelId, 10), useRandom: false });
  };

  const handleRandom = () => {
    updateLoadout({ agentModel: -1, useRandom: true });
  };

  const models = selectedTeam === 'ct' ? agentModels.ct : agentModels.t;

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <button
          onClick={() => setSelectedTeam('ct')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 'ct' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🔵 {t("agent.ct")}
        </button>
        <button
          onClick={() => setSelectedTeam('t')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 't' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🟠 {t("agent.t")}
        </button>
      </div>

      <button
        onClick={handleRandom}
        className={`
          card w-full text-center py-3 transition-all duration-200
          ${loadout.agentModel === -1
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
            : 'hover:border-gray-500'
          }
        `}
      >
        <div className="text-sm font-semibold text-white">👤 {t("preview.random")}</div>
        <div className="text-xs text-gray-400 mt-0.5">{t("agent.title")}</div>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleAgentSelect(model.id)}
            className={`
              card p-2.5 text-center transition-all duration-200
              ${loadout.agentModel === parseInt(model.id, 10)
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
