import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Send, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome to Paper Plane!', 'success');
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@paperplane.com');
      setPassword('adminpassword');
    } else {
      setEmail('john@paperplane.com');
      setPassword('agentpassword');
    }
    addToast(`Prefilled credentials for ${role === 'admin' ? 'Admin' : 'Agent'}!`, 'info');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 p-4 font-sans relative overflow-hidden transition-all duration-300">
      
      {/* Decorative blurry glowing circles for ambient background design */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl" />

      {/* Main glass card */}
      <div className="glass-card w-full max-w-md p-8 rounded-3xl animate-fade-in relative z-10">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/20 transform hover:rotate-12 transition-all duration-300 mb-4">
            <Send className="h-6 w-6 rotate-45 transform -translate-y-0.5 translate-x-0.5" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient">Paper Plane</h2>
          <p className="text-slate-400 dark:text-slate-400 text-sm mt-1">Gift Route & Dispatch Tracker</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm py-3 px-4 rounded-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-55 disabled:scale-100 shadow-lg shadow-brand-500/20"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper Cards */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50 text-center">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Quick Login (Testing Demo)</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials('admin')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/20 hover:border-brand-200 dark:hover:border-brand-900/40 transition-all active:scale-95"
            >
              Demo Admin
            </button>
            <button
              onClick={() => fillCredentials('agent')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/20 hover:border-brand-200 dark:hover:border-brand-900/40 transition-all active:scale-95"
            >
              Demo Agent
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
