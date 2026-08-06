import React, { useState, useEffect } from 'react';
import { Ad, AdType, AdPlacement } from '../types';
import { X, Plus, Image, Video, Code, Upload } from 'lucide-react';
import { api } from '../services/api';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (adData: Partial<Ad>) => Promise<void>;
  editingAd?: Ad | null;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onSave, editingAd }) => {
  const [title, setTitle] = useState('');
  const [advertiser, setAdvertiser] = useState('');
  const [adType, setAdType] = useState<AdType>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [priority, setPriority] = useState(5);
  const [placements, setPlacements] = useState<AdPlacement[]>(['banner']);
  const [targetPages, setTargetPages] = useState<string>('/cinema');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingAd) {
      setTitle(editingAd.title || '');
      setAdvertiser(editingAd.advertiser || '');
      setAdType(editingAd.adType || 'image');
      setMediaUrl(editingAd.mediaUrl || '');
      setHtmlContent(editingAd.htmlContent || '');
      setTargetUrl(editingAd.targetUrl || '');
      setCtaText(editingAd.ctaText || 'Learn More');
      setPriority(editingAd.priority || 5);
      setPlacements(editingAd.placement || ['banner']);
      setTargetPages(editingAd.targetPages?.join(', ') || '/cinema');
      setIsActive(editingAd.isActive !== undefined ? editingAd.isActive : true);
    } else {
      setTitle('');
      setAdvertiser('Prince Sponsor');
      setAdType('image');
      setMediaUrl('');
      setHtmlContent('');
      setTargetUrl('https://prince-studios.com');
      setCtaText('Learn More');
      setPriority(5);
      setPlacements(['banner', 'preshow']);
      setTargetPages('/cinema');
      setIsActive(true);
    }
  }, [editingAd, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await api.uploadMedia(file);
      setMediaUrl(uploadedUrl);
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Campaign Title is required.');
      return;
    }
    if (adType === 'html' && !htmlContent) {
      alert('HTML Code is required for HTML Ads.');
      return;
    }
    if (adType !== 'html' && !mediaUrl) {
      alert('Media URL or uploaded file is required for Image/Video Ads.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        title,
        advertiser,
        adType,
        mediaUrl,
        htmlContent,
        targetUrl,
        ctaText,
        priority: Number(priority),
        placement: placements,
        targetPages: targetPages.split(',').map((p) => p.trim()).filter(Boolean),
        isActive,
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error saving ad campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlacement = (pl: AdPlacement) => {
    if (placements.includes(pl)) {
      setPlacements(placements.filter((p) => p !== pl));
    } else {
      setPlacements([...placements, pl]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none text-white">
      <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-950/95 border border-cyan-500/30 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {editingAd ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
              </h2>
              <p className="text-xs text-neutral-400">Configure media assets, targeting & priority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Ad Type Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-neutral-300">Select Format</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setAdType('image')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                  adType === 'image'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                }`}
              >
                <Image className="h-4 w-4" />
                <span>Image Ad</span>
              </button>

              <button
                type="button"
                onClick={() => setAdType('video')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                  adType === 'video'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                }`}
              >
                <Video className="h-4 w-4" />
                <span>Video Stream</span>
              </button>

              <button
                type="button"
                onClick={() => setAdType('html')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                  adType === 'html'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
                }`}
              >
                <Code className="h-4 w-4" />
                <span>HTML Widget</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Campaign Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. VIP Cinema Pass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Advertiser Name</label>
              <input
                type="text"
                placeholder="e.g. Prince Studios"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Media URL vs HTML Code */}
          {adType !== 'html' ? (
            <div className="space-y-2">
              <label className="font-bold text-neutral-300">
                Media Asset ({adType.toUpperCase()}) *
              </label>

              {/* Upload file button */}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold transition-all text-xs">
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading Media...' : `Upload ${adType === 'video' ? 'Video' : 'Image'} File`}</span>
                  <input
                    type="file"
                    accept={adType === 'video' ? 'video/*' : 'image/*'}
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-500 font-medium">or paste direct media URL below</span>
              </div>

              <input
                type="url"
                required
                placeholder={
                  adType === 'video'
                    ? 'https://example.com/stream.mp4'
                    : 'https://images.unsplash.com/photo-...'
                }
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400 font-mono text-[11px]"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Custom HTML Code *</label>
              <textarea
                required
                rows={4}
                placeholder="<div style='color:red;'>Custom Ad Snippet</div>"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-white/10 text-cyan-300 outline-none focus:border-cyan-400 font-mono text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Target CTA Link URL</label>
              <input
                type="url"
                placeholder="https://prince-studios.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-300">CTA Button Label</label>
              <input
                type="text"
                placeholder="Learn More / Buy Ticket"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Priority Weight (1 to 10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-neutral-300">Target Router Pages</label>
              <input
                type="text"
                placeholder="/cinema, /vip, /all"
                value={targetPages}
                onChange={(e) => setTargetPages(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-neutral-300">Placements</label>
            <div className="flex flex-wrap items-center gap-3">
              {(['preshow', 'intermission', 'banner', 'popup', 'sidebar'] as AdPlacement[]).map(
                (pl) => (
                  <label key={pl} className="flex items-center gap-2 cursor-pointer capitalize">
                    <input
                      type="checkbox"
                      checked={placements.includes(pl)}
                      onChange={() => togglePlacement(pl)}
                      className="accent-cyan-400 h-4 w-4"
                    />
                    <span>{pl}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer mt-2"
          >
            {isSubmitting ? 'Saving Campaign...' : editingAd ? 'Update Ad Campaign' : 'Publish Ad Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
};
