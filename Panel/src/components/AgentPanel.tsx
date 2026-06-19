import { useState } from 'react';
import { Loadout } from '../utils/types';
import { agentModels } from '../data/skins';

interface AgentPanelProps {
  loadout: Loadout;
  updateLoadout: (updates: Partial<Loadout>) => void;
}

export default function AgentPanel({ loadout, updateLoadout }: AgentPanelProps) {
  const [selectedTeam, setSelectedTeam] = useState<'ct' | 't'>('ct');

  const handleAgentSelect = (modelId: number) => {
    updateLoadout({ agentModel: modelId, useRandom: false });
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
          🔵 Counter-Terrorist
        </button>
        <button
          onClick={() => setSelectedTeam('t')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            selectedTeam === 't' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🟠 Terrorist
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
        <div className="text-sm font-semibold text-white">👤 Random Agent</div>
        <div className="text-xs text-gray-400 mt-0.5">Randomly select from available agents</div>
      </button>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => handleAgentSelect(model.id)}
            className={`
              card p-2.5 text-center transition-all duration-200
              ${loadout.agentModel === model.id
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-900/20'
                : 'hover:border-gray-500'
              }
            `}
          >
            <div className="text-lg mb-1">👤</div>
            <div className="text-xs font-medium text-white truncate">{model.name}</div>
          </button>
        ))}
      </div>

      <div className="card bg-green-900/20 border-green-500/30">
        <div className="flex items-start space-x-2">
          <span className="text-green-400">ℹ️</span>
          <div>
            <h4 className="text-xs font-semibold text-green-300">Agent Models</h4>
            <p className="text-xs text-green-200/70 mt-0.5">
              Agent models are team-specific. Changes on next spawn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
