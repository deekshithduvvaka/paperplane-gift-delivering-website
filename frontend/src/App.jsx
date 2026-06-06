import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import DispatchForm from './pages/DispatchForm';
import ReportsDashboard from './pages/ReportsDashboard';
import Unauthorized from './pages/Unauthorized';
import { Menu, Send, Shield, User, Loader2 } from 'lucide-react';

function DashboardLayout() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync menu state when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        <p className="text-sm text-slate-400 mt-3 font-semibold">Waking up Paper Plane dispatchers...</p>
      </div>
    );
  }

  // If no user authenticated, show login page
  if (!user) {
    return <Login />;
  }

  // Define tab pages content based on user roles
  const renderTabContent = () => {
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard onNavigateToCreate={() => setActiveTab('dispatch')} />;
        case 'dispatch':
          return <DispatchForm onCancel={() => setActiveTab('dashboard')} />;
        case 'reports':
          return <ReportsDashboard />;
        default:
          return <AdminDashboard onNavigateToCreate={() => setActiveTab('dispatch')} />;
      }
    } else if (user.role === 'agent') {
      switch (activeTab) {
        case 'dashboard':
          return <AgentDashboard />;
        default:
          return <Unauthorized onBackToDashboard={() => setActiveTab('dashboard')} />;
      }
    }
    return <Unauthorized onBackToDashboard={() => setActiveTab('dashboard')} />;
  };

  const getPageTitle = () => {
    if (user.role === 'admin') {
      if (activeTab === 'dashboard') return 'Deliveries Console';
      if (activeTab === 'dispatch') return 'Dispatch Form';
      if (activeTab === 'reports') return 'Performance Analytics';
    } else {
      return 'Courier Console';
    }
    return 'Paper Plane';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Sidebar drawer content */}
          <div className="relative flex flex-col z-10 animate-fade-in">
            <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            {/* Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 md:hidden transition-all active:scale-95"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Header Title Title */}
            <h1 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              {user.role === 'admin' ? (
                <Shield className="h-4.5 w-4.5 text-brand-500 hidden sm:inline" />
              ) : (
                <User className="h-4.5 w-4.5 text-brand-500 hidden sm:inline" />
              )}
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Origami logo indicator for mobile header */}
            <div className="md:hidden flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
              <Send className="h-3.5 w-3.5 text-brand-500 rotate-45 transform -translate-y-0.2 translate-x-0.2" />
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-widest font-sans">PP</span>
            </div>
          </div>
        </header>

        {/* Content Panel Frame */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DashboardLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
