import { useState } from 'react';
import { Client, ClientFinancials, MonthlyRevenue, PaymentRecord } from '../types';
import { DollarSign, Plus, TrendingUp, CreditCard, Users } from 'lucide-react';
import { cn } from '../utils/cn';

interface AdminRevenueManagerProps {
  clients: Client[];
  financials: Record<string, ClientFinancials>;
  onAddMonthlyRevenue: (clientId: string, revenue: MonthlyRevenue) => void;
  onAddPayment: (clientId: string, payment: PaymentRecord) => void;
}

export function AdminRevenueManager({ clients, financials, onAddMonthlyRevenue, onAddPayment }: AdminRevenueManagerProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [revMonth, setRevMonth] = useState('Jan');
  const [revAmount, setRevAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('PayPal');
  const [payStatus, setPayStatus] = useState<'Paid' | 'Pending' | 'Processing'>('Paid');
  const [showRevSuccess, setShowRevSuccess] = useState(false);
  const [showPaySuccess, setShowPaySuccess] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientFin = selectedClientId ? financials[selectedClientId] : null;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const handleAddRevenue = () => {
    if (!selectedClientId || !revAmount) return;
    onAddMonthlyRevenue(selectedClientId, { month: revMonth, amount: parseFloat(revAmount) });
    setRevAmount('');
    setShowRevSuccess(true);
    setTimeout(() => setShowRevSuccess(false), 3000);
  };

  const handleAddPayment = () => {
    if (!selectedClientId || !payAmount) return;
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: parseFloat(payAmount),
      status: payStatus,
      method: payMethod,
      description: `Payment via ${payMethod}`,
    };
    onAddPayment(selectedClientId, payment);
    setPayAmount('');
    setShowPaySuccess(true);
    setTimeout(() => setShowPaySuccess(false), 3000);
  };

  const totalEarnings = clientFin?.monthlyRevenue?.reduce((sum, r) => sum + r.amount, 0) || 0;
  const totalPaid = clientFin?.payments?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">💰 Revenue Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Add revenue and payments to client dashboards</p>
      </div>

      {/* Client Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Users size={14} className="inline mr-1" /> Select Client
        </label>
        <select
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none"
        >
          <option value="">Choose a client...</option>
          {clients.filter(c => c.status === 'Active').map(c => (
            <option key={c.id} value={c.id}>{c.logo} {c.name} — {c.company} ({c.plan})</option>
          ))}
        </select>

        {selectedClient && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-200">
              <p className="text-lg font-bold text-violet-700">{selectedClient.plan}</p>
              <p className="text-xs text-violet-500">Plan</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
              <p className="text-lg font-bold text-emerald-700">{selectedClient.revenueShare}%</p>
              <p className="text-xs text-emerald-500">Rev Share</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <p className="text-lg font-bold text-blue-700">${totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-blue-500">Total Revenue</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-200">
              <p className="text-lg font-bold text-amber-700">${totalPaid.toLocaleString()}</p>
              <p className="text-xs text-amber-500">Total Paid</p>
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Add Monthly Revenue */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-500" /> Add Monthly Revenue
            </h3>
            {showRevSuccess && (
              <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                ✅ Revenue added successfully! Client can see it now.
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Month</label>
                <select value={revMonth} onChange={e => setRevMonth(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Amount ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" value={revAmount} onChange={e => setRevAmount(e.target.value)} placeholder="5000" className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30" />
                </div>
              </div>
              <button
                onClick={handleAddRevenue}
                disabled={!revAmount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-40"
              >
                <Plus size={16} /> Add Revenue
              </button>
            </div>

            {/* Recent Revenue */}
            {clientFin?.monthlyRevenue && clientFin.monthlyRevenue.filter(r => r.amount > 0).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Recent Revenue</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {clientFin.monthlyRevenue.filter(r => r.amount > 0).map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-600">{r.month}</span>
                      <span className="font-semibold text-emerald-600">${r.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Payment */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <CreditCard size={18} className="text-blue-500" /> Add Payment
            </h3>
            {showPaySuccess && (
              <div className="mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                ✅ Payment added successfully! Client can see it now.
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Amount ($)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="2000" className="w-full pl-8 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Method</label>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30">
                  <option>PayPal</option>
                  <option>Bank Transfer</option>
                  <option>Wire Transfer</option>
                  <option>Check</option>
                  <option>Crypto</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                <div className="flex gap-2">
                  {(['Paid', 'Pending', 'Processing'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setPayStatus(s)}
                      className={cn(
                        'flex-1 px-3 py-2 text-xs font-medium rounded-xl border transition-all',
                        payStatus === s ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-500 border-gray-200 hover:border-violet-300'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddPayment}
                disabled={!payAmount}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-40"
              >
                <Plus size={16} /> Add Payment
              </button>
            </div>

            {/* Recent Payments */}
            {clientFin?.payments && clientFin.payments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-2">Recent Payments</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {clientFin.payments.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <span className="text-gray-600">{p.method}</span>
                        <span className={cn('ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        )}>{p.status}</span>
                      </div>
                      <span className="font-semibold text-gray-900">${p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
