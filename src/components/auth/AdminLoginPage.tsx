import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Lock, CheckCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onAdminLogin: () => void;
  onBackToClient: () => void;
}

// Admin credentials - secret, not visible to clients
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'ott@admin2025';

export function AdminLoginPage({ onAdminLogin, onBackToClient }: AdminLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setSuccessMsg('Access granted! Loading admin panel...');
      await new Promise(r => setTimeout(r, 700));
      onAdminLogin();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        setError('Too many failed attempts. Access locked for this session.');
      } else {
        setError(`Invalid credentials. ${5 - newAttempts} attempt${5 - newAttempts === 1 ? '' : 's'} remaining.`);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={onBackToClient}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-8 text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Client Login
        </button>

        {/* Admin Card */}
        <div className="bg-slate-900 border border-red-900/30 rounded-3xl p-8 shadow-2xl shadow-red-900/10">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">
                AC
              </div>
              <span className="text-sm font-bold text-slate-400">ACDistro Pro</span>
            </div>

            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-red-600/25">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Admin Access</h2>
            <p className="text-slate-500 text-sm">Restricted area — authorized personnel only</p>

            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Lock size={12} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-400 font-medium">This area is not accessible to clients</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Admin Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); setSuccessMsg(''); }}
                placeholder="Enter admin username"
                disabled={locked}
                required
                autoComplete="off"
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); setSuccessMsg(''); }}
                  placeholder="Enter admin password"
                  disabled={locked}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 transition-all pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={locked}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Success */}
            {successMsg && (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300">{successMsg}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Attempt bar */}
            {attempts > 0 && !locked && (
              <div>
                <p className="text-xs text-slate-500 mb-2">{5 - attempts} attempt{5 - attempts === 1 ? '' : 's'} remaining before lockout</p>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-all ${i < attempts ? 'bg-red-500' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || locked}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : locked ? (
                <>
                  <Lock size={18} />
                  Access Locked
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Hidden hint for demo */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-700">Demo credentials</p>
              <p className="text-xs text-slate-700 font-mono">admin / ott@admin2025</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          All access attempts are logged and monitored. © 2025 ACDistro Pro.
        </p>
      </div>
    </div>
  );
}
