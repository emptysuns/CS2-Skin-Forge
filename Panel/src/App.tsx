import { useState, useEffect } from 'react';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import WeaponPanel from './components/WeaponPanel';
import KnifePanel from './components/KnifePanel';
import GlovePanel from './components/GlovePanel';
import AgentPanel from './components/AgentPanel';
import MusicKitPanel from './components/MusicKitPanel';
import PreviewPanel from './components/PreviewPanel';
import StatusBar from './components/StatusBar';
import SettingsPanel from './components/SettingsPanel';
import { Loadout } from './utils/types';
import { useT } from './i18n';
import { api, type AppConfig } from './lib/api';

function App() {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState('weapons');
  const [showSettings, setShowSettings] = useState(false);
  const [_config, setConfig] = useState<AppConfig | null>(null);
  const [loadout, setLoadout] = useState<Loadout>({
    weaponPaints: {},
    weaponStickers: {},
    weaponWears: {},
    weaponSeeds: {},
    knifeIndex: -1,
    knifePaint: -1,
    knifeWear: 0.01,
    knifeSeed: 0,
    gloveIndex: -1,
    glovePaint: -1,
    agentModel: -1,
    musicKit: -1,
    useRandom: true,
  });

  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load config and saved loadout on mount
  useEffect(() => {
    const init = async () => {
      try {
        const cfg = await api.getConfig();
        setConfig(cfg);
        // Try to load saved loadout for slot 0 (local player)
        const saved = await api.loadLoadout(0);
        if (saved) {
          setLoadout(saved);
        }
      } catch (e) {
        console.error("Failed to initialize:", e);
      }
    };
    init();
  }, []);

  const updateLoadout = (updates: Partial<Loadout>) => {
    setLoadout(prev => ({ ...prev, ...updates }));
  };

  const handleApply = async () => {
    try {
      // Save loadout to file for the addon to read
      await api.saveLoadout(0, loadout);
      setStatus({ message: t("status.applied"), type: 'success' });
    } catch (e) {
      console.error("Failed to save loadout:", e);
      setStatus({ message: t("status.error"), type: 'error' });
    }
    setTimeout(() => setStatus(null), 3000);
  };

  const handleReset = () => {
    setLoadout({
      weaponPaints: {},
      weaponStickers: {},
      weaponWears: {},
      weaponSeeds: {},
      knifeIndex: -1,
      knifePaint: -1,
      knifeWear: 0.01,
      knifeSeed: 0,
      gloveIndex: -1,
      glovePaint: -1,
      agentModel: -1,
      musicKit: -1,
      useRandom: true,
    });
    setStatus({ message: t("status.reset"), type: 'info' });
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
      <Header onSettingsClick={() => setShowSettings(true)} />

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
                {t("btn.apply")}
              </button>
              <button onClick={handleReset} className="btn-secondary w-full">
                {t("btn.reset")}
              </button>
            </div>
          </div>
        </div>
      </main>

      <StatusBar status={status} />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigSaved={setConfig}
      />
    </div>
  );
}

export default App;
