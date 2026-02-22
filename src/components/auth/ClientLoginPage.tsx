import { useState } from 'react';
import { Eye, EyeOff, LogIn, Tv, Film, Clapperboard, Star, AlertCircle, CheckCircle, Mail, ArrowLeft, Send, Lock } from 'lucide-react';
import { Client } from '../../types';

interface ClientLoginPageProps {
  clients: Client[];
  onClientLogin: (clientId: string) => void;
  onAdminHint: () => void;
  onForgotPassword?: (clientEmail: string) => void;
}

export function ClientLoginPage({ clients, onClientLogin, onAdminHint, onForgotPassword }: ClientLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleAdminLogoClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    if (newCount >= 5) {
      setAdminClickCount(0);
      onAdminHint();
    }
  };

  const attemptLogin = (clientEmail: string, clientPassword: string) => {
    const client = clients.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());

    if (!client) {
      setError('No account found with this email address. Please contact your administrator.');
      return false;
    }

    if (client.status === 'Banned') {
      const reason = client.banReason ? ` Reason: ${client.banReason}` : '';
      setError(`Your account has been permanently banned.${reason} Please contact support.`);
      return false;
    }

    if (client.status === 'Inactive') {
      setError('Your account is inactive. Please contact your administrator to activate your account.');
      return false;
    }

    if (client.status === 'Suspended') {
      const reason = client.suspendReason ? ` Reason: ${client.suspendReason}` : '';
      setError(`Your account is suspended.${reason} Please contact support.`);
      return false;
    }

    if (clientPassword !== client.password) {
      setError('Incorrect password. Please try again or use "Forgot password?" to reset it.');
      return false;
    }

    onClientLogin(client.id);
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    attemptLogin(email, password);
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    await new Promise(r => setTimeout(r, 800));

    const client = clients.find(c => c.email.toLowerCase() === forgotEmail.toLowerCase());

    if (!client) {
      setForgotError('No account found with this email address. Please contact your administrator directly.');
      setForgotLoading(false);
      return;
    }

    if (client.status === 'Banned') {
      setForgotError('This account has been banned. You cannot reset the password for a banned account.');
      setForgotLoading(false);
      return;
    }

    // Notify admin (in a real app this would send an email to admin)
    if (onForgotPassword) {
      onForgotPassword(forgotEmail);
    }

    setForgotSent(true);
    setForgotLoading(false);
  };

  const features = [
    { icon: Tv, label: 'Manage Channels', color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Film, label: 'Browse Movies', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Clapperboard, label: 'View Series', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { icon: Star, label: 'Analytics & Earnings', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  // ─── FORGOT PASSWORD SCREEN ───
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="w-full max-w-md relative z-10">
          <button
            onClick={() => { setShowForgotPassword(false); setForgotEmail(''); setForgotSent(false); setForgotError(''); }}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-8 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/25">
                <Lock size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Forgot Password?</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enter your email address and we'll send a password reset request to your administrator. They will contact you with a new password.
              </p>
            </div>

            {forgotSent ? (
              // Success state
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-300 mb-2">Request Sent!</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your password reset request has been sent to your administrator at <strong className="text-white">ACDistro Pro</strong>.
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      The admin will review your request and send your new password to <strong className="text-emerald-300">{forgotEmail}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Mail size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-400">
                    <p className="font-medium text-blue-300 mb-1">What happens next?</p>
                    <ol className="space-y-1 text-xs">
                      <li>1. Admin receives your reset request</li>
                      <li>2. Admin sets a new password for your account</li>
                      <li>3. Admin notifies you via email or the platform</li>
                      <li>4. You can log in with your new password</li>
                    </ol>
                  </div>
                </div>

                <button
                  onClick={() => { setShowForgotPassword(false); setForgotEmail(''); setForgotSent(false); setForgotError(''); }}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </button>
              </div>
            ) : (
              // Form state
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Your Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
                    />
                  </div>
                </div>

                {forgotError && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">{forgotError}</p>
                  </div>
                )}

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-300 leading-relaxed">
                      Password resets are handled by your administrator. Your new password will be set manually and communicated to you directly.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reset Request to Admin
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            © 2025 ACDistro Pro. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  // ─── MAIN LOGIN SCREEN ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 to-indigo-950/50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="relative">
          <button onClick={handleAdminLogoClick} className="flex items-center gap-3 cursor-default select-none">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/25 text-lg font-black text-white">
                AC
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">ACDistro Pro</h1>
              <p className="text-sm text-slate-400">OTT Distribution Platform</p>
            </div>
          </button>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-5xl font-black text-white leading-tight mb-4">
              Your Content,<br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Your Dashboard
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Access your streaming channels, view analytics, track earnings, and manage all your content in one powerful dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="text-sm font-medium text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/8 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center">
              <Star size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Admin-Controlled Access</p>
              <p className="text-xs text-slate-400">Only admin-approved accounts can access the portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <button onClick={handleAdminLogoClick} className="flex items-center gap-3 cursor-default">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg text-sm font-black text-white">
                AC
              </div>
              <div>
                <h1 className="text-xl font-black text-white">ACDistro Pro</h1>
                <p className="text-xs text-slate-400">OTT Distribution Platform</p>
              </div>
            </button>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">Client Login</h2>
              <p className="text-slate-400 text-sm">Sign in to access your streaming dashboard</p>
              <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <Lock size={12} className="text-violet-400 shrink-0" />
                <p className="text-xs text-violet-300">Access is restricted to admin-approved accounts only</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); setSuccessMsg(''); }}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setForgotEmail(email); setForgotError(''); setForgotSent(false); }}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); setSuccessMsg(''); }}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Success message */}
              {successMsg && (
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-300">{successMsg}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300">{error}</p>
                    {error.includes('contact') && (
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setForgotEmail(email); setForgotError(''); setForgotSent(false); }}
                        className="text-xs text-violet-400 hover:text-violet-300 mt-1 underline"
                      >
                        Request password reset →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Info note */}
            <div className="mt-6 pt-5 border-t border-white/8">
              <div className="flex items-start gap-3 p-4 bg-slate-800/60 rounded-xl">
                <AlertCircle size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-400">Don't have an account?</p>
                  <p>Access to ACDistro Pro is by invitation only. Contact your administrator to create an account for you.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            © 2025 ACDistro Pro — OTT Distribution Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
