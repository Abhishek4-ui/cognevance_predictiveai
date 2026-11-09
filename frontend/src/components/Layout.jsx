import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Database, BarChart3, Binary, Cpu, Scale,
  Gauge, Activity, Radio, FileText, User, ShieldAlert,
  LogOut, Sparkles, Layers, Sliders, Menu, X, Rocket, ChevronRight
} from 'lucide-react';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    {
      group: 'Overview',
      items: [
        { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Data Studio',
      items: [
        { name: 'Dataset Hub', path: '/datasets', icon: Database },
        { name: 'Exploratory EDA', path: '/eda', icon: BarChart3 },
        { name: 'Data Preprocessing', path: '/preprocessing', icon: Binary },
        { name: 'Feature Engineering', path: '/feature-engineering', icon: Sliders },
      ]
    },
    {
      group: 'Model Lab',
      items: [
        { name: 'Automated Training', path: '/training', icon: Cpu },
        { name: 'Model Comparison', path: '/comparison', icon: Scale },
        { name: 'Model Evaluation', path: '/evaluation', icon: Gauge },
      ]
    },
    {
      group: 'Production & MLOps',
      items: [
        { name: 'Prediction Workspace', path: '/predict', icon: Rocket },
        { name: 'Model Registry', path: '/registry', icon: Layers },
        { name: 'Deployment Ops', path: '/deployment', icon: Radio },
        { name: 'Drift & Monitoring', path: '/monitoring', icon: Activity },
        { name: 'Reports & Audits', path: '/reports', icon: FileText },
      ]
    },
    {
      group: 'System & Security',
      items: [
        { name: 'User Profile', path: '/profile', icon: User },
        ...(isAdmin ? [{ name: 'Admin Console', path: '/admin', icon: ShieldAlert }] : [])
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 border-r border-navy-800 transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col justify-between ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-navy-800">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-500 to-neon-purple flex items-center justify-center shadow-lg shadow-electric-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-electric-400 to-neon-purple bg-clip-text text-transparent">
                  PredictAI Pro
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-electric-400 font-semibold">Level 3 Enterprise</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navigation.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.group}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-gradient-to-r from-electric-600 to-electric-500 text-white shadow-md shadow-electric-500/20'
                          : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-electric-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-900/80">
          <div className="flex items-center justify-between p-2 rounded-lg bg-navy-850 border border-navy-800">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-pink-500 flex items-center justify-center font-bold text-xs">
                {user?.username ? user.username[0].toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold truncate text-white">{user?.username || 'Admin User'}</p>
                <p className="text-[10px] text-electric-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-navy-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-navy-800 bg-navy-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Core System Online</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-850 border border-navy-700/60 text-slate-300">
              <span className="text-slate-400">Environment:</span>
              <span className="font-semibold text-electric-400">macOS ARM64</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-850 border border-navy-700/60 text-slate-300">
              <span className="text-slate-400">Engine:</span>
              <span className="font-semibold text-neon-purple">PredictAI v1.0</span>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
