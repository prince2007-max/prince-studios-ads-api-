export type AdType = 'image' | 'video' | 'html';
export type AdPlacement = 'preshow' | 'intermission' | 'banner' | 'popup' | 'sidebar';

export interface Ad {
  _id: string;
  id?: string;
  title: string;
  advertiser: string;
  adType: AdType;
  mediaUrl: string;
  htmlContent: string;
  targetUrl: string;
  ctaText: string;
  placement: AdPlacement[];
  priority: number;
  startDate?: string;
  endDate?: string | null;
  targetPages?: string[];
  isActive: boolean;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export interface ApiKeyItem {
  _id: string;
  name: string;
  key: string;
  domain: string;
  isActive: boolean;
  requests: number;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: string;
  typeBreakdown: {
    image: number;
    video: number;
    html: number;
  };
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}
