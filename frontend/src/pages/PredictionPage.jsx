import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Rocket, Sparkles, CheckCircle2, Clock, ShieldCheck,
  TrendingUp, FileSpreadsheet, Download, Upload, AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const PredictionPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [inputs, setInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Batch states
  const [batchFile, setBatchFile] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // single, batch

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models/list');
        setModels(res.data);
        if (res.data.length > 0) {
          handleModelSelect(res.data[0].model_id, res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchModels();
  }, []);

  const handleModelSelect = (id, modelList = models) => {
    setSelectedModelId(id);
    const m = modelList.find((item) => item.model_id === id);
    setSelectedModel(m);
    setPredictionResult(null);

    // Seed default sample inputs based on feature list
    const defaults = {};
    if (m?.features) {
      m.features.forEach((f) => {
        if (f.toLowerCase().includes('month') || f.toLowerCase().includes('age') || f.toLowerCase().includes('year')) {
          defaults[f] = 25;
        } else if (f.toLowerCase().includes('income') || f.toLowerCase().includes('charges') || f.toLowerCase().includes('amount') || f.toLowerCase().includes('price')) {
          defaults[f] = 75.0;
        } else if (f.toLowerCase().includes('type') || f.toLowerCase().includes('service')) {
          defaults[f] = 'Standard';
        } else {
          defaults[f] = 10;
        }
      });
    }
    setInputs(defaults);
  };

  const handleInputChange = (field, val) => {
    const num = Number(val);
    setInputs((prev) => ({
      ...prev,
      [field]: isNaN(num) || val === '' ? val : num
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedModelId) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/predict/single', {
        model_id: selectedModelId,
        features: inputs
      });
      setPredictionResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchPredict = async (e) => {
    e.preventDefault();
    if (!batchFile || !selectedModelId) return;

    setBatchLoading(true);
    const formData = new FormData();
    formData.append('model_id', selectedModelId);
    formData.append('file', batchFile);

    try {
      const res = await api.post('/predict/batch', formData, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `predicted_batch_${selectedModelId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Batch prediction failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const shapData = predictionResult?.explainability?.top_drivers?.map((d) => ({
    feature: d.feature.length > 15 ? d.feature.slice(0, 15) + '...' : d.feature,
    impact: d.impact,
    direction: d.direction
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Rocket className="w-6 h-6 text-electric-400" />
            <span>Real-Time Prediction Workspace</span>
          </h1>
          <p className="text-xs text-slate-400">Generate inferences using saved production model weights with instant SHAP attribution & uncertainty intervals.</p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-xl bg-navy-900 border border-navy-800">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition ${activeTab === 'single' ? 'bg-electric-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Single Inference
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`py-1.5 px-4 rounded-lg text-xs font-semibold transition ${activeTab === 'batch' ? 'bg-electric-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Batch CSV Predictions
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Model Selector Bar */}
      <div className="p-4 rounded-xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-slate-400">Target Model:</span>
          <select
            value={selectedModelId}
            onChange={(e) => handleModelSelect(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
          >
            {models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_name} • [{m.algorithm}] • {m.stage.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        {selectedModel && (
          <div className="text-xs text-slate-400 flex items-center space-x-3">
            <span>Algorithm: <strong className="text-white">{selectedModel.algorithm}</strong></span>
            <span>Task: <strong className="text-electric-400 capitalize">{selectedModel.task_type}</strong></span>
          </div>
        )}
      </div>

      {activeTab === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Parameters Form */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide">Inference Input Features</h3>
            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedModel?.features?.map((f) => (
                  <div key={f}>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1 truncate" title={f}>
                      {f}
                    </label>
                    <input
                      type="text"
                      value={inputs[f] !== undefined ? inputs[f] : ''}
                      onChange={(e) => handleInputChange(f, e.target.value)}
                      className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white focus:outline-none focus:border-electric-500 font-mono"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center justify-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{loading ? 'Evaluating Model Inference...' : 'Generate Prediction'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Prediction Output & Explainability */}
          <div className="space-y-6">
            {predictionResult ? (
              <div className="p-6 rounded-2xl glass-panel border border-electric-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-electric-400">Model Inference Output</span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{predictionResult.latency_ms} ms</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-navy-900/90 border border-navy-800 text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">Predicted Result</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {predictionResult.prediction}
                  </div>
                  {predictionResult.confidence && (
                    <p className="text-xs text-emerald-400 font-semibold pt-1">
                      Model Confidence: {(predictionResult.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  {predictionResult.uncertainty?.confidence_interval_95 && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      95% Confidence Bounds: [{predictionResult.uncertainty.confidence_interval_95[0]}, {predictionResult.uncertainty.confidence_interval_95[1]}]
                    </p>
                  )}
                </div>

                {/* SHAP Waterfall Chart */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white tracking-wide">SHAP Explainability (Feature Impact %)</h4>
                    <span className="text-[10px] text-slate-400">Local Decision Attribution</span>
                  </div>

                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shapData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#64748b" tick={{ fontSize: 9 }} />
                        <YAxis dataKey="feature" type="category" stroke="#64748b" width={110} tick={{ fontSize: 9 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Bar dataKey="impact" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-2xl glass-panel text-center space-y-3">
                <Sparkles className="w-10 h-10 text-electric-400/40" />
                <h3 className="text-sm font-bold text-white">Inference Engine Standby</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Fill in or modify feature values on the left and click <strong>Generate Prediction</strong> to execute live inference.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Prediction View */
        <div className="p-8 rounded-2xl glass-panel max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-white">Batch CSV Dataset Prediction</h3>
            <p className="text-xs text-slate-400">Upload a CSV file containing test records. PredictAI Pro will process all rows and return a CSV with predictions appended.</p>
          </div>

          <form onSubmit={handleBatchPredict} className="space-y-4">
            <div className="border-2 border-dashed border-navy-700 rounded-xl p-8 text-center space-y-3 hover:border-electric-500 transition">
              <FileSpreadsheet className="w-10 h-10 text-electric-400 mx-auto" />
              <div className="text-xs text-slate-300">
                <label className="font-semibold text-electric-400 hover:underline cursor-pointer">
                  <span>Browse CSV file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBatchFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">{batchFile ? batchFile.name : 'or drag and drop your file here'}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!batchFile || batchLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{batchLoading ? 'Generating Batch Inferences...' : 'Execute Batch & Download CSV'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
