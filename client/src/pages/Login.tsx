import React, { useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('PRINCE');
  const [password, setPassword] = useState('VSICS2024');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await api.login(username, password);
      localStorage.setItem('prince_ads_jwt_token', data.token);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-2xl select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-neutral-900/90 border border-cyan-500/30 p-8 shadow-2xl space-y-6 text-center">
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-3xl shadow-xl shadow-cyan-900/50 border border-cyan-300/40">
            P
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white">
            PRINCE <span className="text-cyan-400">ADS</span>
          </h2>
          <p className="text-xs text-neutral-400 font-medium">Enterprise Admin Authentication Portal</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-semibold animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <UserIcon className="h-4 w-4 text-cyan-400" />
              <span>Admin Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="PRINCE"
              className="w-full p-3.5 rounded-xl bg-neutral-950/80 border border-white/15 text-white outline-none focus:border-cyan-400 font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 rounded-xl bg-neutral-950/80 border border-white/15 text-white outline-none focus:border-cyan-400 font-mono text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-950/80 transition-all cursor-pointer mt-3 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In as Admin'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-400 font-mono flex items-center justify-between px-1">
          <span>Default Admin:</span>
          <span className="text-cyan-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/10">PRINCE / VSICS2024</span>
        </div>
      </div>
    </div>
  );
};
