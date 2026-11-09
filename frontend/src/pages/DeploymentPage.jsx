import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Radio, Code2, Copy, Check, Server, Globe, ShieldCheck, Zap } from 'lucide-react';

const DeploymentPage = () => {
  const [models, setModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [copiedTab, setCopiedTab] = useState('');
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models/list');
        const prod = res.data.filter((m) => m.stage === 'production');
        setModels(prod.length > 0 ? prod : res.data);
        if (res.data.length > 0) {
          setSelectedModelId(res.data[0].model_id);
          setSelectedModel(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const fetchHealth = async () => {
      try {
        const res = await api.get('/dashboard/health');
        setHealth(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchModels();
    fetchHealth();
  }, []);

  const handleSelect = (id) => {
    setSelectedModelId(id);
    setSelectedModel(models.find((m) => m.model_id === id));
  };

  const samplePayload = {};
  selectedModel?.features?.forEach((f) => {
    samplePayload[f] = 10.0;
  });

  const curlCode = `curl -X POST "http://localhost:8000/api/predict/single" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "${selectedModelId}",
    "features": ${JSON.stringify(samplePayload, null, 4)}
  }'`;

  const pythonCode = `import requests

url = "http://localhost:8000/api/predict/single"
payload = {
    "model_id": "${selectedModelId}",
    "features": ${JSON.stringify(samplePayload, null, 4)}
}

response = requests.post(url, json=payload)
data = response.json()
print("Prediction:", data["prediction"])
print("Latency:", data["latency_ms"], "ms")`;

  const jsCode = `const response = await fetch("http://localhost:8000/api/predict/single", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model_id: "${selectedModelId}",
    features: ${JSON.stringify(samplePayload, null, 4)}
  })
});
const result = await response.json();
console.log("Prediction Result:", result);`;

  const copyToClipboard = (text, tab) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Radio className="w-6 h-6 text-electric-400" />
          <span>Model Deployment & Real-Time REST Endpoints</span>
        </h1>
        <p className="text-xs text-slate-400">Production REST API integration documentation, live microservice endpoints, and client SDK code snippets.</p>
      </div>

      {/* Deployment Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Inference Endpoint</span>
          <p className="text-sm font-mono font-bold text-white truncate">/api/predict/single</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Active (HTTP 200 OK)</span>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Cloud Ready</span>
          <p className="text-sm font-mono font-bold text-electric-400">Docker & Render</p>
          <span className="text-[10px] text-slate-300">ARM64 & Linux Compatible</span>
        </div>
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Server Memory / CPU</span>
          <p className="text-sm font-mono font-bold text-white">
            {health ? `${health.cpu_usage_pct}% CPU • ${health.memory_usage_pct}% RAM` : 'Online'}
          </p>
          <span className="text-[10px] text-emerald-400">High Performance</span>
        </div>
      </div>

      {/* Model Selection for API docs */}
      <div className="p-4 rounded-xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">Select Deployed Model:</span>
          <select
            value={selectedModelId}
            onChange={(e) => handleSelect(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white font-mono"
          >
            {models.map((m) => (
              <option key={m.model_id} value={m.model_id}>
                {m.model_name} ({m.algorithm}) • {m.stage.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-mono text-electric-400">{selectedModelId}</span>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-4">
        {/* cURL */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">cURL Terminal Command</span>
            <button
              onClick={() => copyToClipboard(curlCode, 'curl')}
              className="px-2.5 py-1 rounded text-xs bg-navy-850 hover:bg-navy-800 text-slate-300 flex items-center space-x-1"
            >
              {copiedTab === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'curl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-navy-950 border border-navy-850 text-slate-300 text-xs font-mono overflow-x-auto">
            {curlCode}
          </pre>
        </div>

        {/* Python */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Python (Requests SDK)</span>
            <button
              onClick={() => copyToClipboard(pythonCode, 'python')}
              className="px-2.5 py-1 rounded text-xs bg-navy-850 hover:bg-navy-800 text-slate-300 flex items-center space-x-1"
            >
              {copiedTab === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'python' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-navy-950 border border-navy-850 text-slate-300 text-xs font-mono overflow-x-auto">
            {pythonCode}
          </pre>
        </div>

        {/* JavaScript Fetch */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">JavaScript (Fetch API)</span>
            <button
              onClick={() => copyToClipboard(jsCode, 'js')}
              className="px-2.5 py-1 rounded text-xs bg-navy-850 hover:bg-navy-800 text-slate-300 flex items-center space-x-1"
            >
              {copiedTab === 'js' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTab === 'js' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-navy-950 border border-navy-850 text-slate-300 text-xs font-mono overflow-x-auto">
            {jsCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPage;
