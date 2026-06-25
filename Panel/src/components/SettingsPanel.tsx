import { useState, useEffect } from "react";
import { useT } from "../i18n";
import { api, type AppConfig } from "../lib/api";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (config: AppConfig) => void;
}

export default function SettingsPanel({ isOpen, onClose, onConfigSaved }: SettingsPanelProps) {
  const { t, lang, changeLanguage, languages } = useT();
  const [config, setConfig] = useState<AppConfig>({ language: lang, cs2Path: null });
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getConfig().then(setConfig).catch(console.error);
      setDeployResult(null);
    }
  }, [isOpen]);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const path = await api.detectCs2Path();
      if (path) {
        setConfig(prev => ({ ...prev, cs2Path: path }));
      }
    } catch (e) {
      console.error("Failed to detect CS2 path:", e);
    }
    setDetecting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newConfig = { ...config, language: lang };
      await api.saveConfig(newConfig);
      onConfigSaved(newConfig);
      onClose();
    } catch (e) {
      console.error("Failed to save config:", e);
    }
    setSaving(false);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployResult(null);
    try {
      const deployMsg = await api.deployAddons();
      // Post-deploy verification: check files are actually present
      let verifyMsg = "";
      let verifySuccess = true;
      try {
        const check = await api.checkPluginFiles();
        if (!check.allPresent) {
          verifySuccess = false;
          verifyMsg = check.missingFiles.length > 0
            ? t("status.deployVerifyFailed")
            : check.versionMismatch
              ? t("status.pluginVersionMismatch")
              : t("status.deployError");
        } else {
          verifyMsg = t("status.pluginAllGood");
        }
      } catch {
        verifyMsg = t("status.deployError");
        verifySuccess = false;
      }
      setDeployResult({
        success: verifySuccess,
        message: deployMsg + "\n" + verifyMsg,
      });
    } catch (e) {
      setDeployResult({ success: false, message: String(e) });
    }
    setDeploying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t("settings.title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t("settings.language")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLanguage(l.code)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  lang === l.code
                    ? "bg-orange-500/20 border border-orange-500/50 text-orange-300"
                    : "bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <span className="text-xs font-mono bg-gray-700 px-1 rounded">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CS2 Path */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t("settings.cs2Path")}
          </label>
          <p className="text-xs text-gray-500">{t("settings.cs2PathHint")}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.cs2Path ?? ""}
              onChange={(e) => setConfig(prev => ({ ...prev, cs2Path: e.target.value || null }))}
              placeholder="/path/to/game/csgo"
              className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="btn-secondary text-sm px-3"
            >
              {detecting ? "..." : t("settings.detect")}
            </button>
          </div>
        </div>

        {/* Deploy Addons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            {t("settings.deployAddons")}
          </label>
          <p className="text-xs text-gray-500">{t("settings.deployAddonsHint")}</p>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="btn-secondary w-full text-sm"
          >
            {deploying ? t("common.loading") : t("settings.deployAddons")}
          </button>
          {deployResult && (
            <div className={`text-xs ${deployResult.success ? 'text-green-400' : 'text-red-400'} whitespace-pre-wrap`}>
              {deployResult.success ? t("status.deployed") : t("status.deployError")}
              <br />
              <span className="opacity-70">{deployResult.message}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">
            {t("btn.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1"
          >
            {saving ? t("common.loading") : t("btn.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
