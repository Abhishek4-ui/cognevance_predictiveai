import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sliders, Sparkles, BarChart, Layers, ArrowRight, CheckCircle2, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const FeatureEngineeringPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [featureRankings, setFeatureRankings] = useState([]);
  const [pcaVariance, setPcaVariance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets/list');
        setDatasets(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          setSelectedFile(first.filename);
          setTargetColumn(first.target_column || '');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDatasets();
  }, []);

  const handleCompute = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/feature-engineering/rank', {
        filename: selectedFile,
        target_column: targetColumn || null,
        k_components: 3
      });

      setFeatureRankings(res.data.feature_importances);
      setPcaVariance(res.data.pca_variance);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to compute real feature rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleCompute();
    }
  }, [selectedFile]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-electric-400" />
            <span>Feature Engineering & Selection Studio</span>
          </h1>
          <p className="text-xs text-slate-400">Random Forest feature importance attribution, PCA variance ratio decomposition, and screening.</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.filename}>
                {d.filename}
              </option>
            ))}
          </select>
          <button
            onClick={handleCompute}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-electric-600 hover:bg-electric-500 shadow-md transition"
          >
            {loading ? 'Evaluating Model...' : 'Recompute Rankings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* PCA & Summary KPI Bar */}
      {pcaVariance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl glass-panel space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Features Evaluated</span>
            <p className="text-xl font-bold text-white">{featureRankings.length}</p>
          </div>
          <div className="p-4 rounded-xl glass-panel space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">PCA Total Variance Captured</span>
            <p className="text-xl font-bold text-electric-400">
              {(pcaVariance.total_explained_variance * 100).toFixed(2)}%
            </p>
          </div>
          <div className="p-4 rounded-xl glass-panel space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Principal Components (Top 3)</span>
            <p className="text-xs font-mono text-neon-purple pt-1">
              PC1: {(pcaVariance.explained_variance_ratio[0] * 100).toFixed(1)}% • PC2: {(pcaVariance.explained_variance_ratio[1] * 100).toFixed(1)}% • PC3: {(pcaVariance.explained_variance_ratio[2] * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Feature Importance Chart */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide">Feature Gini Importance Ranking (Random Forest Ensemble)</h3>
          <span className="text-xs text-slate-400">Top Predictive Signals</span>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={featureRankings.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis dataKey="feature" type="category" stroke="#64748b" width={140} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="importance" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Ranking Table */}
      <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
        <h3 className="text-sm font-bold text-white tracking-wide">Detailed Feature Attribution Leaderboard</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800">
              <tr>
                <th className="py-2.5 px-4 w-16">Rank</th>
                <th className="py-2.5 px-4">Feature Name</th>
                <th className="py-2.5 px-4">Gini Score</th>
                <th className="py-2.5 px-4">Relative Weight</th>
                <th className="py-2.5 px-4">Screening Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
              {featureRankings.map((f, idx) => (
                <tr key={f.feature} className="hover:bg-navy-850/50">
                  <td className="py-2.5 px-4 text-slate-400 font-bold">#{idx + 1}</td>
                  <td className="py-2.5 px-4 font-semibold text-white font-sans">{f.feature}</td>
                  <td className="py-2.5 px-4 text-electric-400">{f.importance}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                        <div className="h-full bg-neon-purple" style={{ width: `${Math.min(100, f.percentage * 2)}%` }}></div>
                      </div>
                      <span className="text-slate-300">{f.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${idx < 6 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {idx < 6 ? 'KEEP (High Impact)' : 'OPTIONAL (Low Weight)'}
                    </span>
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

export default FeatureEngineeringPage;
