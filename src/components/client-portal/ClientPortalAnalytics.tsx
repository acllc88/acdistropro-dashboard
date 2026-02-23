import { Client, Channel, Movie, Series, ClientFinancials, DeviceDistribution } from '../../types';
import { Eye, Users, Clock, Star, Monitor, Smartphone, Tv, Tablet, AlertCircle, DollarSign } from 'lucide-react';

interface ClientPortalAnalyticsProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
}

function BarChart({ data, color, label }: { data: { month: string; value: number }[]; color: string; label: string }) {
  if (data.length === 0) return <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No data from admin yet</div>;
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

export function ClientPortalAnalytics({ client, channels, movies, series, financials }: ClientPortalAnalyticsProps) {
  // Device distribution from Firebase (real-time)
  const dd: DeviceDistribution = client.deviceDistribution || { mobile: 0, desktop: 0, smartTV: 0, tablet: 0 };
  const ddTotal = dd.mobile + dd.desktop + dd.smartTV + dd.tablet;
  const hasDeviceData = ddTotal > 0;

  const deviceBreakdown = [
    { device: 'Smart TV', value: dd.smartTV, percentage: hasDeviceData ? Math.round((dd.smartTV / ddTotal) * 100) : 0, icon: Tv, color: 'bg-violet-500' },
    { device: 'Mobile', value: dd.mobile, percentage: hasDeviceData ? Math.round((dd.mobile / ddTotal) * 100) : 0, icon: Smartphone, color: 'bg-blue-500' },
    { device: 'Desktop', value: dd.desktop, percentage: hasDeviceData ? Math.round((dd.desktop / ddTotal) * 100) : 0, icon: Monitor, color: 'bg-emerald-500' },
    { device: 'Tablet', value: dd.tablet, percentage: hasDeviceData ? Math.round((dd.tablet / ddTotal) * 100) : 0, icon: Tablet, color: 'bg-amber-500' },
  ];

  const hasRevenue = financials.monthlyRevenue && financials.monthlyRevenue.length > 0;
  const revenueData = hasRevenue ? financials.monthlyRevenue.map(m => ({ month: m.month, value: m.amount })) : [];
  const totalRevenue = hasRevenue ? financials.monthlyRevenue.reduce((s, m) => s + m.amount, 0) : 0;
  const totalViews = [...movies, ...series].reduce((s, c) => s + (c.views || 0), 0);
  const totalSubscribers = channels.reduce((s, ch) => s + (ch.subscribers || 0), 0);
  const totalWatchTime = [...movies, ...series].reduce((s, c) => s + Math.round((c.views || 0) * 1.8), 0);

  const hasAnyData = totalRevenue > 0 || totalViews > 0 || totalSubscribers > 0 || movies.length > 0 || series.length > 0;

  const fmtNum = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const allContent = [
    ...movies.map(m => ({ id: m.id, title: m.title, poster: m.poster, type: 'movie' as const, views: m.views || 0, rating: m.rating, revenue: m.revenue || 0, channelName: channels.find(ch => ch.movieIds.includes(m.id))?.name || '-' })),
    ...series.map(s => ({ id: s.id, title: s.title, poster: s.poster, type: 'series' as const, views: s.views || 0, rating: s.rating, revenue: s.revenue || 0, channelName: channels.find(ch => ch.seriesIds.includes(s.id))?.name || '-' })),
  ].sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white">Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Performance data across all your channels — {client.name}</p>
      </div>

      {!hasAnyData && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-amber-300 font-semibold">No analytics data yet</p>
            <p className="text-amber-400/70 text-sm mt-1">Your admin hasn't added content, revenue data, or device distribution yet. All data here updates in real-time from Firebase once the admin adds it.</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Total Revenue', value: totalRevenue > 0 ? `$${fmtNum(totalRevenue)}` : '$0', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Views', value: fmtNum(totalViews), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Subscribers', value: fmtNum(totalSubscribers), icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Watch Time', value: totalWatchTime > 0 ? `${fmtNum(totalWatchTime)} hrs` : '0 hrs', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} border border-white/5 rounded-2xl p-4 md:p-5`}>
            <m.icon size={18} className={`${m.color} mb-2`} />
            <p className="text-lg md:text-xl font-black text-white">{m.value}</p>
            <p className="text-xs text-slate-400 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Revenue</h3>
              <p className="text-xs text-slate-400">Monthly breakdown from admin</p>
            </div>
            {totalRevenue > 0 && (
              <p className="text-xl font-black text-emerald-400">${fmtNum(totalRevenue)}</p>
            )}
          </div>
          <BarChart data={revenueData} color="bg-emerald-500/70" label="Monthly Revenue" />
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Device Distribution</h3>
            {!hasDeviceData && <span className="text-xs text-slate-500">Set by admin</span>}
          </div>
          {hasDeviceData ? (
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
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-600 gap-2">
              <Tv size={24} className="text-slate-700" />
              <p className="text-sm">No device data yet</p>
              <p className="text-xs text-slate-700">Admin will set this from the dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Performance Table */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Content Performance</h3>
          <p className="text-xs text-slate-400">All your movies & series ranked by views</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Views</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Rating</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allContent.length > 0 ? allContent.map(item => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{item.poster}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.type === 'movie' ? 'bg-amber-500/20 text-amber-300' : 'bg-pink-500/20 text-pink-300'}`}>{item.type}</span>
                          <span className="text-xs text-slate-500 truncate">{item.channelName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1"><Eye size={12} className="text-blue-400" /><span className="text-sm font-medium text-white">{fmtNum(item.views)}</span></div>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-1"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-sm font-bold text-amber-400">{item.rating}</span></div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-emerald-400">${fmtNum(item.revenue)}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">No content yet — admin hasn't added any content to your channels</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
