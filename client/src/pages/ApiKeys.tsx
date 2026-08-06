import React, { useState, useEffect } from 'react';
import { ApiKeyItem } from '../types';
import { api } from '../services/api';
import { Key, Trash2, Copy, Check } from 'lucide-react';

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('localhost');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      const data = await api.getApiKeys();
      setKeys(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await api.createApiKey(name, domain || '*');
      setName('');
      loadKeys();
    } catch (e: any) {
      alert(e.message || 'Error generating API Key');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Revoke and delete this API Key? External applications using it will lose access.')) {
      try {
        await api.deleteApiKey(id);
        loadKeys();
      } catch (e: any) {
        alert(e.message || 'Error revoking key');
      }
    }
  };

  const copyToClipboard = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-cyan-400" />
          <span>API Key Management</span>
        </h2>
        <p className="text-xs text-neutral-400">
          Generate API keys for Prince Studios Cinema and external apps to fetch ad streams securely.
        </p>
      </div>

      {/* Create Key Form */}
      <form
        onSubmit={handleCreate}
        className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4 text-xs"
      >
        <h3 className="font-bold text-white text-xs">Generate New Integration API Key</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-neutral-300">Application / Client Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Prince Studios Cinema Web"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-neutral-300">Allowed Origin Domain</label>
            <input
              type="text"
              placeholder="localhost or *"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
        >
          Generate API Key
        </button>
      </form>

      {/* Keys List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Active Integration Keys</h3>
        <div className="space-y-3">
          {keys.map((k) => (
            <div
              key={k._id}
              className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{k.name}</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <code className="text-cyan-300 font-mono text-xs bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                    {k.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(k.key)}
                    className="p-1 rounded bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey === k.key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">
                  Requests: <strong className="text-white">{k.requests}</strong>
                </span>
                <button
                  onClick={() => handleDelete(k._id)}
                  className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                  title="Revoke Key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
