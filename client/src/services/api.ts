import { Ad, ApiKeyItem, AnalyticsOverview, User } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('prince_ads_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('prince_ads_jwt_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return data.success ? data.user : null;
    } catch {
      return null;
    }
  },

  // Ads Management
  async getAds(filter?: { placement?: string; adType?: string }): Promise<Ad[]> {
    const query = new URLSearchParams(filter as Record<string, string>).toString();
    const res = await fetch(`${API_BASE}/ads${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success ? data.data : [];
  },

  async createAd(adData: Partial<Ad>): Promise<Ad> {
    const res = await fetch(`${API_BASE}/ads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(adData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create ad');
    }
    return data.data;
  },

  async updateAd(id: string, adData: Partial<Ad>): Promise<Ad> {
    const res = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(adData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update ad');
    }
    return data.data;
  },

  async uploadMedia(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const res = await fetch(`${API_BASE}/ads/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              fileData,
              fileName: file.name,
              fileType: file.type.startsWith('video/') ? 'video' : 'image',
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Upload failed');
          }
          resolve(data.mediaUrl);
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  async deleteAd(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/ads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  async recordClick(id: string): Promise<void> {
    await fetch(`${API_BASE}/ads/click/${id}`, { method: 'POST' });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsOverview> {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success
      ? data.data
      : {
          totalAds: 0,
          activeAds: 0,
          totalImpressions: 0,
          totalClicks: 0,
          ctr: '0%',
          typeBreakdown: { image: 0, video: 0, html: 0 },
        };
  },

  // API Keys
  async getApiKeys(): Promise<ApiKeyItem[]> {
    const res = await fetch(`${API_BASE}/keys`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success ? data.data : [];
  },

  async createApiKey(name: string, domain = '*'): Promise<ApiKeyItem> {
    const res = await fetch(`${API_BASE}/keys`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, domain }),
    });
    const data = await res.json();
    return data.data;
  },

  async deleteApiKey(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/keys/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success;
  },
};
