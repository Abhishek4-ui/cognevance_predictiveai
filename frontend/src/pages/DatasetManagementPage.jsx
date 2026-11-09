import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Upload, Database, FileSpreadsheet, Eye, BarChart2,
  Trash2, Download, Search, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

const DatasetManagementPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const navigate = useNavigate();

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/datasets/list');
      setDatasets(res.data);
    } catch (err) {
      console.error('Failed to load datasets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', `Uploaded file: ${file.name}`);

    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    try {
      await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadSuccess(`Successfully uploaded and analyzed ${file.name}`);
      fetchDatasets();
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload dataset');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete dataset ${filename}?`)) return;
    try {
      await api.delete(`/datasets/${id}`);
      fetchDatasets();
    } catch (err) {
      alert('Failed to delete dataset');
    }
  };

  const filtered = datasets.filter(d =>
    d.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dataset Management Hub</h1>
          <p className="text-xs text-slate-400">Upload custom datasets, inspect schema quality, and launch automated EDA workflows.</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md transition flex items-center space-x-2">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Analyzing...' : 'Upload CSV / Excel'}</span>
            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {uploadSuccess && (
        <div className="flex items-center space-x-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}
      {uploadError && (
        <div className="flex items-center space-x-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Search & Statistics bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search datasets by name or use case..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-navy-900 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> available datasets
        </div>
      </div>

      {/* Datasets Table */}
      <div className="rounded-2xl glass-panel border border-navy-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-navy-800">
              <tr>
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Problem Domain</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-navy-850/50 transition">
                  <td className="py-3.5 px-4 font-semibold text-white flex items-center space-x-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-electric-400 flex-shrink-0" />
                    <div>
                      <p className="truncate max-w-[220px]">{d.filename}</p>
                      <span className="text-[10px] font-normal text-slate-400 block truncate max-w-[240px]">{d.description}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy-800 text-slate-300 border border-navy-700 capitalize">
                      {d.task_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {d.row_count} rows × {d.col_count} cols
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {d.file_size_kb} KB
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 rounded-full bg-navy-800 overflow-hidden">
                        <div
                          className={`h-full ${d.quality_score > 90 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${d.quality_score}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-white">{d.quality_score}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/datasets/preview/${d.id}`)}
                        title="Preview Records"
                        className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/eda?file=${d.filename}`)}
                        title="Launch EDA"
                        className="p-1.5 rounded-lg bg-electric-500/10 text-electric-400 hover:bg-electric-500/20 transition"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/api/datasets/download/${d.filename}`}
                        download
                        title="Download CSV"
                        className="p-1.5 rounded-lg bg-navy-800 text-slate-300 hover:text-white hover:bg-navy-700 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDelete(d.id, d.filename)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatasetManagementPage;
