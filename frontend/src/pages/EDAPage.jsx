import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  BarChart3, Database, ShieldAlert, Sparkles, Sliders,
  HelpCircle, AlertTriangle, CheckCircle, Info
} from 'lucide-react';

const EDAPage = () => {
  const [searchParams] = useSearchParams();
  const fileParam = searchParams.get('file');

  const [datasets, setDatasets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(fileParam || '');
  const [targetColumn, setTargetColumn] = useState('');
  const [edaData, setEdaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeHistogramCol, setActiveHistogramCol] = useState('');

  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const res = await api.get('/datasets/list');
        setDatasets(res.data);
        if (!selectedFile && res.data.length > 0) {
          setSelectedFile(res.data[0].filename);
        }
      } catch (err) {
        console.error('Failed to load dataset options', err);
      }
    };
    loadDatasets();
  }, []);

  const runAnalysis = async (filename, target = '') => {
    if (!filename) return;
    setLoading(true);
    try {
      const url = target
        ? `/eda/analyze?filename=${encodeURIComponent(filename)}&target_column=${encodeURIComponent(target)}`
        : `/eda/analyze?filename=${encodeURIComponent(filename)}`;
      const res = await api.get(url);
      setEdaData(res.data);
      if (res.data.descriptive_statistics?.length > 0) {
        setActiveHistogramCol(res.data.descriptive_statistics[0].column);
      }
    } catch (err) {
      console.error('Failed to run EDA', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      runAnalysis(selectedFile, targetColumn);
    }
  }, [selectedFile]);

  const activeHistData = edaData?.descriptive_statistics?.find(s => s.column === activeHistogramCol)?.histogram || [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-electric-400" />
            <span>Automated Exploratory Data Analysis</span>
          </h1>
          <p className="text-xs text-slate-400">Descriptive statistics, distribution skews, correlation analysis, and data quality scoring.</p>
        </div>

        {/* Dataset selection controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">Dataset:</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white focus:outline-none focus:border-electric-500 font-mono"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.filename}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runAnalysis(selectedFile, targetColumn)}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-electric-600 hover:bg-electric-500 shadow-md transition"
          >
            {loading ? 'Analyzing...' : 'Refresh EDA'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
        </div>
      )}

      {edaData && !loading && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Rows</span>
              <p className="text-xl font-bold text-white">{edaData.summary.total_rows}</p>
            </div>
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Features</span>
              <p className="text-xl font-bold text-white">{edaData.summary.total_columns}</p>
            </div>
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Numerical</span>
              <p className="text-xl font-bold text-electric-400">{edaData.summary.numeric_columns_count}</p>
            </div>
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Categorical</span>
              <p className="text-xl font-bold text-neon-purple">{edaData.summary.categorical_columns_count}</p>
            </div>
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Missing Cells</span>
              <p className={`text-xl font-bold ${edaData.missing_values.total_missing_cells > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {edaData.missing_values.total_missing_percentage}%
              </p>
            </div>
            <div className="p-4 rounded-xl glass-panel space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Quality Score</span>
              <p className="text-xl font-bold text-white">{edaData.summary.quality_score} / 100</p>
            </div>
          </div>

          {/* Interactive Feature Histogram */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Feature Distribution Histogram</h3>
                <p className="text-xs text-slate-400">Empirical distribution of values partitioned into dynamic Freedman-Diaconis bins.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Inspect Column:</span>
                <select
                  value={activeHistogramCol}
                  onChange={(e) => setActiveHistogramCol(e.target.value)}
                  className="py-1 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-electric-400 focus:outline-none focus:border-electric-500 font-mono"
                >
                  {edaData.descriptive_statistics.map((s) => (
                    <option key={s.column} value={s.column}>
                      {s.column}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeHistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="bin_start" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Descriptive Statistics Table */}
          <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">Descriptive Numerical Statistics</h3>
              <span className="text-xs text-slate-400">Rigorous 5-point summary with Skewness & Kurtosis</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-navy-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-navy-800 font-sans">
                  <tr>
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3">Mean</th>
                    <th className="py-2.5 px-3">Std Dev</th>
                    <th className="py-2.5 px-3">Min</th>
                    <th className="py-2.5 px-3">Q25</th>
                    <th className="py-2.5 px-3">Median</th>
                    <th className="py-2.5 px-3">Q75</th>
                    <th className="py-2.5 px-3">Max</th>
                    <th className="py-2.5 px-3">IQR</th>
                    <th className="py-2.5 px-3">Skewness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-[11px]">
                  {edaData.descriptive_statistics.map((s) => (
                    <tr key={s.column} className="hover:bg-navy-850/50 transition">
                      <td className="py-2 px-3 font-semibold text-white">{s.column}</td>
                      <td className="py-2 px-3 text-slate-300">{s.mean}</td>
                      <td className="py-2 px-3 text-slate-400">{s.std}</td>
                      <td className="py-2 px-3 text-slate-400">{s.min}</td>
                      <td className="py-2 px-3 text-slate-400">{s.q25}</td>
                      <td className="py-2 px-3 text-electric-400 font-semibold">{s.median}</td>
                      <td className="py-2 px-3 text-slate-400">{s.q75}</td>
                      <td className="py-2 px-3 text-slate-400">{s.max}</td>
                      <td className="py-2 px-3 text-slate-400">{s.iqr}</td>
                      <td className={`py-2 px-3 ${Math.abs(s.skewness) > 1 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {s.skewness}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Correlation Matrix Heatmap */}
          {edaData.correlations?.matrix?.length > 0 && (
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide">Pearson Correlation Matrix</h3>
              <div className="overflow-x-auto">
                <table className="text-xs font-mono">
                  <thead>
                    <tr>
                      <th className="p-2 text-slate-400"></th>
                      {edaData.correlations.columns.map(c => (
                        <th key={c} className="p-2 text-slate-300 text-[10px] truncate max-w-[80px]" title={c}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {edaData.correlations.columns.map((c1, i) => (
                      <tr key={c1}>
                        <td className="p-2 text-slate-300 text-[10px] font-semibold truncate max-w-[90px]">{c1}</td>
                        {edaData.correlations.matrix[i].map((val, j) => {
                          const bgIntensity = Math.abs(val);
                          const color = val >= 0 ? `rgba(14, 165, 233, ${bgIntensity * 0.7})` : `rgba(236, 72, 153, ${bgIntensity * 0.7})`;
                          return (
                            <td
                              key={j}
                              className="p-2 text-center text-[10px] font-medium"
                              style={{ backgroundColor: color }}
                            >
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Outlier Detection Summary */}
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide">Outlier Detection (1.5 × IQR Boundary)</h3>
            {edaData.outliers?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {edaData.outliers.map((o) => (
                  <div key={o.column} className="p-3 rounded-lg bg-navy-850/80 border border-navy-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{o.column}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 font-mono">
                        {o.outlier_count} ({o.percentage}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Normal Bounds: [{o.lower_bound}, {o.upper_bound}]
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>No significant outliers detected outside IQR fences.</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EDAPage;
