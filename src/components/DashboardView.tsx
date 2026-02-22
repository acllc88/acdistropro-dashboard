import {
  Tv, Film, Users, Clapperboard, TrendingUp, Star, BarChart3,
  UserCheck, Tv2, ShieldOff, UserX, Clock, CheckCircle
} from 'lucide-react';
import { Client, Channel, Movie, Series } from '../types';
import { cn } from '../utils/cn';

interface DashboardViewProps {
  clients: Client[];
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  onViewChannel: (channelId: string) => void;
  onViewClient: (clientId: string) => void;
}

export function DashboardView({ clients, channels, movies, series, onViewChannel, onViewClient }: DashboardViewProps) {
  const totalSubscribers = channels.reduce((sum, ch) => sum + ch.subscribers, 0);
  const assignedMovies = movies.filter(m => m.channelId !== null).length;
  const assignedSeries = series.filter(s => s.channelId !== null).length;
  const activeClients = clients.filter(c => c.status === 'Active').length;
  const suspendedClients = clients.filter(c => c.status === 'Suspended').length;
  const bannedClients = clients.filter(c => c.status === 'Banned').length;

  const allDistChannels = clients.flatMap(c => c.rokuChannels || []);
  const pendingDist = allDistChannels.filter(d => d.status === 'Pending').length;
  const activeDist = allDistChannels.filter(d => d.status === 'Active').length;

  const topRatedMovies = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const topRatedSeries = [...series].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const genreCounts: Record<string, number> = {};
  movies.forEach(m => { genreCounts[m.genre] = (genreCounts[m.genre] || 0) + 1; });
  series.forEach(s => { genreCounts[s.genre] = (genreCounts[s.genre] || 0) + 1; });

  const stats = [
    { label: 'Active Clients', value: `${activeClients}/${clients.length}`, icon: UserCheck, color: 'from-blue-500 to-indigo-600' },
    { label: 'Channels', value: channels.length, icon: Tv, color: 'from-violet-500 to-indigo-600' },
    { label: 'Movies', value: `${assignedMovies}/${movies.length}`, icon: Film, color: 'from-amber-500 to-orange-600' },
    { label: 'Series', value: `${assignedSeries}/${series.length}`, icon: Clapperboard, color: 'from-pink-500 to-rose-600' },
    { label: 'Subscribers', value: `${(totalSubscribers / 1000000).toFixed(0)}M`, icon: Users, color: 'from-emerald-500 to-teal-600' },
  ];

  const statusColors: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700',
    Inactive: 'bg-gray-100 text-gray-500',
    Suspended: 'bg-amber-100 text-amber-700',
    Banned: 'bg-red-100 text-red-700',
  };

  const statusDot: Record<string, string> = {
    Active: 'bg-emerald-500',
    Inactive: 'bg-gray-400',
    Suspended: 'bg-amber-500',
    Banned: 'bg-red-500',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Complete overview of your OTT platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <TrendingUp size={12} className="text-emerald-500" />
            </div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alert Cards Row */}
      {(suspendedClients > 0 || bannedClients > 0 || pendingDist > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {suspendedClients > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <UserX size={16} className="text-amber-600 shrink-0" />
              <div><p className="text-lg font-black text-amber-700">{suspendedClients}</p><p className="text-xs text-amber-600">Suspended</p></div>
            </div>
          )}
          {bannedClients > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <ShieldOff size={16} className="text-red-600 shrink-0" />
              <div><p className="text-lg font-black text-red-700">{bannedClients}</p><p className="text-xs text-red-600">Banned</p></div>
            </div>
          )}
          {pendingDist > 0 && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-cyan-50 border border-cyan-200 rounded-xl">
              <Tv2 size={16} className="text-cyan-600 shrink-0" />
              <div><p className="text-lg font-black text-cyan-700">{pendingDist}</p><p className="text-xs text-cyan-600">Pending Channels</p></div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Clients Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><UserCheck size={16} className="text-blue-500" /><h2 className="text-sm sm:text-base font-semibold text-gray-900">Clients</h2></div>
              <span className="text-xs text-gray-400">{clients.length}</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {clients.slice(0, 5).map((client) => {
                const clientChannels = channels.filter(ch => client.channelIds.includes(ch.id));
                const clientMovieCount = movies.filter(m => clientChannels.some(ch => ch.movieIds.includes(m.id))).length;
                const clientSeriesCount = series.filter(s => clientChannels.some(ch => ch.seriesIds.includes(s.id))).length;
                return (
                  <div
                    key={client.id}
                    onClick={() => onViewClient(client.id)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-gray-50/80 cursor-pointer transition-colors group"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${client.color} flex items-center justify-center text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform`}>
                        {client.logo}
                      </div>
                      <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', statusDot[client.status])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">{client.name}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{client.company}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                      <div className="text-center"><p className="font-bold text-gray-900">{clientChannels.length}</p><p>Ch</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900">{clientMovieCount}</p><p>Mov</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900">{clientSeriesCount}</p><p>Ser</p></div>
                    </div>
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[client.status]}`}>{client.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><BarChart3 size={16} className="text-violet-500" /><h2 className="text-sm sm:text-base font-semibold text-gray-900">Channels</h2></div>
              <span className="text-xs text-gray-400">{channels.length}</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {channels.slice(0, 6).map((channel) => {
                const chMovies = movies.filter(m => channel.movieIds.includes(m.id));
                const chSeries = series.filter(s => channel.seriesIds.includes(s.id));
                const owner = clients.find(cl => cl.channelIds.includes(channel.id));
                return (
                  <div
                    key={channel.id}
                    onClick={() => onViewChannel(channel.id)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 hover:bg-gray-50/80 cursor-pointer transition-colors group"
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                      {channel.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-violet-600 transition-colors truncate">{channel.name}</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{owner ? owner.name : 'Unassigned'}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                      <div className="text-center"><p className="font-bold text-gray-900">{chMovies.length}</p><p>Mov</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900">{chSeries.length}</p><p>Ser</p></div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{(channel.subscribers / 1000000).toFixed(0)}M</p>
                      <p className="text-[10px] text-gray-400">subs</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Distribution Channels Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Tv2 size={16} className="text-cyan-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Distribution</h2>
              <span className="ml-auto text-xs text-gray-400">{allDistChannels.length}</span>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
                  <CheckCircle size={14} className="text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-emerald-700">{activeDist}</p>
                  <p className="text-xs text-emerald-600">Active</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-center">
                  <Clock size={14} className="text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-black text-amber-700">{pendingDist}</p>
                  <p className="text-xs text-amber-600">Pending</p>
                </div>
              </div>
              {allDistChannels.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-36 overflow-y-auto">
                  {clients.filter(c => c.rokuChannels.length > 0).slice(0, 3).map(client =>
                    client.rokuChannels.slice(0, 2).map((device) => (
                      <div key={device.id} className="flex items-center gap-2 py-2">
                        <div className={cn('w-2 h-2 rounded-full shrink-0',
                          device.status === 'Active' ? 'bg-emerald-500' :
                          device.status === 'Pending' ? 'bg-amber-500' : 'bg-red-400'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{device.channelName}</p>
                          <p className="text-[10px] text-gray-400 truncate">{device.platform}</p>
                        </div>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0',
                          device.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          device.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        )}>{device.status}</span>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">No distribution channels</p>
              )}
            </div>
          </div>

          {/* Top Rated Movies */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Top Movies</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {topRatedMovies.slice(0, 4).map((movie) => (
                <div key={movie.id} className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-50/80 transition-colors">
                  <span className="text-base shrink-0">{movie.poster}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{movie.title}</p>
                    <p className="text-[10px] text-gray-400">{movie.genre}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{movie.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Rated Series */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Clapperboard size={16} className="text-pink-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Top Series</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {topRatedSeries.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-3 sm:px-4 py-2 hover:bg-gray-50/80 transition-colors">
                  <span className="text-base shrink-0">{s.poster}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    <p className="text-[10px] text-gray-400">{s.seasons}S · {s.episodes} eps</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{s.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" />
              <h2 className="text-sm sm:text-base font-semibold text-gray-900">Genres</h2>
            </div>
            <div className="p-3 sm:p-4 space-y-2">
              {Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([genre, count]) => {
                const total = movies.length + series.length;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const colors: Record<string, string> = {
                  'Sci-Fi': 'bg-violet-500', 'Drama': 'bg-blue-500', 'Thriller': 'bg-rose-500',
                  'Action': 'bg-orange-500', 'Fantasy': 'bg-emerald-500', 'Comedy': 'bg-amber-500',
                  'Horror': 'bg-red-500', 'Romance': 'bg-pink-500', 'Documentary': 'bg-teal-500',
                  'Animation': 'bg-cyan-500',
                };
                return (
                  <div key={genre}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{genre}</span>
                      <span className="text-[10px] text-gray-400">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[genre] || 'bg-gray-500'} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
