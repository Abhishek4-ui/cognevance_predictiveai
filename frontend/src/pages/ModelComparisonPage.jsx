import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Scale, Award, TrendingUp, CheckCircle, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ModelComparisonPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models/list');
        setModels(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const chartData = models.map((m) => ({
    name: m.model_name.length > 18 ? m.model_name.slice(0, 18) + '...' : m.model_name,
    score: Number(((m.metrics?.summary_metric || 0) * 100).toFixed(2)),
    algorithm: m.algorithm,
    stage: m.stage
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Scale className="w-6 h-6 text-electric-400" />
          <span>Cross-Model Comparative Benchmarks</span>
        </h1>
        <p className="text-xs text-slate-400">Head-to-head comparison of all registered models across predictive accuracy, training speed, and generalization.</p>
      </div>

      {/* Comparison Chart */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">Model Benchmark Score Comparison (%)</h3>
          <span className="text-xs text-slate-400">Higher is Better</span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="score" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Models Comparative Table */}
      <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Registered Model Benchmark Scorecard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800 font-sans">
              <tr>
                <th className="py-3 px-4">Model Name</th>
                <th className="py-3 px-4">Task Domain</th>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Evaluation Score</th>
                <th className="py-3 px-4">Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 text-[11px]">
              {models.map((m) => (
                <tr key={m.model_id} className="hover:bg-navy-850/50">
                  <td className="py-3 px-4 font-semibold text-white font-sans">{m.model_name}</td>
                  <td className="py-3 px-4 capitalize font-sans text-slate-300">{m.task_type}</td>
                  <td className="py-3 px-4 text-electric-400">{m.algorithm}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.stage === 'production' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {m.stage.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {m.metrics?.summary_metric ? `${(m.metrics.summary_metric * 100).toFixed(2)}%` : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {m.features?.length || 0} columns
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonPage;
