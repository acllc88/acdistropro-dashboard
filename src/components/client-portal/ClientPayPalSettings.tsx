import { useState } from 'react';
import { Client } from '../../types';
import { Check, X, Mail } from 'lucide-react';

interface ClientPayPalSettingsProps {
  client: Client;
  onSavePayPal: (email: string) => void;
}

export function ClientPayPalSettings({ client, onSavePayPal }: ClientPayPalSettingsProps) {
  const currentPaypal = (client as unknown as Record<string, unknown>).paypalEmail as string || '';
  const [email, setEmail] = useState(currentPaypal);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!email.trim() || !email.includes('@')) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSavePayPal(email.trim());
    setShowConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleRemove = () => {
    onSavePayPal('');
    setEmail('');
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">💳 Payment Method</h2>
        <p className="text-sm text-slate-400 mt-1">Set your PayPal email for revenue payments</p>
      </div>

      {saved && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
          <Check size={18} className="text-emerald-400" />
          <p className="text-sm text-emerald-400 font-medium">PayPal settings updated successfully!</p>
        </div>
      )}

      {/* PayPal Card */}
      <div className="bg-gradient-to-br from-[#003087] to-[#009cde] rounded-2xl p-6 shadow-xl shadow-blue-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-black text-white italic">P</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PayPal</h3>
            <p className="text-sm text-blue-200">Revenue payments</p>
          </div>
        </div>

        {currentPaypal ? (
          <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <Mail size={16} className="text-blue-200 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentPaypal}</p>
              <p className="text-xs text-blue-200 flex items-center gap-1"><Check size={10} /> Connected</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-blue-200">No PayPal email connected</p>
          </div>
        )}
      </div>

      {/* Email Form */}
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-5">
        <h3 className="text-base font-bold text-white mb-4">
          {currentPaypal ? 'Update PayPal Email' : 'Add PayPal Email'}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">PayPal Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your-email@paypal.com"
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!email.trim() || !email.includes('@')}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg disabled:opacity-40 transition-all"
            >
              {currentPaypal ? 'Update Email' : 'Save Email'}
            </button>
            {currentPaypal && (
              <button
                onClick={handleRemove}
                className="px-4 py-2.5 text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-all"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-400">
            💡 Your PayPal email will be used by the admin to send your revenue share payments. Make sure it's a verified PayPal account.
          </p>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">Confirm PayPal Email</h3>
            <p className="text-sm text-slate-400 mb-1">You're setting your payment email to:</p>
            <p className="text-base font-semibold text-white bg-slate-800 px-4 py-2.5 rounded-xl mb-4 break-all">{email}</p>
            <p className="text-xs text-slate-500 mb-4">This email will be used for all future revenue payments from ACDistro Pro.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 text-sm text-slate-400 border border-white/10 rounded-xl hover:bg-white/5 flex items-center justify-center gap-1">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg flex items-center justify-center gap-1">
                <Check size={14} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
