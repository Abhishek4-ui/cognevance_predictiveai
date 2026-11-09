import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, Radio } from 'lucide-react';

const MonitoringPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [driftReport, setDriftReport] = useState(null);
  const [checking, setChecking] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models/list');
        setModels(res.data);
        if (res.data.length > 0) {
          setSelectedModelId(res.data[0].model_id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchLogs = async () => {
      try {
        const res = await api.get('/monitoring/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchModels();
    fetchLogs();
  }, []);

  const handleRunDriftCheck = async () => {
    if (!selectedModelId) return;
    setChecking(true);
    try {
      const res = await api.post('/monitoring/drift-check', {
        model_id: selectedModelId,
        sample_size: 250
      });
      setDriftReport(res.data.results);
      // Refresh logs
      const logRes = await api.get('/monitoring/logs');
      setLogs(logRes.data);
    } catch (err) {
      alert('Failed to execute drift detection');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-electric-400" />
            <span>Covariate Shift & Data Drift Monitoring</span>
          </h1>
          <p className="text-xs text-slate-400">Two-sample Kolmogorov-Smirnov hypothesis testing and Population Stability Index (PSI) drift tracking.</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
          >
            {models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunDriftCheck}
            disabled={checking}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Analyzing Shift...' : 'Run Live Drift Test'}</span>
          </button>
        </div>
      </div>

      {/* Drift Status Banner */}
      {driftReport && (
        <div className={`p-6 rounded-2xl glass-panel border ${driftReport.drift_detected ? 'border-amber-500/40 bg-amber-950/20' : 'border-emerald-500/40 bg-emerald-950/20'} space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {driftReport.drift_detected ? (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {driftReport.drift_detected ? 'Potential Distribution Drift Detected' : 'All Monitored Features Distribution Stable'}
                </h3>
                <p className="text-xs text-slate-300">
                  {driftReport.drifted_features_count} of {driftReport.total_features_analyzed} features exhibit statistically significant drift ({driftReport.drift_share_percentage}%)
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${driftReport.drift_detected ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {driftReport.alert_level}
            </span>
          </div>
        </div>
      )}

      {/* Feature-by-Feature Table */}
      {driftReport && (
        <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
          <h3 className="text-sm font-bold text-white tracking-wide">Feature Drift Statistical Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800 font-sans">
                <tr>
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">KS Statistic</th>
                  <th className="py-2.5 px-3">p-value</th>
                  <th className="py-2.5 px-3">PSI Index</th>
                  <th className="py-2.5 px-3">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-[11px]">
                {driftReport.feature_details.map((f) => (
                  <tr key={f.feature} className="hover:bg-navy-850/50">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{f.feature}</td>
                    <td className="py-2.5 px-3 text-slate-300">{f.ks_statistic}</td>
                    <td className={`py-2.5 px-3 ${f.p_value < 0.05 ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                      {f.p_value}
                    </td>
                    <td className={`py-2.5 px-3 ${f.psi > 0.2 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {f.psi}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${f.status === 'STABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drift Log History */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">Historical Drift Audit Log</h3>
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-navy-850/60 border border-navy-800 text-xs">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${l.drift_detected ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <div>
                  <span className="font-semibold text-white">{l.model_id}</span>
                  <span className="text-slate-400 ml-2">({l.drift_share_pct}% drift share)</span>
                </div>
              </div>
              <span className="text-slate-500 text-[11px] font-mono">{l.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringPage;
