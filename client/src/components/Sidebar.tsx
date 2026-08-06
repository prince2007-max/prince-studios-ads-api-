import React from 'react';
import { LayoutDashboard, Megaphone, BarChart3, Key, Code2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaign Manager', icon: Megaphone },
    { id: 'analytics', label: 'Analytics & CTR', icon: BarChart3 },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'apidocs', label: 'API Documentation', icon: Code2 },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-neutral-950/60 p-4 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 font-mono">
          MAIN MENU
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-950/50 font-extrabold'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-[11px]">API Status</span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <p className="text-[10px] text-neutral-400 leading-relaxed">
          Engine running on <code className="text-cyan-300 font-mono">http://localhost:5000</code>
        </p>
      </div>
    </aside>
  );
};
