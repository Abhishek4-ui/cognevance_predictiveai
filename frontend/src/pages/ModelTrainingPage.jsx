import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Cpu, Award, CheckCircle, AlertTriangle, ArrowRight,
  TrendingUp, Clock, Layers, Sparkles
} from 'lucide-react';

const ModelTrainingPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState('classification');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);

  const [training, setTraining] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const classificationOptions = [
    { id: 'logistic_regression', label: 'Logistic Regression' },
    { id: 'decision_tree', label: 'Decision Tree' },
    { id: 'random_forest', label: 'Random Forest (Ensemble)' },
    { id: 'gradient_boosting', label: 'Gradient Boosting' },
    { id: 'xgboost', label: 'XGBoost (Extreme Gradient)' },
    { id: 'svm', label: 'Support Vector Machine (SVC)' },
    { id: 'knn', label: 'K-Nearest Neighbors (KNN)' },
    { id: 'naive_bayes', label: 'Gaussian Naive Bayes' },
    { id: 'neural_network', label: 'Deep Neural Network (MLP)' }
  ];

  const regressionOptions = [
    { id: 'linear_regression', label: 'Ordinary Least Squares' },
    { id: 'ridge', label: 'Ridge Regressor (L2 Regularized)' },
    { id: 'lasso', label: 'Lasso Regressor (L1 Sparsity)' },
    { id: 'decision_tree_regressor', label: 'Decision Tree Regressor' },
    { id: 'random_forest_regressor', label: 'Random Forest Regressor' },
    { id: 'gradient_boosting_regressor', label: 'Gradient Boosting Regressor' },
    { id: 'xgboost_regressor', label: 'XGBoost Regressor' }
  ];

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get('/datasets/list');
        setDatasets(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          setSelectedFile(first.filename);
          updateDatasetDefaults(first.filename);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDatasets();
  }, []);

  const updateDatasetDefaults = (filename) => {
    if (filename.includes('sales') || filename.includes('housing') || filename.includes('price') || filename.includes('demand') || filename.includes('student')) {
      setTaskType('regression');
      setSelectedAlgorithms(['linear_regression', 'ridge', 'random_forest_regressor', 'xgboost_regressor', 'gradient_boosting_regressor']);
      if (filename.includes('housing')) setTargetColumn('median_house_value');
      else if (filename.includes('sales')) setTargetColumn('weekly_sales');
      else if (filename.includes('demand')) setTargetColumn('rental_demand_count');
      else if (filename.includes('student')) setTargetColumn('final_grade');
    } else {
      setTaskType('classification');
      setSelectedAlgorithms(['logistic_regression', 'random_forest', 'xgboost', 'gradient_boosting', 'neural_network']);
      if (filename.includes('churn')) setTargetColumn('churn');
      else if (filename.includes('cardiac')) setTargetColumn('heart_disease');
      else if (filename.includes('fraud')) setTargetColumn('is_fraud');
      else if (filename.includes('loan')) setTargetColumn('loan_default');
    }
  };

  const handleDatasetChange = (fname) => {
    setSelectedFile(fname);
    updateDatasetDefaults(fname);
  };

  const toggleAlgorithm = (algoId) => {
    if (selectedAlgorithms.includes(algoId)) {
      setSelectedAlgorithms(selectedAlgorithms.filter((a) => a !== algoId));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algoId]);
    }
  };

  const handleTrain = async () => {
    if (!selectedFile) return;
    setTraining(true);
    setError('');
    setResults(null);

    try {
      const res = await api.post('/training/train', {
        filename: selectedFile,
        target_column: targetColumn,
        task_type: taskType,
        selected_models: selectedAlgorithms,
        scaling_strategy: 'standard',
        encoding_strategy: 'onehot',
        outlier_treatment: 'cap'
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  const activeOptions = taskType === 'classification' ? classificationOptions : regressionOptions;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-electric-400" />
          <span>Automated Model Training Lab</span>
        </h1>
        <p className="text-xs text-slate-400">Train multiple competitive algorithms, conduct k-fold cross validation, and auto-register the champion model.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dataset & Problem Type */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">1. Problem Definition</h3>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Dataset</label>
            <select
              value={selectedFile}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
            >
              {datasets.map((d) => (
                <option key={d.id} value={d.filename}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Column Variable</label>
            <input
              type="text"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              placeholder="e.g. churn, weekly_sales"
              className="w-full py-2 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Task Modality</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTaskType('classification');
                  setSelectedAlgorithms(['logistic_regression', 'random_forest', 'xgboost', 'gradient_boosting', 'neural_network']);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${taskType === 'classification' ? 'bg-electric-600 border-electric-500 text-white' : 'bg-navy-900 border-navy-700 text-slate-400'}`}
              >
                Classification
              </button>
              <button
                type="button"
                onClick={() => {
                  setTaskType('regression');
                  setSelectedAlgorithms(['linear_regression', 'ridge', 'random_forest_regressor', 'xgboost_regressor']);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${taskType === 'regression' ? 'bg-electric-600 border-electric-500 text-white' : 'bg-navy-900 border-navy-700 text-slate-400'}`}
              >
                Regression
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Algorithms selection */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide">2. Select Algorithms for Competitive Tournament</h3>
            <span className="text-xs text-electric-400 font-semibold">{selectedAlgorithms.length} Selected</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeOptions.map((opt) => {
              const checked = selectedAlgorithms.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleAlgorithm(opt.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${checked ? 'bg-electric-500/10 border-electric-500/50 text-white' : 'bg-navy-900/60 border-navy-800 text-slate-400 hover:border-navy-700'}`}
                >
                  <span className="text-xs font-medium">{opt.label}</span>
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${checked ? 'bg-electric-500 border-electric-400 text-white' : 'border-slate-600'}`}>
                    {checked && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleTrain}
              disabled={training || selectedAlgorithms.length === 0}
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-lg shadow-electric-500/25 transition flex items-center space-x-2"
            >
              <span>{training ? 'Training Ensemble in Progress...' : 'Launch Training Tournament'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Training Results & Leaderboard */}
      {results && (
        <div className="space-y-6 pt-2">
          {/* Champion Banner */}
          <div className="p-6 rounded-2xl glass-panel bg-gradient-to-r from-navy-900 via-indigo-950/30 to-purple-950/30 border border-electric-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3.5 rounded-2xl bg-electric-500/20 text-electric-400 border border-electric-500/30">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-electric-400">Tournament Winner</span>
                <h2 className="text-xl font-bold text-white capitalize">{results.best_model?.replace(/_/g, ' ')}</h2>
                <p className="text-xs text-slate-300">
                  Primary Score: <strong className="text-emerald-400 font-mono">{(results.best_metrics?.summary_metric * 100).toFixed(2)}%</strong> • Automatically registered as Staging artifact ID: <code className="text-electric-400 font-mono text-[10px]">{results.best_model_id}</code>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/predict')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-electric-600 hover:bg-electric-500 text-white shadow-md transition flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>Run Inference</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Leaderboard Table */}
          <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-wide">Tournament Evaluation Leaderboard</h3>
              <span className="text-xs text-slate-400">Strictly evaluated on untouched test split</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900 text-slate-400 uppercase text-[10px] border-b border-navy-800">
                  <tr>
                    <th className="py-3 px-4 w-14">Rank</th>
                    <th className="py-3 px-4">Algorithm Name</th>
                    <th className="py-3 px-4">Primary Metric</th>
                    <th className="py-3 px-4">K-Fold CV Score</th>
                    <th className="py-3 px-4">Train Latency</th>
                    <th className="py-3 px-4">Overfitting Check</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
                  {results.leaderboard.map((entry, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <tr key={entry.model_name} className={`hover:bg-navy-850/50 ${isWinner ? 'bg-electric-500/5' : ''}`}>
                        <td className="py-3 px-4 font-bold">
                          {isWinner ? <span className="text-amber-400">★ #1</span> : <span className="text-slate-500">#{idx + 1}</span>}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white font-sans capitalize">
                          {entry.model_name.replace(/_/g, ' ')}
                          <span className="text-[10px] text-slate-500 block font-mono">{entry.algorithm_family}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-electric-400">
                          {entry.metrics?.summary_metric !== undefined ? (entry.metrics.summary_metric * 100).toFixed(2) + '%' : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {entry.cross_val_mean !== undefined ? (entry.cross_val_mean * 100).toFixed(2) + '%' : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">
                          {entry.train_time_seconds}s
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${entry.overfitting?.risk_level === 'LOW' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {entry.overfitting?.risk_level || 'LOW'} RISK
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelTrainingPage;
