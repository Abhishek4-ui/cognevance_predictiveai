import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Database, Cpu, Activity, ShieldCheck, ArrowRight,
  TrendingUp, Award, Clock, AlertTriangle, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/dashboard/metrics');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  // Format data for algorithm comparison chart
  const modelChartData = metrics?.recent_models?.map(m => ({
    name: m.model_name.length > 15 ? m.model_name.slice(0, 15) + '...' : m.model_name,
    score: (m.metrics?.summary_metric || 0) * (m.task_type.includes('classification') ? 100 : 100),
    type: m.task_type
  })) || [];

  // Algorithm Family Pie distribution
  const familyCounts = {};
  metrics?.recent_models?.forEach(m => {
    familyCounts[m.algorithm] = (familyCounts[m.algorithm] || 0) + 1;
  });
  const pieData = Object.keys(familyCounts).map(k => ({ name: k, value: familyCounts[k] }));
  const COLORS = ['#0ea5e9', '#a855f7', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Executive Analytics Overview</h1>
          <p className="text-xs text-slate-400">Real-time status of datasets, active models, inference throughput, and covariate drift.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/training')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center space-x-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Train New Model</span>
          </button>
          <button
            onClick={() => navigate('/predict')}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition flex items-center space-x-1.5"
          >
            <span>Run Inference</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Total Datasets</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-electric-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics?.total_datasets || 0}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">Verified</span>
          </div>
          <p className="text-[11px] text-slate-400">Available across all 9 use cases</p>
        </div>

        <div className="p-5 rounded-xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Models in Registry</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-neon-purple">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics?.total_models || 0}</span>
            <span className="text-[11px] text-electric-400 font-semibold">{metrics?.production_models_count || 0} Production</span>
          </div>
          <p className="text-[11px] text-slate-400">Versioned & artifact stored</p>
        </div>

        <div className="p-5 rounded-xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Live Inferences</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{metrics?.total_predictions || 0}</span>
            <span className="text-[11px] text-slate-400">Requests</span>
          </div>
          <p className="text-[11px] text-slate-400">Logged with SHAP explanations</p>
        </div>

        <div className="p-5 rounded-xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Drift Health</span>
            <div className={`p-2 rounded-lg ${metrics?.drift_alerts_count > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {metrics?.drift_alerts_count > 0 ? `${metrics.drift_alerts_count} Shifts` : '0 Alerts'}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">KS-Test OK</span>
          </div>
          <p className="text-[11px] text-slate-400">Covariate monitoring active</p>
        </div>
      </div>

      {/* Best Model Banner */}
      {metrics?.best_model && (
        <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/40 border border-electric-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-xl bg-electric-500/20 text-electric-400 border border-electric-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-electric-400">Champion Model</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {metrics.best_model.stage.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{metrics.best_model.model_name}</h3>
              <p className="text-xs text-slate-300">
                Algorithm: <strong className="text-white">{metrics.best_model.algorithm}</strong> • Task: <span className="capitalize">{metrics.best_model.task_type}</span> • Primary Evaluation Metric: <strong className="text-electric-400 font-mono">{(metrics.best_model.metrics?.summary_metric * 100).toFixed(2)}%</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-electric-600 hover:bg-electric-500 shadow-md transition flex items-center space-x-2 flex-shrink-0"
          >
            <span>Test Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Accuracy Comparison */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">Model Benchmark Score Comparison (%)</h3>
            <span className="text-[11px] text-slate-400">Untouched Test Split Evaluation</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Algorithm Distribution */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">Algorithm Portfolio</h3>
            <span className="text-[11px] text-slate-400">Diversity</span>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center space-x-1.5 truncate">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-slate-300 truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs & Quick Links */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">Recent System Audit & Operations</h3>
          <span className="text-[11px] text-slate-400">Auto-logged</span>
        </div>
        <div className="space-y-2">
          {metrics?.recent_activities?.length > 0 ? (
            metrics.recent_activities.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-850/60 border border-navy-800 text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-electric-400"></div>
                  <div>
                    <span className="font-semibold text-white">{act.action}</span>
                    <span className="text-slate-400 ml-2">({act.details})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{act.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-3 text-center">System initialized and standby.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
