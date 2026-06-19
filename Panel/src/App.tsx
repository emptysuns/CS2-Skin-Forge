import { useState } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import WeaponPanel from './components/WeaponPanel';
import KnifePanel from './components/KnifePanel';
import GlovePanel from './components/GlovePanel';
import AgentPanel from './components/AgentPanel';
import MusicKitPanel from './components/MusicKitPanel';
import PreviewPanel from './components/PreviewPanel';
import StatusBar from './components/StatusBar';
import { Loadout } from './utils/types';

function App() {
  const [activeTab, setActiveTab] = useState('weapons');
  const [loadout, setLoadout] = useState<Loadout>({
    weaponPaints: {},
    knifeIndex: -1,
    knifePaint: -1,
    gloveIndex: -1,
    glovePaint: -1,
    agentModel: -1,
    musicKit: -1,
    useRandom: true,
  });

  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const updateLoadout = (updates: Partial<Loadout>) => {
    setLoadout(prev => ({ ...prev, ...updates }));
  };

  const handleApply = () => {
    setStatus({ message: 'Loadout applied! Changes will take effect on next spawn.', type: 'success' });
    setTimeout(() => setStatus(null), 3000);
  };

  const handleReset = () => {
    setLoadout({
      weaponPaints: {},
      knifeIndex: -1,
      knifePaint: -1,
      gloveIndex: -1,
      glovePaint: -1,
      agentModel: -1,
      musicKit: -1,
      useRandom: true,
    });
    setStatus({ message: 'All skins reset to random!', type: 'info' });
    setTimeout(() => setStatus(null), 3000);
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'weapons':
        return <WeaponPanel loadout={loadout} updateLoadout={updateLoadout} />;
      case 'knives':
        return <KnifePanel loadout={loadout} updateLoadout={updateLoadout} />;
      case 'gloves':
        return <GlovePanel loadout={loadout} updateLoadout={updateLoadout} />;
      case 'agents':
        return <AgentPanel loadout={loadout} updateLoadout={updateLoadout} />;
      case 'music':
        return <MusicKitPanel loadout={loadout} updateLoadout={updateLoadout} />;
      default:
        return <WeaponPanel loadout={loadout} updateLoadout={updateLoadout} />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" data-tauri-drag-region>
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          <div className="lg:col-span-3 space-y-4 overflow-hidden flex flex-col">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 overflow-y-auto pr-2">
              {renderPanel()}
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto">
            <PreviewPanel loadout={loadout} />
            <div className="card space-y-3">
              <button onClick={handleApply} className="btn-primary w-full">
                Apply Loadout
              </button>
              <button onClick={handleReset} className="btn-secondary w-full">
                Reset to Random
              </button>
            </div>
          </div>
        </div>
      </main>

      <StatusBar status={status} />
    </div>
  );
}

export default App;
