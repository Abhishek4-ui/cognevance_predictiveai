import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username || email, password);
      } else {
        await register({
          username,
          email,
          password,
          full_name: fullName,
          role: 'user'
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setUsername('admin');
    setPassword('PredictAIAdmin2026!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-electric-500 to-neon-purple items-center justify-center shadow-lg shadow-electric-500/30 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Sign In to PredictAI Pro' : 'Create Student / Pro Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {isLogin ? 'Enter your credentials to access the analytics workspace' : 'Register for immediate access to models & datasets'}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl glass-panel border border-navy-800 space-y-5">
          {error && (
            <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Abhishek Kumar"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isLogin ? 'admin' : 'student_user'}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@predictai.pro"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-electric-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-electric-600 to-electric-500 hover:from-electric-500 hover:to-cyan-400 shadow-md shadow-electric-500/20 transition flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {isLogin && (
            <div className="pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={handleQuickFillAdmin}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-electric-400 bg-electric-500/10 hover:bg-electric-500/20 border border-electric-500/20 transition flex items-center justify-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fill Default Administrator Credentials</span>
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
