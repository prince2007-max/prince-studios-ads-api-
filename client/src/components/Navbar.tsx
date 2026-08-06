import React from 'react';
import { User } from '../types';
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-cyan-500/20 bg-neutral-950/80 px-6 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-lg shadow-lg shadow-cyan-900/50">
          P
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-white flex items-center gap-1.5">
            PRINCE <span className="text-cyan-400 font-extrabold">ADS</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> REST API v1
            </span>
          </h1>
          <p className="text-[10px] text-neutral-400 font-medium">Enterprise Advertisement Engine</p>
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 border border-white/10 text-xs">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white">{user.name || user.username}</span>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold font-mono">
                {user.role}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <span className="text-xs text-neutral-400">Guest Access</span>
        )}
      </div>
    </header>
  );
};
