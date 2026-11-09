import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, BarChart2, Binary, FileSpreadsheet, Layers } from 'lucide-react';

const DatasetPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await api.get(`/datasets/preview/${id}?limit=60`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dataset preview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-400 text-sm">Dataset preview unavailable or file missing.</p>
        <button
          onClick={() => navigate('/datasets')}
          className="px-4 py-2 text-xs rounded-lg bg-navy-800 text-white"
        >
          Back to Datasets Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/datasets')}
            className="p-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-electric-400" />
              <span>{data.filename}</span>
            </h1>
            <p className="text-xs text-slate-400">
              Showing preview of first 50 rows • Total records: <strong className="text-white">{data.total_rows}</strong> • Features: <strong className="text-white">{data.total_columns}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/eda?file=${data.filename}`)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-electric-600 hover:bg-electric-500 shadow-md transition flex items-center space-x-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Analyze with EDA</span>
          </button>
          <button
            onClick={() => navigate(`/preprocessing?file=${data.filename}`)}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-navy-850 hover:bg-navy-800 border border-navy-700 transition flex items-center space-x-1.5"
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Preprocess</span>
          </button>
        </div>
      </div>

      {/* Schema / Dtypes Summary Bar */}
      <div className="p-4 rounded-xl glass-panel space-y-2">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features & Inferred Types</p>
        <div className="flex flex-wrap gap-2">
          {data.columns.map((col) => (
            <span key={col} className="px-2.5 py-1 rounded-md text-[11px] bg-navy-850 border border-navy-700/80 text-slate-200">
              <strong>{col}</strong>: <span className="text-electric-400 font-mono text-[10px]">{data.dtypes[col]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 sticky top-0 z-10 text-slate-400 uppercase tracking-wider text-[10px] border-b border-navy-800">
              <tr>
                <th className="py-3 px-3 w-12 text-center text-slate-500">#</th>
                {data.columns.map((col) => (
                  <th key={col} className="py-3 px-4 font-semibold whitespace-nowrap text-white">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono text-[11px]">
              {data.records.map((row, idx) => (
                <tr key={idx} className="hover:bg-navy-850/50 transition">
                  <td className="py-2.5 px-3 text-center text-slate-500 select-none">{idx + 1}</td>
                  {data.columns.map((col) => (
                    <td key={col} className="py-2.5 px-4 text-slate-200 whitespace-nowrap">
                      {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-red-400/80 italic font-sans text-[10px]">NULL</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetPreviewPage;
