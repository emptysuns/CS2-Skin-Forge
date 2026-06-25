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
import AboutDialog from './components/AboutDialog';
import DisclaimerDialog from './components/DisclaimerDialog';
import { Loadout } from './utils/types';
import { useT } from './i18n';
import { api, type AppConfig, type PluginCheckResult } from './lib/api';

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
  const [showAbout, setShowAbout] = useState(false);
  const [_config, setConfig] = useState<AppConfig | null>(null);
  const [loadout, setLoadout] = useState<Loadout>({ ...defaultLoadout });

  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showPluginWarning, setShowPluginWarning] = useState(false);
  const [pluginCheckResult, setPluginCheckResult] = useState<PluginCheckResult | null>(null);
  const [pluginDismissed, setPluginDismissed] = useState(false);

  // Load config and saved loadout on mount
  useEffect(() => {
    const init = async () => {
      try {
        const cfg = await api.getConfig();
        setConfig(cfg);
        // If CS2 path is not configured, auto-open settings as a setup reminder
        if (!cfg.cs2Path) {
          setShowSettings(true);
        } else {
          // Check if plugin files are present and up-to-date
          try {
            const check = await api.checkPluginFiles();
            setPluginCheckResult(check);
            if (!check.allPresent || check.versionMismatch) {
              setShowPluginWarning(true);
            }
          } catch (e) {
            console.error("Plugin check failed:", e);
          }
        }
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

  const handleDeployFromWarning = () => {
    setShowPluginWarning(false);
    setShowSettings(true);
  };

  const handleDismissPluginWarning = () => {
    setShowPluginWarning(false);
    setPluginDismissed(true);
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
      <Header onSettingsClick={() => setShowSettings(true)} onAboutClick={() => setShowAbout(true)} />

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
      <AboutDialog
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />
      <DisclaimerDialog />

      {/* Plugin Warning Dialog */}
      {showPluginWarning && pluginCheckResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-bold text-white">{t("setup.pluginWarning")}</h2>
            </div>
            <p className="text-sm text-gray-300">
              {pluginCheckResult.missingFiles.length > 0
                ? t("status.pluginMissing")
                : pluginCheckResult.versionMismatch
                  ? t("status.pluginVersionMismatch")
                  : t("setup.pluginWarningMessage")}
            </p>
            {pluginCheckResult.missingFiles.length > 0 && (
              <div className="text-xs text-red-400 bg-red-900/20 rounded-lg p-2">
                {t("setup.pluginWarningMessage")}
                <ul className="list-disc list-inside mt-1">
                  {pluginCheckResult.missingFiles.map(f => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
            {pluginCheckResult.versionMismatch && (
              <div className="text-xs text-yellow-400 bg-yellow-900/20 rounded-lg p-2">
                {t("status.pluginVersionMismatch")}
                <br />
                Panel: v{pluginCheckResult.panelVersion} | Deployed: {pluginCheckResult.deployedVersion || t("common.error")}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={handleDismissPluginWarning} className="btn-secondary flex-1">
                {t("setup.remindLater")}
              </button>
              <button onClick={handleDeployFromWarning} className="btn-primary flex-1">
                {t("setup.deployNow")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
