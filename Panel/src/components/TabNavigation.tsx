import { useT, type I18nKey } from "../i18n";

interface Tab {
  id: string;
  labelKey: I18nKey;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'weapons', labelKey: 'tab.weapons', icon: '🔫' },
  { id: 'knives', labelKey: 'tab.knives', icon: '🔪' },
  { id: 'gloves', labelKey: 'tab.gloves', icon: '🧤' },
  { id: 'agents', labelKey: 'tab.agents', icon: '👤' },
  { id: 'music', labelKey: 'tab.music', icon: '🎵' },
];

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const { t } = useT();

  return (
    <nav className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-md
            transition-all duration-200 text-sm font-medium
            ${activeTab === tab.id
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span>{t(tab.labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
