import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('analyst@cybersentry.ai');
    setPassword('CyberSentry2026!');
    setLoading(true);
    await login('analyst@cybersentry.ai', 'CyberSentry2026!');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-300">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your CyberSentry AI security workspace</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@domain.com"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign In to CyberSentry</span>
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Instant Demo Analyst Login</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
