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
import DisclaimerDialog from './components/DisclaimerDialog';
import { Loadout } from './utils/types';
import { useT } from './i18n';
import { api, type AppConfig } from './lib/api';

const defaultLoadout: Loadout = {
  weaponPaints: {},
  weaponStickers: {},
  weaponWears: {},
  weaponSeeds: {},
  weaponKeychains: {},
  weaponNametags: {},
  weaponStatTrak: {},
  knifeIndex: -1,
  knifePaint: -1,
  knifeWear: 0.01,
  knifeSeed: 0,
  gloveIndexCt: -1,
  glovePaintCt: -1,
  gloveWearCt: 0.01,
  gloveSeedCt: 0,
  gloveDefIndexCt: 0,
  gloveIndexT: -1,
  glovePaintT: -1,
  gloveWearT: 0.01,
  gloveSeedT: 0,
  gloveDefIndexT: 0,
  agentModelCt: -1,
  agentModelT: -1,
  agentModelPathCt: '',
  agentModelPathT: '',
  musicKit: -1,
  useRandom: true,
};

function App() {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState('weapons');
  const [showSettings, setShowSettings] = useState(false);
  const [_config, setConfig] = useState<AppConfig | null>(null);
  const [loadout, setLoadout] = useState<Loadout>({ ...defaultLoadout });

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
          setLoadout(prev => ({ ...prev, ...saved }));
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
    setLoadout({ ...defaultLoadout });
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

      <footer className="text-center text-[10px] text-gray-600 py-1">
        <a href="https://github.com/emptysuns/CS2-Skin-Forge" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">
          CS2 Skin Mod
        </a>
        <span className="mx-1">•</span>
        <span>Open Source & Free · 开源免费软件 · 请勿上当受骗</span>
      </footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onConfigSaved={setConfig}
      />
      <DisclaimerDialog />
    </div>
  );
}

export default App;
