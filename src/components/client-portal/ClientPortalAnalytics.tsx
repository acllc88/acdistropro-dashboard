import { Client, Channel, Movie, Series, ClientFinancials } from '../../types';
import { TrendingUp, Eye, Users, Clock, Star, Monitor, Smartphone, Tv, Tablet } from 'lucide-react';

interface ClientPortalAnalyticsProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
}

function BarChart({ data, color, label }: { data: { month: string; value: number }[]; color: string; label: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full rounded-t-lg ${color} transition-all duration-500`} style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, minHeight: '4px' }} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        {data.map((d, i) => <div key={i} className="flex-1 text-center"><span className="text-xs text-slate-500">{d.month}</span></div>)}
      </div>
      <p className="text-xs text-slate-500 text-center mt-1">{label}</p>
    </div>
  );
}

const deviceBreakdown = [
  { device: 'Smart TV', percentage: 35, icon: Tv, color: 'bg-violet-500' },
  { device: 'Mobile', percentage: 38, icon: Smartphone, color: 'bg-blue-500' },
  { device: 'Desktop', percentage: 20, icon: Monitor, color: 'bg-emerald-500' },
  { device: 'Tablet', percentage: 7, icon: Tablet, color: 'bg-amber-500' },
];

export function ClientPortalAnalytics({ client, channels, movies, series, financials }: ClientPortalAnalyticsProps) {
  const revenueData = financials.monthlyRevenue.map(m => ({ month: m.month, value: m.amount }));
  const totalRevenue = financials.monthlyRevenue.reduce((s, m) => s + m.amount, 0);
  const totalViews = [...movies, ...series].reduce((s, c) => s + c.views, 0);
  const totalSubscribers = channels.reduce((s, ch) => s + ch.subscribers, 0);

  const fmtNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const allContent = [
    ...movies.map(m => ({ id: m.id, title: m.title, poster: m.poster, type: 'movie' as const, views: m.views, rating: m.rating, revenue: m.revenue, channelName: channels.find(ch => ch.movieIds.includes(m.id))?.name || '-' })),
    ...series.map(s => ({ id: s.id, title: s.title, poster: s.poster, type: 'series' as const, views: s.views, rating: s.rating, revenue: s.revenue, channelName: channels.find(ch => ch.seriesIds.includes(s.id))?.name || '-' })),
  ].sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Performance data across all your channels — {client.name}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}K`, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12%' },
          { label: 'Total Views', value: fmtNum(totalViews), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+18%' },
          { label: 'Subscribers', value: fmtNum(totalSubscribers), icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', trend: '+9%' },
          { label: 'Watch Time', value: `${(totalViews * 1.8 / 1000000).toFixed(1)}M hrs`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '+6%' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} border border-white/5 rounded-2xl p-5`}>
            <m.icon size={20} className={`${m.color} mb-3`} />
            <p className="text-xl font-black text-white">{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.label}</p>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp size={10} /> {m.trend}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Annual Revenue</h3>
              <p className="text-xs text-slate-400">Monthly breakdown — 2024</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-400">${(totalRevenue / 1000).toFixed(0)}K</p>
              <span className="text-xs text-emerald-400 flex items-center justify-end gap-1"><TrendingUp size={12} /> +12%</span>
            </div>
          </div>
          <BarChart data={revenueData} color="bg-emerald-500/70" label="Monthly Revenue" />
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-6">Device Distribution</h3>
          <div className="space-y-4">
            {deviceBreakdown.map(d => (
              <div key={d.device}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><d.icon size={16} className="text-slate-400" /><span className="text-sm text-slate-300">{d.device}</span></div>
                  <span className="text-sm font-bold text-white">{d.percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${d.color} transition-all duration-700`} style={{ width: `${d.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Performance Table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Content Performance</h3>
          <p className="text-xs text-slate-400">All your movies & series ranked by views</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Views</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allContent.length > 0 ? allContent.map(item => (
                <tr key={item.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.poster}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.type === 'movie' ? 'bg-amber-500/20 text-amber-300' : 'bg-pink-500/20 text-pink-300'}`}>{item.type}</span>
                          <span className="text-xs text-slate-500">{item.channelName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1"><Eye size={12} className="text-blue-400" /><span className="text-sm font-medium text-white">{fmtNum(item.views)}</span></div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-sm font-bold text-amber-400">{item.rating}</span></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-emerald-400">${item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(0)}K` : item.revenue}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No content yet — admin hasn't added any yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
