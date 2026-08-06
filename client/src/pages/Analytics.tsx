import React, { useState, useEffect } from 'react';
import { AnalyticsOverview, Ad } from '../types';
import { api } from '../services/api';
import { BarChart3, Eye, MousePointer, RefreshCw } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);

  const loadData = async () => {
    try {
      const [fetchedAnalytics, fetchedAds] = await Promise.all([
        api.getAnalytics(),
        api.getAds(),
      ]);
      setAnalytics(fetchedAnalytics);
      setAds(fetchedAds);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>Real-Time Performance Analytics</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Ad impression counters, click conversion data, and Click-Through Rate (CTR) reports.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-neutral-200 border border-white/10 text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Total Impressions</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {analytics ? analytics.totalImpressions : 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Total Clicks</span>
            <MousePointer className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            {analytics ? analytics.totalClicks : 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-neutral-400">Average CTR</span>
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {analytics ? analytics.ctr : '0%'}
          </div>
        </div>
      </div>

      {/* Detailed Campaign Analytics Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Campaign Performance Rankings</h3>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-neutral-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Advertiser</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5 text-center">Impressions</th>
                <th className="p-3.5 text-center">Clicks</th>
                <th className="p-3.5 text-right">Click-Through Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {ads.map((ad) => {
                const ctr =
                  ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
                return (
                  <tr key={ad._id || ad.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white truncate max-w-[200px]">
                      {ad.title}
                    </td>
                    <td className="p-3.5 text-neutral-400">{ad.advertiser}</td>
                    <td className="p-3.5 uppercase font-mono text-[10px] text-cyan-400 font-bold">
                      {ad.adType}
                    </td>
                    <td className="p-3.5 text-center font-mono">{ad.impressions}</td>
                    <td className="p-3.5 text-center font-mono text-cyan-400">{ad.clicks}</td>
                    <td className="p-3.5 text-right font-mono text-emerald-400 font-bold">
                      {ctr}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
