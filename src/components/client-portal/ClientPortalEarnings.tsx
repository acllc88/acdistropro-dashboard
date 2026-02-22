import { Client, Channel, Movie, Series, ClientFinancials, PaymentRecord } from '../../types';
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, CreditCard } from 'lucide-react';

interface ClientPortalEarningsProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
}

function EarningBar({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return (
    <div>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full rounded-t-md bg-emerald-500 transition-all duration-700 hover:opacity-100 opacity-75 cursor-pointer" style={{ height: `${Math.max((v / max) * 100, 4)}%` }} title={`$${v.toLocaleString()}`} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {months.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-xs text-slate-600">{m}</span></div>)}
      </div>
    </div>
  );
}

const statusIcon: Record<string, React.ElementType> = {
  Paid: CheckCircle, Pending: Clock, Processing: AlertCircle,
};
const statusColor: Record<string, string> = {
  Paid: 'text-emerald-400 bg-emerald-500/10',
  Pending: 'text-amber-400 bg-amber-500/10',
  Processing: 'text-blue-400 bg-blue-500/10',
};

export function ClientPortalEarnings({ client, channels, movies, series, financials }: ClientPortalEarningsProps) {
  const revenueData = financials.monthlyRevenue.map(m => m.amount);
  const totalRevenue = revenueData.reduce((s, v) => s + v, 0);
  const monthlyAvg = totalRevenue / Math.max(revenueData.filter(v => v > 0).length, 1);
  const bestMonth = financials.monthlyRevenue.reduce((a, b) => a.amount > b.amount ? a : b, { month: '-', amount: 0 });
  const pendingAmount = financials.payments.filter((p: PaymentRecord) => p.status === 'Pending' || p.status === 'Processing').reduce((s: number, p: PaymentRecord) => s + p.amount, 0);

  const contentRevenue = [...movies, ...series].reduce((s, c) => s + c.revenue, 0);

  const channelRevenue = channels.map(ch => {
    const chMovieRev = movies.filter(m => ch.movieIds.includes(m.id)).reduce((s, m) => s + m.revenue, 0);
    const chSeriesRev = series.filter(s => ch.seriesIds.includes(s.id)).reduce((s, sr) => s + sr.revenue, 0);
    return { channel: ch, revenue: chMovieRev + chSeriesRev };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalChannelRev = channelRevenue.reduce((s, c) => s + c.revenue, 0);

  const fmt = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Earnings</h1>
        <p className="text-slate-400 mt-1">Revenue breakdown & payment history — {client.plan} Plan ({client.revenueShare}% revenue share)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><DollarSign size={20} className="text-emerald-400" /></div><span className="text-sm text-slate-400">Total Earnings</span></div>
          <p className="text-3xl font-black text-emerald-400">{fmt(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 mt-1">All time revenue</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-blue-400" /></div><span className="text-sm text-slate-400">Monthly Average</span></div>
          <p className="text-3xl font-black text-blue-400">{fmt(Math.round(monthlyAvg))}</p>
          <p className="text-xs text-blue-600 mt-1">Per month avg</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center"><Calendar size={20} className="text-violet-400" /></div><span className="text-sm text-slate-400">Best Month</span></div>
          <p className="text-3xl font-black text-violet-400">{fmt(bestMonth.amount)}</p>
          <p className="text-xs text-violet-600 mt-1">{bestMonth.month}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center"><Clock size={20} className="text-amber-400" /></div><span className="text-sm text-slate-400">Pending Payout</span></div>
          <p className="text-3xl font-black text-amber-400">{fmt(pendingAmount)}</p>
          <p className="text-xs text-amber-600 mt-1">Being processed</p>
        </div>
      </div>

      {/* Revenue Chart & Channel Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">Monthly Revenue — 2024</h3>
            <div className="flex items-center gap-1 text-emerald-400 text-sm font-semibold"><TrendingUp size={16} /> +12%</div>
          </div>
          <p className="text-xs text-slate-500 mb-6">Content revenue: {fmt(contentRevenue)} · Monthly fee: ${client.monthlyFee.toLocaleString()}</p>
          {totalRevenue > 0 ? <EarningBar data={revenueData} /> : <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No revenue data yet</div>}
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-6">Revenue by Channel</h3>
          {channelRevenue.length > 0 ? (
            <div className="space-y-5">
              {channelRevenue.map(({ channel, revenue }) => (
                <div key={channel.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 bg-gradient-to-br ${channel.color} rounded-lg flex items-center justify-center text-sm`}>{channel.logo}</div>
                      <span className="text-sm text-slate-300">{channel.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{totalChannelRev > 0 ? Math.round((revenue / totalChannelRev) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${totalChannelRev > 0 ? (revenue / totalChannelRev) * 100 : 0}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{fmt(revenue)}</p>
                </div>
              ))}
            </div>
          ) : <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No channel data</div>}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2"><CreditCard size={16} className="text-emerald-400" /><h3 className="text-base font-bold text-white">Payment History</h3></div>
          <span className="text-xs text-slate-400">{financials.payments.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          {financials.payments.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {financials.payments.map((payment: PaymentRecord) => {
                  const SIcon = statusIcon[payment.status] || Clock;
                  return (
                    <tr key={payment.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4"><span className="text-sm text-slate-300">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                      <td className="px-4 py-4"><span className="text-sm text-white">{payment.description}</span></td>
                      <td className="px-4 py-4"><div className="flex items-center gap-2"><CreditCard size={14} className="text-slate-500" /><span className="text-sm text-slate-300">{payment.method}</span></div></td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColor[payment.status]}`}>
                          <SIcon size={12} />{payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-bold ${payment.status === 'Paid' ? 'text-emerald-400' : payment.status === 'Processing' ? 'text-blue-400' : 'text-amber-400'}`}>{fmt(payment.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="py-12 text-center text-slate-500">No payment history yet</div>}
        </div>
        {financials.payments.length > 0 && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total Paid Out</span>
              <span className="text-lg font-black text-emerald-400">{fmt(financials.payments.filter((p: PaymentRecord) => p.status === 'Paid').reduce((s: number, p: PaymentRecord) => s + p.amount, 0))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
