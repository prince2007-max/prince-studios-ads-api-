import React, { useState, useEffect } from 'react';
import { Ad } from '../types';
import { api } from '../services/api';
import { Megaphone, Plus, Trash2, Edit3 } from 'lucide-react';

interface CampaignsProps {
  onOpenCreateModal: () => void;
  onEditAd: (ad: Ad) => void;
}

export const Campaigns: React.FC<CampaignsProps> = ({ onOpenCreateModal, onEditAd }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

 const loadAds = async () => {

  try {
    const data = await api.getAds();
    setAds(data);
  } catch (e) {
    console.error('Error fetching ads:', e);
  } 
};

  useEffect(() => {
    loadAds();
  }, []);

  const handleToggleActive = async (ad: Ad) => {
    try {
      const id = ad._id || ad.id || '';
      await api.updateAd(id, { isActive: !ad.isActive });
      loadAds();
    } catch (e: any) {
      alert(e.message || 'Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this ad campaign?')) {
      try {
        await api.deleteAd(id);
        loadAds();
      } catch (e: any) {
        alert(e.message || 'Error deleting ad');
      }
    }
  };

  const filteredAds = ads.filter((ad) => {
    if (filterType === 'all') return true;
    return ad.adType === filterType;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-cyan-400" />
            <span>Ad Campaign Manager</span>
          </h2>
          <p className="text-xs text-neutral-400">
            Create, edit, target and publish Image, Video, and HTML Code Ads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Format Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs font-bold outline-none"
          >
            <option value="all">All Formats</option>
            <option value="image">Image Ads</option>
            <option value="video">Video Ads</option>
            <option value="html">HTML Code Ads</option>
          </select>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAds.map((ad) => {
          const id = ad._id || ad.id || '';
          return (
            <div
              key={id}
              className="flex flex-col justify-between rounded-3xl bg-neutral-900/80 border border-white/10 overflow-hidden shadow-xl hover:border-cyan-500/40 transition-all p-4 gap-3"
            >
              {/* Media Preview Box */}
              <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                {ad.adType === 'video' ? (
                  <video src={ad.mediaUrl} controls className="w-full h-full object-cover" />
                ) : ad.adType === 'image' ? (
                  <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="p-3 text-[10px] w-full h-full overflow-hidden text-cyan-300 font-mono"
                    dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
                  />
                )}

                <span className="absolute top-2 left-2 bg-black/80 text-cyan-400 font-black text-[9px] uppercase px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {ad.adType}
                </span>

                <span className="absolute top-2 right-2 bg-black/80 text-amber-300 font-black text-[9px] px-2 py-0.5 rounded-full border border-amber-500/30">
                  Priority: {ad.priority}
                </span>
              </div>

              {/* Campaign Content Details */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white truncate">{ad.title}</h3>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      ad.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {ad.isActive ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>

                <p className="text-[10px] text-neutral-400">
                  Sponsor: {ad.advertiser} · Placements: {ad.placement.join(', ')}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono">
                <div>
                  <span className="text-neutral-400 text-[9px] uppercase block">Impressions</span>
                  <span className="font-bold text-white">{ad.impressions}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[9px] uppercase block">Clicks</span>
                  <span className="font-bold text-cyan-400">{ad.clicks}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[9px] uppercase block">CTR</span>
                  <span className="font-bold text-emerald-400">
                    {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <button
                  onClick={() => handleToggleActive(ad)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    ad.isActive
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {ad.isActive ? 'Pause' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditAd(ad)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer"
                    title="Edit Campaign"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
