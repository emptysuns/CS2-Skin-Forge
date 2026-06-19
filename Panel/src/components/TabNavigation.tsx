interface Tab {
  id: string;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'weapons', label: 'Weapons', icon: '🔫' },
  { id: 'knives', label: 'Knives', icon: '🔪' },
  { id: 'gloves', label: 'Gloves', icon: '🧤' },
  { id: 'agents', label: 'Agents', icon: '👤' },
  { id: 'music', label: 'Music', icon: '🎵' },
];

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
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
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
