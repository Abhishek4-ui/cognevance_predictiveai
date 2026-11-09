import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Gauge, CheckCircle, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ModelEvaluationPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [modelDetails, setModelDetails] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models/list');
        setModels(res.data);
        if (res.data.length > 0) {
          setSelectedModelId(res.data[0].model_id);
          setModelDetails(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchModels();
  }, []);

  const handleSelect = (id) => {
    setSelectedModelId(id);
    const m = models.find((item) => item.model_id === id);
    setModelDetails(m);
  };

  const metrics = modelDetails?.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Gauge className="w-6 h-6 text-electric-400" />
            <span>In-Depth Model Evaluation Studio</span>
          </h1>
          <p className="text-xs text-slate-400">Confusion matrices, residual distributions, classification reports, and untouched test splits.</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Select Model:</span>
          <select
            value={selectedModelId}
            onChange={(e) => handleSelect(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
          >
            {models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_name} ({m.algorithm})
              </option>
            ))}
          </select>
        </div>
      </div>

      {modelDetails && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {metrics.accuracy !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Accuracy</span>
                <p className="text-2xl font-bold text-electric-400">{(metrics.accuracy * 100).toFixed(2)}%</p>
              </div>
            )}
            {metrics.f1_score !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Weighted F1-Score</span>
                <p className="text-2xl font-bold text-neon-purple">{(metrics.f1_score * 100).toFixed(2)}%</p>
              </div>
            )}
            {metrics.precision !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Precision</span>
                <p className="text-2xl font-bold text-emerald-400">{(metrics.precision * 100).toFixed(2)}%</p>
              </div>
            )}
            {metrics.recall !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Recall (Sensitivity)</span>
                <p className="text-2xl font-bold text-amber-400">{(metrics.recall * 100).toFixed(2)}%</p>
              </div>
            )}
            {metrics.r2 !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">R² Goodness of Fit</span>
                <p className="text-2xl font-bold text-electric-400">{(metrics.r2 * 100).toFixed(2)}%</p>
              </div>
            )}
            {metrics.rmse !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Root Mean Sq. Error</span>
                <p className="text-2xl font-bold text-white">{metrics.rmse}</p>
              </div>
            )}
            {metrics.mae !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Mean Absolute Error</span>
                <p className="text-2xl font-bold text-white">{metrics.mae}</p>
              </div>
            )}
            {metrics.silhouette_score !== undefined && (
              <div className="p-4 rounded-xl glass-panel space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Silhouette Score</span>
                <p className="text-2xl font-bold text-emerald-400">{metrics.silhouette_score}</p>
              </div>
            )}
          </div>

          {/* Confusion Matrix Table */}
          {metrics.confusion_matrix && (
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white tracking-wide">Confusion Matrix Heatmap</h3>
                <span className="text-xs text-slate-400">Actual vs Predicted Counts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono max-w-lg mx-auto">
                  <thead className="bg-navy-900 text-slate-400 text-[10px]">
                    <tr>
                      <th className="p-3">Actual / Predicted</th>
                      <th className="p-3 text-electric-400 font-bold">Predicted Negative</th>
                      <th className="p-3 text-neon-purple font-bold">Predicted Positive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    <tr>
                      <td className="p-3 text-left font-sans text-slate-300 font-semibold">Actual Negative</td>
                      <td className="p-3 bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                        {metrics.confusion_matrix_raw ? metrics.confusion_matrix_raw[0]?.[0] : 0} (TN)
                      </td>
                      <td className="p-3 bg-red-500/10 text-red-400 font-bold text-sm">
                        {metrics.confusion_matrix_raw ? metrics.confusion_matrix_raw[0]?.[1] : 0} (FP)
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-left font-sans text-slate-300 font-semibold">Actual Positive</td>
                      <td className="p-3 bg-red-500/10 text-red-400 font-bold text-sm">
                        {metrics.confusion_matrix_raw ? metrics.confusion_matrix_raw[1]?.[0] : 0} (FN)
                      </td>
                      <td className="p-3 bg-emerald-500/10 text-emerald-400 font-bold text-sm">
                        {metrics.confusion_matrix_raw ? metrics.confusion_matrix_raw[1]?.[1] : 0} (TP)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actual vs Predicted Samples (For Regression) */}
          {metrics.actual_vs_predicted_samples && (
            <div className="p-6 rounded-2xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide">Actual vs Predicted Samples</h3>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-navy-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Sample Index</th>
                      <th className="py-2 px-3">Actual Value</th>
                      <th className="py-2 px-3">Model Prediction</th>
                      <th className="py-2 px-3">Residual (Delta)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800/60">
                    {metrics.actual_vs_predicted_samples.slice(0, 15).map((row, i) => (
                      <tr key={i} className="hover:bg-navy-850/50">
                        <td className="py-1.5 px-3 text-slate-500">#{row.index}</td>
                        <td className="py-1.5 px-3 text-white font-semibold">{row.actual}</td>
                        <td className="py-1.5 px-3 text-electric-400 font-semibold">{row.predicted}</td>
                        <td className={`py-1.5 px-3 ${Math.abs(row.residual) > 5 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {row.residual}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelEvaluationPage;
