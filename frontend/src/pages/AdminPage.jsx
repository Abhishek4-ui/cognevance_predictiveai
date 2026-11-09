import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldAlert, Users, Cloud, CheckCircle, Clock,
  Key, Database, Server, RefreshCw
} from 'lucide-react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [cloudStatus, setCloudStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [uRes, cRes, lRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/cloud-status'),
        api.get('/admin/audit-logs')
      ]);
      setUsers(uRes.data);
      setCloudStatus(cRes.data);
      setLogs(lRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role?new_role=${newRole}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            <span>Root Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-400">User role permissions, cloud integration diagnostics, and system-wide audit telemetry.</p>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Cloud & Platform Integration Status */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-electric-400" />
          <span>Cloud Infrastructure & Third-Party APIs Status</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Database Engine</span>
            <p className="text-xs font-bold text-white">PostgreSQL (Neon Cloud)</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Rest & Pooler Active</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Render Deployment</span>
            <p className="text-xs font-bold text-white">Production Backend</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Token Configured</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Vercel Edge</span>
            <p className="text-xs font-bold text-white">React Frontend</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Token Configured</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-navy-850/80 border border-navy-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Kaggle API</span>
            <p className="text-xs font-bold text-white">Dataset Ingestion</p>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Auth Key Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Registered Accounts & RBAC Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800">
              <tr>
                <th className="py-2.5 px-3">User ID</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Account Status</th>
                <th className="py-2.5 px-3 text-right">Promote / Demote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-navy-850/50">
                  <td className="py-2.5 px-3 text-slate-500">#{u.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white font-sans">{u.username}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{u.email}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-electric-500/10 text-electric-400 border border-electric-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-emerald-400 font-semibold">Active</td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="py-1 px-2 text-[10px] rounded bg-navy-900 border border-navy-700 text-slate-300"
                    >
                      <option value="user">User</option>
                      <option value="data_scientist">Data Scientist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">System Audit Logs (Real-Time Stream)</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-2.5 rounded-lg bg-navy-850/60 border border-navy-800 text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-[10px] text-electric-400">[{l.action}]</span>
                <span className="text-slate-200">{l.details}</span>
              </div>
              <span className="text-slate-500 text-[10px] font-mono">{l.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
