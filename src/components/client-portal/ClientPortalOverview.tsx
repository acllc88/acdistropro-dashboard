import { Client, Channel, Movie, Series, ClientFinancials } from '../../types';
import { TrendingUp, TrendingDown, DollarSign, Eye, Users, Clock, Star, ArrowRight, Tv, Film, Clapperboard } from 'lucide-react';

type PortalTab = 'overview' | 'analytics' | 'earnings' | 'content' | 'notifications';

interface ClientPortalOverviewProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
  onTabChange: (tab: PortalTab) => void;
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div key={i} className={`flex-1 rounded-t-sm ${color} opacity-70`} style={{ height: `${Math.max((v / max) * 100, 4)}%`, minHeight: '4px' }} />
      ))}
    </div>
  );
}

export function ClientPortalOverview({ client, channels, movies, series, financials, onTabChange }: ClientPortalOverviewProps) {
  const totalRevenue = financials.monthlyRevenue.reduce((s, m) => s + m.amount, 0);
  const monthlyRevenue = financials.monthlyRevenue[financials.monthlyRevenue.length - 1]?.amount || 0;
  const totalViews = [...movies, ...series].reduce((s, c) => s + c.views, 0);
  const totalSubscribers = channels.reduce((s, ch) => s + ch.subscribers, 0);

  const revenueData = financials.monthlyRevenue.slice(-6).map(m => m.amount);
  const recentMonths = financials.monthlyRevenue.slice(-6).map(m => m.month);

  const topContent = [...movies, ...series]
    .map(c => ({ ...c, type: 'duration' in c ? 'movie' : 'series' }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const recentNotifications = client.notifications.filter(n => !n.read).slice(0, 3);

  const fmt = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v}`;
  };

  const fmtNum = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return `${v}`;
  };

  const stats = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'from-emerald-500 to-teal-600', trend: '+12.4%', up: true },
    { label: 'Total Views', value: fmtNum(totalViews), icon: Eye, color: 'from-blue-500 to-indigo-600', trend: '+18.2%', up: true },
    { label: 'Subscribers', value: fmtNum(totalSubscribers), icon: Users, color: 'from-violet-500 to-purple-600', trend: '+8.7%', up: true },
    { label: 'Monthly Revenue', value: fmt(monthlyRevenue), icon: Clock, color: 'from-amber-500 to-orange-600', trend: '+5.1%', up: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">{client.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what's happening across your channels.</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${client.color} rounded-2xl flex items-center justify-center text-2xl shadow-xl`}>{client.logo}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-semibold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Revenue (6mo)</h3>
            <span className="text-xs text-emerald-400 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-black text-emerald-400 mb-4">{fmt(monthlyRevenue)}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
          <MiniBarChart data={revenueData} color="bg-emerald-500" />
          <div className="flex justify-between mt-2">
            {recentMonths.map(m => <span key={m} className="text-xs text-slate-500">{m}</span>)}
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Content Library</h3>
          </div>
          <p className="text-2xl font-black text-amber-400 mb-4">{movies.length + series.length} <span className="text-sm text-slate-400 font-normal">titles</span></p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2"><Film size={14} className="text-amber-400" /><span className="text-sm text-slate-300">Movies</span></div>
              <span className="font-black text-white">{movies.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2"><Clapperboard size={14} className="text-pink-400" /><span className="text-sm text-slate-300">Series</span></div>
              <span className="font-black text-white">{series.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2"><Tv size={14} className="text-violet-400" /><span className="text-sm text-slate-300">Channels</span></div>
              <span className="font-black text-white">{channels.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Account Details</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Plan</p>
              <p className="font-bold text-white">{client.plan}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Revenue Share</p>
              <p className="font-bold text-emerald-400">{client.revenueShare}%</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Monthly Fee</p>
              <p className="font-bold text-white">${client.monthlyFee.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl">
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-bold text-emerald-400">{client.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* My Channels */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2"><Tv size={16} className="text-violet-400" /><h3 className="text-sm font-semibold text-white">My Channels</h3></div>
            <button onClick={() => onTabChange('content')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">View all <ArrowRight size={12} /></button>
          </div>
          <div className="divide-y divide-white/5">
            {channels.length > 0 ? channels.map(ch => {
              const chMovies = movies.filter(m => ch.movieIds.includes(m.id));
              const chSeries = series.filter(s => ch.seriesIds.includes(s.id));
              return (
                <div key={ch.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className={`w-10 h-10 bg-gradient-to-br ${ch.color} rounded-xl flex items-center justify-center text-lg shadow-md shrink-0`}>{ch.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ch.name}</p>
                    <p className="text-xs text-slate-400">{chMovies.length} movies · {chSeries.length} series</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">{(ch.subscribers / 1000000).toFixed(0)}M</p>
                    <p className="text-xs text-slate-500">subs</p>
                  </div>
                </div>
              );
            }) : <div className="p-8 text-center text-slate-500 text-sm">No channels assigned yet</div>}
          </div>
        </div>

        {/* Top Content */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2"><Star size={16} className="text-amber-400" /><h3 className="text-sm font-semibold text-white">Top Content</h3></div>
            <button onClick={() => onTabChange('analytics')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">Analytics <ArrowRight size={12} /></button>
          </div>
          <div className="divide-y divide-white/5">
            {topContent.length > 0 ? topContent.map((item, i) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/3 transition-colors">
                <span className={`text-xs font-black w-5 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : 'text-slate-500'}`}>#{i + 1}</span>
                <span className="text-lg shrink-0">{item.poster}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{fmtNum(item.views)} views</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-amber-400">{item.rating}</span>
                </div>
              </div>
            )) : <div className="p-8 text-center text-slate-500 text-sm">No content added yet</div>}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
            {recentNotifications.length > 0 && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">{recentNotifications.length}</span>}
          </div>
          <div className="divide-y divide-white/5">
            {recentNotifications.length > 0 ? recentNotifications.map(n => (
              <div key={n.id} className="px-6 py-4">
                <p className="text-xs font-semibold text-white">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">{new Date(n.date).toLocaleDateString()}</p>
              </div>
            )) : <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>}
          </div>
          <button onClick={() => onTabChange('notifications')} className="w-full px-6 py-3 text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center justify-center gap-1 border-t border-white/5">
            View all notifications <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
