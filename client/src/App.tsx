import React, { useState, useEffect } from 'react';
import { User, Ad } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdModal } from './components/AdModal';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { Analytics } from './pages/Analytics';
import { ApiKeys } from './pages/ApiKeys';
import { ApiDocs } from './pages/ApiDocs';
import { Login } from './pages/Login';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    // Verify active JWT user session
    api.getCurrentUser()
      .then((userData) => {
        if (userData && userData.role === 'admin') {
          setUser(userData);
        } else {
          setUser(null);
          localStorage.removeItem('prince_ads_jwt_token');
        }
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('prince_ads_jwt_token');
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('prince_ads_jwt_token');
    setUser(null);
  };

  const handleOpenCreateModal = () => {
    setEditingAd(null);
    setIsAdModalOpen(true);
  };

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setIsAdModalOpen(true);
  };

  const handleSaveAd = async (adData: Partial<Ad>) => {
    if (editingAd) {
      const id = editingAd._id || editingAd.id || '';
      await api.updateAd(id, adData);
    } else {
      await api.createAd(adData);
    }
    setIsAdModalOpen(false);
    setEditingAd(null);
  };

  // Loading spinner while checking authentication token
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 animate-spin flex items-center justify-center p-1 shadow-lg shadow-cyan-900/50">
          <div className="h-full w-full bg-neutral-950 rounded-xl" />
        </div>
        <p className="text-xs text-neutral-400 font-mono font-bold tracking-wider">
          AUTHENTICATING PRINCE ADS ADMIN...
        </p>
      </div>
    );
  }

  // Redirect unauthenticated users directly to Login Screen
  if (!user) {
    return (
      <Login
        onLoginSuccess={(_token, userData) => {
          setUser(userData);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Layout Body */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAuthenticated={!!user} />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenCreateModal={handleOpenCreateModal}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'campaigns' && (
            <Campaigns
              onOpenCreateModal={handleOpenCreateModal}
              onEditAd={handleEditAd}
            />
          )}

          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'apikeys' && <ApiKeys />}

          {activeTab === 'apidocs' && <ApiDocs />}
        </main>
      </div>

      {/* Campaign Create/Edit Modal */}
      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onSave={handleSaveAd}
        editingAd={editingAd}
      />
    </div>
  );
}

export default App;
