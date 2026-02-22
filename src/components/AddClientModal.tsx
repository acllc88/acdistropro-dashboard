import { X } from 'lucide-react';
import { useState } from 'react';

interface AddClientModalProps {
  onClose: () => void;
  onAdd: (client: {
    name: string; email: string; phone: string; company: string;
    plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
    logo: string; password: string; revenueShare: number; monthlyFee: number;
  }) => void;
}

const emojis = ['👤', '👩', '👨', '🧑', '👩‍💼', '👨‍💼', '🧑‍💻', '👩‍💻', '👨‍💻', '🦸', '🧑‍🎨', '👩‍🎤', '👨‍🎤', '🎭', '🌟', '💼'];
const plans: ('Basic' | 'Standard' | 'Premium' | 'Enterprise')[] = ['Basic', 'Standard', 'Premium', 'Enterprise'];

const planDefaults: Record<string, { fee: number; share: number; desc: string }> = {
  Basic: { fee: 199, share: 50, desc: '1 channel, 50 titles' },
  Standard: { fee: 499, share: 55, desc: '3 channels, 200 titles' },
  Premium: { fee: 999, share: 65, desc: '10 channels, 1000 titles' },
  Enterprise: { fee: 2999, share: 70, desc: 'Unlimited' },
};

export function AddClientModal({ onClose, onAdd }: AddClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState<'Basic' | 'Standard' | 'Premium' | 'Enterprise'>('Standard');
  const [logo, setLogo] = useState('👤');
  const [password, setPassword] = useState('');
  const [revenueShare, setRevenueShare] = useState(55);
  const [monthlyFee, setMonthlyFee] = useState(499);

  const handlePlanChange = (p: 'Basic' | 'Standard' | 'Premium' | 'Enterprise') => {
    setPlan(p);
    setRevenueShare(planDefaults[p].share);
    setMonthlyFee(planDefaults[p].fee);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    onAdd({ name, email, phone, company, plan, logo, password, revenueShare, monthlyFee });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add New Client</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => (
                <button key={e} type="button" onClick={() => setLogo(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${logo === e ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}>{e}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@company.com" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Login Password *</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Client portal password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" required />
            </div>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {plans.map(p => (
                <button key={p} type="button" onClick={() => handlePlanChange(p)} className={`px-4 py-3 rounded-xl text-left transition-all border ${plan === p ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                  <p className={`text-sm font-semibold ${plan === p ? 'text-violet-700' : 'text-gray-700'}`}>{p}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{planDefaults[p].desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Revenue & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Share (%)</label>
              <input type="number" value={revenueShare} onChange={(e) => setRevenueShare(Number(e.target.value))} min={0} max={100} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
              <input type="number" value={monthlyFee} onChange={(e) => setMonthlyFee(Number(e.target.value))} min={0} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}
