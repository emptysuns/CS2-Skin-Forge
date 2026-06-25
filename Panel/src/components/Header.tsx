import { useT } from "../i18n";

interface HeaderProps {
  onSettingsClick: () => void;
  onAboutClick: () => void;
}

export default function Header({ onSettingsClick, onAboutClick }: HeaderProps) {
  const { t } = useT();

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-4 py-3" data-tauri-drag-region>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-white">CS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              {t("app.title")}
            </h1>
            <p className="text-xs text-gray-400">v1.5.9 • {t("app.localOnly")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
            {t("app.vacSafe")}
          </span>
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
            {t("app.localOnly")}
          </span>
          <button
            onClick={onSettingsClick}
            className="ml-2 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white"
            title={t("settings.title")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onAboutClick}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white"
            title={t("about.title")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
