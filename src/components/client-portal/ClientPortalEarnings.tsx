import { Client, Channel, Movie, Series, ClientFinancials, PaymentRecord } from '../../types';
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, Calendar, CreditCard } from 'lucide-react';

interface ClientPortalEarningsProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
}

function EarningBar({ data, labels }: { data: number[]; labels: string[] }) {
  if (data.length === 0) return <div className="h-32 flex items-center justify-center text-slate-600 text-sm">No revenue data yet</div>;
  const max = Math.max(...data, 1);
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
        {labels.map((m, i) => <div key={i} className="flex-1 text-center"><span className="text-xs text-slate-600">{m}</span></div>)}
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
  const hasRevenue = financials.monthlyRevenue && financials.monthlyRevenue.length > 0;
  const revenueData = hasRevenue ? financials.monthlyRevenue.map(m => m.amount) : [];
  const revenueLabels = hasRevenue ? financials.monthlyRevenue.map(m => m.month.substring(0, 3)) : [];
  const totalRevenue = revenueData.reduce((s, v) => s + v, 0);
  const monthsWithData = revenueData.filter(v => v > 0).length;
  const monthlyAvg = monthsWithData > 0 ? totalRevenue / monthsWithData : 0;
  const bestMonth = hasRevenue
    ? financials.monthlyRevenue.reduce((a, b) => a.amount > b.amount ? a : b, { month: '-', amount: 0 })
    : { month: '-', amount: 0 };

  const hasPayments = financials.payments && financials.payments.length > 0;
  const pendingAmount = hasPayments
    ? financials.payments.filter((p: PaymentRecord) => p.status === 'Pending' || p.status === 'Processing').reduce((s: number, p: PaymentRecord) => s + p.amount, 0)
    : 0;

  const channelRevenue = channels.map(ch => {
    const chMovieRev = movies.filter(m => ch.movieIds.includes(m.id)).reduce((s, m) => s + (m.revenue || 0), 0);
    const chSeriesRev = series.filter(s => ch.seriesIds.includes(s.id)).reduce((s, sr) => s + (sr.revenue || 0), 0);
    return { channel: ch, revenue: chMovieRev + chSeriesRev };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalChannelRev = channelRevenue.reduce((s, c) => s + c.revenue, 0);
  const hasAnyData = totalRevenue > 0 || hasPayments || totalChannelRev > 0;

  const fmt = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Earnings</h1>
        <p className="text-slate-400 mt-1 text-sm">Revenue breakdown & payment history — {client.plan} Plan ({client.revenueShare}% revenue share)</p>
      </div>

      {!hasAnyData && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-amber-300 font-semibold">No earnings data yet</p>
            <p className="text-amber-400/70 text-sm mt-1">Your admin hasn't added revenue or payment data yet. All earnings data updates in real-time from Firebase.</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
        <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center"><DollarSign size={18} className="text-emerald-400" /></div>
          </div>
          <p className="text-xl md:text-2xl font-black text-emerald-400">{fmt(totalRevenue)}</p>
          <p className="text-xs text-slate-400 mt-1">Total Earnings</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center"><TrendingUp size={18} className="text-blue-400" /></div>
          </div>
          <p className="text-xl md:text-2xl font-black text-blue-400">{fmt(Math.round(monthlyAvg))}</p>
          <p className="text-xs text-slate-400 mt-1">Monthly Average</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-violet-500/20 rounded-xl flex items-center justify-center"><Calendar size={18} className="text-violet-400" /></div>
          </div>
          <p className="text-xl md:text-2xl font-black text-violet-400">{fmt(bestMonth.amount)}</p>
          <p className="text-xs text-slate-400 mt-1">Best Month{bestMonth.month !== '-' ? ` (${bestMonth.month})` : ''}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center"><Clock size={18} className="text-amber-400" /></div>
          </div>
          <p className="text-xl md:text-2xl font-black text-amber-400">{fmt(pendingAmount)}</p>
          <p className="text-xs text-slate-400 mt-1">Pending Payout</p>
        </div>
      </div>

      {/* Revenue Chart & Channel Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white">Monthly Revenue</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Revenue share: {client.revenueShare}% · Monthly fee: ${client.monthlyFee.toLocaleString()}</p>
          <EarningBar data={revenueData} labels={revenueLabels} />
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-4">Revenue by Channel</h3>
          {channelRevenue.length > 0 && totalChannelRev > 0 ? (
            <div className="space-y-4">
              {channelRevenue.map(({ channel, revenue }) => (
                <div key={channel.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 bg-gradient-to-br ${channel.color} rounded-lg flex items-center justify-center text-sm`}>{channel.logo}</div>
                      <span className="text-sm text-slate-300 truncate">{channel.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{Math.round((revenue / totalChannelRev) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700" style={{ width: `${(revenue / totalChannelRev) * 100}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{fmt(revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
              {channels.length === 0 ? 'No channels assigned' : 'No revenue data'}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2"><CreditCard size={16} className="text-emerald-400" /><h3 className="text-base font-bold text-white">Payment History</h3></div>
          <span className="text-xs text-slate-400">{financials.payments.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          {hasPayments ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Method</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {financials.payments.map((payment: PaymentRecord) => {
                  const SIcon = statusIcon[payment.status] || Clock;
                  return (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3"><span className="text-sm text-slate-300">{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></td>
                      <td className="px-4 py-3 hidden sm:table-cell"><span className="text-sm text-white">{payment.description}</span></td>
                      <td className="px-4 py-3 hidden md:table-cell"><div className="flex items-center gap-2"><CreditCard size={14} className="text-slate-500" /><span className="text-sm text-slate-300">{payment.method}</span></div></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusColor[payment.status]}`}>
                          <SIcon size={12} />{payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-sm font-bold ${payment.status === 'Paid' ? 'text-emerald-400' : payment.status === 'Processing' ? 'text-blue-400' : 'text-amber-400'}`}>{fmt(payment.amount)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="py-12 text-center text-slate-500">No payment history yet — admin will add payments here</div>}
        </div>
        {hasPayments && (
          <div className="px-5 py-4 border-t border-white/5 bg-white/3">
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
