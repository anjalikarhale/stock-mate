import React, { useState } from 'react';
import { Shield, Lock, UserCheck, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (adminUser: any, token: string) => void;
  onBackToApp: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToApp }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please provide your administrator email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your administrator access key.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator credentials. Access restricted.');
      }

      // Persist admin session in localStorage
      localStorage.setItem('stockmate_admin_token', data.token);
      localStorage.setItem('stockmate_admin_user', JSON.stringify(data.user));

      onSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.18),rgba(255,255,255,0))] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '36px 36px'
        }}
      />

      {/* Back button */}
      <div className="w-full max-w-md mb-6 z-10 flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Learner Arena
        </button>

        <span className="text-[11px] font-mono tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold">
          Restricted Portal
        </span>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10">
        {/* Header with shield */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Administrator Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Private security clearance for the designated platform administrator.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl p-3 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Authentication Failed</p>
              <p className="text-[11px] text-rose-200/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form - Login Only (No Sign Up, No Credentials Displayed) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Identifier
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your administrator email or username"
                required
                autoComplete="username"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
              <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Security Key (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your private password"
                required
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Authenticate & Enter Portal
              </>
            )}
          </button>
        </form>

        {/* Strict Security Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Single authorized administrator access only. Public registration is permanently disabled.
          </p>
        </div>
      </div>
    </div>
  );
};
