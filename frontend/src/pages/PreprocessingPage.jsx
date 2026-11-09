import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Binary, Sliders, CheckCircle, ArrowRight, ShieldCheck, Download, AlertCircle } from 'lucide-react';

const PreprocessingPage = () => {
  const [searchParams] = useSearchParams();
  const fileParam = searchParams.get('file');

  const [datasets, setDatasets] = useState([]);
  const [selectedFile, setSelectedFile] = useState(fileParam || '');
  const [targetColumn, setTargetColumn] = useState('');
  const [scaling, setScaling] = useState('standard');
  const [encoding, setEncoding] = useState('onehot');
  const [outlier, setOutlier] = useState('cap');
  const [imbalance, setImbalance] = useState(true);
  const [testSplit, setTestSplit] = useState(0.2);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets/list');
        setDatasets(res.data);
        if (!selectedFile && res.data.length > 0) {
          setSelectedFile(res.data[0].filename);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDatasets();
  }, []);

  const handleRun = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/preprocessing/run', {
        filename: selectedFile,
        target_column: targetColumn || null,
        scaling_strategy: scaling,
        encoding_strategy: encoding,
        outlier_treatment: outlier,
        handle_imbalance: imbalance,
        test_size: parseFloat(testSplit)
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Preprocessing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Binary className="w-6 h-6 text-electric-400" />
          <span>Advanced Data Preprocessing Studio</span>
        </h1>
        <p className="text-xs text-slate-400">Strict train/test isolation prevents data leakage. Outlier clipping, scaling, categorical encoding & class balance.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Dataset & Target */}
        <div className="p-5 rounded-xl glass-panel space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Dataset & Target</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Source Dataset</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.filename}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Target Variable (Optional for unsupervised)</label>
            <input
              type="text"
              placeholder="e.g. churn, median_house_value"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
            >
            </input>
          </div>
        </div>

        {/* Scalers & Encoders */}
        <div className="p-5 rounded-xl glass-panel space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Scalers & Encoders</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Numerical Scaler</label>
            <select
              value={scaling}
              onChange={(e) => setScaling(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white"
            >
              <option value="standard">StandardScaler (Zero mean, unit variance)</option>
              <option value="minmax">MinMaxScaler (0 to 1 bound)</option>
              <option value="robust">RobustScaler (Median / IQR resistant)</option>
              <option value="none">None (Raw numericals)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Categorical Encoding</label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white"
            >
              <option value="onehot">One-Hot Encoding (Dummies)</option>
              <option value="label">Label Encoding (Ordinal Integers)</option>
            </select>
          </div>
        </div>

        {/* Robustness & Splits */}
        <div className="p-5 rounded-xl glass-panel space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Outliers & Leakage Protection</h3>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Outlier Treatment</label>
            <select
              value={outlier}
              onChange={(e) => setOutlier(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white"
            >
              <option value="cap">Cap to IQR Fences (Winzorization)</option>
              <option value="none">Retain Raw Values</option>
            </select>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="imbalance"
              checked={imbalance}
              onChange={(e) => setImbalance(e.target.checked)}
              className="rounded bg-navy-900 border-navy-700 text-electric-500"
            />
            <label htmlFor="imbalance" className="text-xs text-slate-300 cursor-pointer">
              Balance minority classes (Oversampling)
            </label>
          </div>
        </div>
      </div>

      {/* Run Action */}
      <div className="flex justify-end">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center space-x-2"
        >
          <span>{loading ? 'Executing Pipeline...' : 'Run Pipeline & Save Transformed Dataset'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Output Results */}
      {result && (
        <div className="space-y-6 pt-2">
          {/* Metadata Card */}
          <div className="p-6 rounded-2xl glass-panel border border-emerald-500/20 bg-emerald-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Pipeline Execution Completed Successfully</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono">0% Data Leakage Guaranteed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Training Samples</span>
                <p className="text-lg font-bold text-white">{result.metadata.train_samples}</p>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Samples (Held Out)</span>
                <p className="text-lg font-bold text-white">{result.metadata.test_samples}</p>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Input Features</span>
                <p className="text-lg font-bold text-slate-300">{result.metadata.original_features_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/60 border border-navy-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Transformed Features</span>
                <p className="text-lg font-bold text-electric-400">{result.metadata.transformed_features_count}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Saved clean processed dataset to <code className="text-electric-400 font-mono">datasets/processed/{result.processed_filename}</code>. Ready for automated model training.
            </p>
          </div>

          {/* Transformed Preview */}
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Transformed Dataset Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800">
                  <tr>
                    {Object.keys(result.preview[0] || {}).map((k) => (
                      <th key={k} className="py-2 px-3 whitespace-nowrap text-white">
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {result.preview.map((row, i) => (
                    <tr key={i} className="hover:bg-navy-850/50">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="py-2 px-3 whitespace-nowrap text-slate-300">
                          {typeof v === 'number' ? v.toFixed(3) : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreprocessingPage;
