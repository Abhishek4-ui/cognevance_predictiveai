import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Calendar, Key, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <User className="w-6 h-6 text-electric-400" />
          <span>User Profile & Security Identity</span>
        </h1>
        <p className="text-xs text-slate-400">Authenticated account details, RBAC roles, and active sessions.</p>
      </div>

      <div className="p-8 rounded-2xl glass-panel border border-navy-800 space-y-6">
        <div className="flex items-center space-x-4 border-b border-navy-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-electric-500 to-neon-purple flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-electric-500/20">
            {user?.username ? user.username[0].toUpperCase() : 'A'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.full_name || user?.username || 'Admin User'}</h2>
            <p className="text-xs text-slate-400 font-mono">@{user?.username || 'admin'}</p>
            <div className="flex items-center space-x-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-electric-500/10 text-electric-400 border border-electric-500/20 uppercase">
                {user?.role || 'Administrator'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
            </span>
            <p className="font-medium text-white truncate">{user?.email || 'admin@predictai.pro'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Security Clearance</span>
            </span>
            <p className="font-medium text-white capitalize">{user?.role === 'admin' ? 'Full Admin Root' : 'Data Scientist'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Token Type</span>
            </span>
            <p className="font-mono text-electric-400">JSON Web Token (HS256)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Token Expiry</span>
            </span>
            <p className="font-medium text-slate-300">24 Hours (Rolling)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
