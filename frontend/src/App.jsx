import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DatasetManagementPage from './pages/DatasetManagementPage';
import DatasetPreviewPage from './pages/DatasetPreviewPage';
import EDAPage from './pages/EDAPage';
import PreprocessingPage from './pages/PreprocessingPage';
import FeatureEngineeringPage from './pages/FeatureEngineeringPage';
import ModelTrainingPage from './pages/ModelTrainingPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import ModelEvaluationPage from './pages/ModelEvaluationPage';
import PredictionPage from './pages/PredictionPage';
import ModelRegistryPage from './pages/ModelRegistryPage';
import DeploymentPage from './pages/DeploymentPage';
import MonitoringPage from './pages/MonitoringPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-navy-950 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="datasets" element={<ProtectedRoute><DatasetManagementPage /></ProtectedRoute>} />
            <Route path="datasets/preview/:id" element={<ProtectedRoute><DatasetPreviewPage /></ProtectedRoute>} />
            <Route path="eda" element={<ProtectedRoute><EDAPage /></ProtectedRoute>} />
            <Route path="preprocessing" element={<ProtectedRoute><PreprocessingPage /></ProtectedRoute>} />
            <Route path="feature-engineering" element={<ProtectedRoute><FeatureEngineeringPage /></ProtectedRoute>} />
            <Route path="training" element={<ProtectedRoute><ModelTrainingPage /></ProtectedRoute>} />
            <Route path="comparison" element={<ProtectedRoute><ModelComparisonPage /></ProtectedRoute>} />
            <Route path="evaluation" element={<ProtectedRoute><ModelEvaluationPage /></ProtectedRoute>} />
            <Route path="predict" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
            <Route path="registry" element={<ProtectedRoute><ModelRegistryPage /></ProtectedRoute>} />
            <Route path="deployment" element={<ProtectedRoute><DeploymentPage /></ProtectedRoute>} />
            <Route path="monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute requireAdmin={true}><AdminPage /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
