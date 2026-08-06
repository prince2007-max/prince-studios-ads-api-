import React, { useState, useEffect } from 'react';
import { Ad, AnalyticsOverview } from '../types';
import { api } from '../services/api';
import {
  Megaphone,
  BarChart3,
  Eye,
  MousePointer,
  Plus,
  Code2,
} from 'lucide-react';

interface DashboardProps {
  onOpenCreateModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenCreateModal, onNavigateTab }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [fetchedAds, fetchedAnalytics] = await Promise.all([
        api.getAds(),
        api.getAnalytics(),
      ]);
      setAds(fetchedAds);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } 
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestEndpoint = async (endpoint: string) => {
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResponse(JSON.stringify({ error: e.message }, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-cyan-500/30 shadow-2xl gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>PRINCE ADS Dashboard</span>
            <span className="text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              REST Engine Active
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Standalone Advertisement Platform serving JSON REST APIs to Prince Studios Cinema & External Apps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Total Campaigns</span>
            <Megaphone className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {analytics ? analytics.totalAds : 0}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">
            {analytics ? analytics.activeAds : 0} Active Campaigns
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Total Impressions</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {analytics ? analytics.totalImpressions : 0}
          </div>
          <span className="text-[10px] text-neutral-400">Tracked ad views</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Total Clicks</span>
            <MousePointer className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {analytics ? analytics.totalClicks : 0}
          </div>
          <span className="text-[10px] text-neutral-400">User CTA engagements</span>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Average CTR</span>
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {analytics ? analytics.ctr : '0%'}
          </div>
          <span className="text-[10px] text-neutral-400">Click-Through Rate %</span>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Ad Campaigns</h3>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            View All ({ads.length})
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Campaign</th>
                <th className="p-3.5">Format</th>
                <th className="p-3.5">Advertiser</th>
                <th className="p-3.5 text-center">Priority</th>
                <th className="p-3.5 text-center">Impressions</th>
                <th className="p-3.5 text-center">Clicks</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {ads.slice(0, 5).map((ad) => (
                <tr key={ad._id || ad.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white flex items-center gap-3">
                    {ad.mediaUrl ? (
                      <img
                        src={ad.mediaUrl}
                        alt={ad.title}
                        className="h-9 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-12 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-[10px] shrink-0 border border-cyan-500/30 font-black">
                        HTML
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block truncate font-semibold">{ad.title}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        Placements: {ad.placement.join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 uppercase font-mono text-[10px] text-cyan-400 font-bold">
                    {ad.adType}
                  </td>
                  <td className="p-3.5 text-neutral-400">{ad.advertiser}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                    {ad.priority}
                  </td>
                  <td className="p-3.5 text-center font-mono">{ad.impressions}</td>
                  <td className="p-3.5 text-center font-mono text-cyan-400">{ad.clicks}</td>
                  <td className="p-3.5 text-right">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        ad.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      {ad.isActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REST API Sandbox Tester Box */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live REST API Sandbox Tester</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Base: http://localhost:5000</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={() => handleTestEndpoint('/api/ads')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            GET /api/ads
          </button>
          <button
            onClick={() => handleTestEndpoint('/api/ads/banner')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold transition-all cursor-pointer"
          >
            GET /api/ads/banner
          </button>
          <button
            onClick={() => handleTestEndpoint('/api/ads/video')}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-bold transition-all cursor-pointer"
          >
            GET /api/ads/video
          </button>
          <button
            onClick={() => handleTestEndpoint('/api/analytics')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition-all cursor-pointer"
          >
            GET /api/analytics
          </button>
        </div>

        {testResponse && (
          <pre className="p-4 rounded-2xl bg-neutral-900 border border-white/10 text-cyan-300 text-xs font-mono overflow-x-auto max-h-56">
            {testResponse}
          </pre>
        )}
      </div>
    </div>
  );
};
