import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain, Cpu, ShieldCheck, Zap, LineChart, Layers, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "17+ Machine Learning Algorithms",
      desc: "XGBoost, Random Forest, Gradient Boosting, SVM, Deep Neural Networks, Ridge, Lasso, and KMeans clustering.",
      icon: Cpu,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Automated Preprocessing & Anti-Leakage",
      desc: "Strict train/test isolation, IQR outlier clipping, one-hot encoding, SMOTE imbalance resolution, and scalers.",
      icon: Brain,
      color: "from-purple-500 to-indigo-400"
    },
    {
      title: "Explainable AI (XAI) & SHAP",
      desc: "Feature attribution waterfalls, uncertainty intervals, and local decision transparency for every inference.",
      icon: LineChart,
      color: "from-emerald-500 to-teal-400"
    },
    {
      title: "Enterprise MLOps & Drift Monitoring",
      desc: "KS-Test distribution shift detection, Population Stability Index (PSI), automated alerts, and model registry.",
      icon: ShieldCheck,
      color: "from-pink-500 to-rose-400"
    }
  ];

  const useCases = [
    "Customer Churn Prediction",
    "House Price Valuation",
    "Loan Default Risk Assessment",
    "Cardiac Healthcare Risk",
    "Financial Fraud Detection",
    "E-Commerce Sales Forecasting",
    "Customer Segmentation",
    "Bike Demand Forecasting",
    "Student Academic Performance"
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-8 md:p-14 border border-navy-700/80">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-electric-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Level 3 AI & Analytics Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Predictive Analytics & <span className="bg-gradient-to-r from-electric-400 via-cyan-300 to-neon-purple bg-clip-text text-transparent">Model Deployment</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 leading-relaxed">
            Welcome to <strong className="text-white">PredictAI Pro</strong>. An industrial-grade platform designed for BTech CSE Advanced AI/ML. Automate EDA, clean data without leakage, train multiple models, inspect SHAP explainability, and monitor covariate drift in production.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-lg shadow-electric-500/25 transition duration-200"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/predict')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition duration-200"
            >
              <span>Inference Workspace</span>
            </button>
            <button
              onClick={() => navigate('/registry')}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition duration-200"
            >
              <Layers className="w-4 h-4 text-neon-purple" />
              <span>Model Registry (9 Models Ready)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Core Architecture Pillars</h2>
          <p className="text-sm text-slate-400">Engineered with scientific rigor, genuine machine learning models, and full reproducibility.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-6 rounded-xl glass-panel glass-panel-hover transition duration-300 space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* The 9 Pre-loaded Benchmark Use Cases */}
      <div className="p-8 rounded-2xl glass-panel border border-navy-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-navy-800/80 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">9 Pre-Trained Benchmark Use Cases</h2>
            <p className="text-sm text-slate-400">All 9 real-world scenarios are active and ready for single or batch predictions.</p>
          </div>
          <button
            onClick={() => navigate('/datasets')}
            className="text-xs font-semibold text-electric-400 hover:text-electric-300 flex items-center space-x-1"
          >
            <span>View Datasets Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc, i) => (
            <div key={i} className="flex items-center space-x-3 p-3.5 rounded-lg bg-navy-850/80 border border-navy-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs font-medium text-slate-200">{uc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
