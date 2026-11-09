import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Layers, CheckCircle, Clock, ArrowUpRight,
  ShieldCheck, RefreshCw, AlertCircle, FileCode
} from 'lucide-react';

const ModelRegistryPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

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

  useEffect(() => {
    fetchModels();
  }, []);

  const handleStageChange = async (modelId, newStage) => {
    setUpdatingId(modelId);
    try {
      await api.patch(`/models/${modelId}/stage`, { stage: newStage });
      fetchModels();
    } catch (err) {
      alert('Failed to update stage');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-neon-purple" />
            <span>MLOps Model Registry & Lifecycle Catalog</span>
          </h1>
          <p className="text-xs text-slate-400">Strict stage governance: Staging, Production, and Archived models with verified rollback controls.</p>
        </div>

        <button
          onClick={fetchModels}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Registry</span>
        </button>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {models.map((m) => {
          const isProd = m.stage === 'production';
          const isStaging = m.stage === 'staging';

          return (
            <div key={m.model_id} className="p-5 rounded-2xl glass-panel space-y-4 border border-navy-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${isProd ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : isStaging ? 'bg-electric-500/10 text-electric-400 border border-electric-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {m.stage.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">v{m.version}</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{m.model_name}</h3>
                  <p className="text-[11px] text-slate-400">
                    Algorithm: <strong className="text-slate-200 capitalize">{m.algorithm.replace(/_/g, ' ')}</strong>
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-navy-900/80 border border-navy-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Score Metric:</span>
                    <span className="text-white font-bold">
                      {m.metrics?.summary_metric ? `${(m.metrics.summary_metric * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Features:</span>
                    <span className="text-slate-300">{m.features?.length || 0} inputs</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 truncate" title={m.model_id}>
                  ID: <span className="font-mono text-slate-400">{m.model_id}</span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between gap-2">
                {!isProd && (
                  <button
                    onClick={() => handleStageChange(m.model_id, 'production')}
                    disabled={updatingId === m.model_id}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition text-center"
                  >
                    Promote to Prod
                  </button>
                )}
                {isProd && (
                  <button
                    onClick={() => handleStageChange(m.model_id, 'staging')}
                    disabled={updatingId === m.model_id}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 bg-navy-800 hover:bg-navy-700 transition text-center"
                  >
                    Demote to Staging
                  </button>
                )}
                <button
                  onClick={() => handleStageChange(m.model_id, 'archived')}
                  disabled={updatingId === m.model_id || m.stage === 'archived'}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 bg-navy-850 hover:bg-navy-800 transition text-center"
                >
                  Archive
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelRegistryPage;
