import { useState } from 'react';
import { Channel, Movie, Series } from '../../types';
import { Film, Clapperboard, Star, Clock, Globe, Search, Tv, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ClientPortalContentProps {
  channels: Channel[];
  movies: Movie[];
  series: Series[];
}

type ContentTab = 'channels' | 'movies' | 'series';

const statusColor: Record<string, string> = {
  Ongoing: 'bg-emerald-500/20 text-emerald-300',
  Completed: 'bg-blue-500/20 text-blue-300',
  Cancelled: 'bg-red-500/20 text-red-300',
};

export function ClientPortalContent({ channels, movies, series }: ClientPortalContentProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>('channels');
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  const movieGenres = ['All', ...Array.from(new Set(movies.map(m => m.genre)))];
  const seriesGenres = ['All', ...Array.from(new Set(series.map(s => s.genre)))];

  const filteredMovies = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === 'All' || m.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const filteredSeries = series.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === 'All' || s.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  const tabs = [
    { id: 'channels' as ContentTab, label: 'Channels', icon: Tv, count: channels.length },
    { id: 'movies' as ContentTab, label: 'Movies', icon: Film, count: movies.length },
    { id: 'series' as ContentTab, label: 'Series', icon: Clapperboard, count: series.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">My Content</h1>
        <p className="text-slate-400 mt-1">Everything your admin has added to your channels</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1 bg-slate-900 border border-white/5 p-1 rounded-xl sm:rounded-2xl w-max sm:w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(''); setGenreFilter('All'); }}
              className={cn('flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white')}
            >
              <tab.icon size={14} />
              {tab.label}
              <span className={cn('text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500')}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-5">
          {channels.length > 0 ? channels.map(ch => {
            const chMovies = movies.filter(m => ch.movieIds.includes(m.id));
            const chSeries = series.filter(s => ch.seriesIds.includes(s.id));
            return (
              <div key={ch.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${ch.color} p-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative flex items-center gap-5">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl shadow-xl">{ch.logo}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white">{ch.name}</h3>
                      <p className="text-white/70 text-sm mt-1">{ch.description}</p>
                    </div>
                    <div className="hidden md:grid grid-cols-3 gap-4 text-center">
                      <div><Users size={14} className="text-white/70 mx-auto mb-1" /><p className="text-white font-black">{(ch.subscribers / 1000000).toFixed(0)}M</p><p className="text-white/60 text-xs">Subscribers</p></div>
                      <div><Film size={14} className="text-white/70 mx-auto mb-1" /><p className="text-white font-black">{chMovies.length}</p><p className="text-white/60 text-xs">Movies</p></div>
                      <div><Clapperboard size={14} className="text-white/70 mx-auto mb-1" /><p className="text-white font-black">{chSeries.length}</p><p className="text-white/60 text-xs">Series</p></div>
                    </div>
                  </div>
                </div>
                {chMovies.length > 0 && (
                  <div className="p-5">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Film size={14} className="text-amber-400" /> Movies</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chMovies.map(m => (
                        <div key={m.id} className="flex items-center gap-3 bg-white/3 hover:bg-white/6 rounded-xl p-3 transition-colors">
                          <span className="text-2xl shrink-0">{m.poster}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{m.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{m.genre}</span><span>·</span><span className="flex items-center gap-0.5"><Clock size={10} />{m.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{m.rating}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {chSeries.length > 0 && (
                  <div className={cn('p-5', chMovies.length > 0 && 'border-t border-white/5')}>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Clapperboard size={14} className="text-pink-400" /> Series</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chSeries.map(s => (
                        <div key={s.id} className="flex items-center gap-3 bg-white/3 hover:bg-white/6 rounded-xl p-3 transition-colors">
                          <span className="text-2xl shrink-0">{s.poster}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{s.title}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{s.seasons}S · {s.episodes} eps</span>
                              <span className={`px-1.5 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>{s.status}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{s.rating}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {chMovies.length === 0 && chSeries.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No content in this channel yet — admin will add content soon</div>}
              </div>
            );
          }) : (
            <div className="text-center py-16 bg-slate-900 rounded-2xl border border-white/5">
              <div className="text-5xl mb-4">📺</div>
              <p className="text-slate-400 text-lg">No channels assigned yet</p>
              <p className="text-slate-500 text-sm mt-1">Contact your admin to get channels assigned</p>
            </div>
          )}
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {movieGenres.map(g => (
                <button key={g} onClick={() => setGenreFilter(g)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition-all', genreFilter === g ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5')}>{g}</button>
              ))}
            </div>
          </div>
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredMovies.map(movie => {
                const channel = channels.find(ch => ch.movieIds.includes(movie.id));
                return (
                  <div key={movie.id} className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">{movie.poster}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{movie.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">{movie.genre}</span>
                          <span className="text-xs text-slate-500">{movie.year}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{movie.rating}</span></div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{movie.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Clock size={11} />{movie.duration}</span>
                      <span className="flex items-center gap-1"><Globe size={11} />{movie.language}</span>
                    </div>
                    {channel && <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${channel.color} rounded-xl`}><span className="text-base">{channel.logo}</span><span className="text-xs font-medium text-white">{channel.name}</span></div>}
                  </div>
                );
              })}
            </div>
          ) : <div className="text-center py-16 bg-slate-900 rounded-2xl border border-white/5"><div className="text-5xl mb-4">🎬</div><p className="text-slate-400 text-lg">No movies found</p></div>}
        </div>
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Search series..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {seriesGenres.map(g => (
                <button key={g} onClick={() => setGenreFilter(g)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition-all', genreFilter === g ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5')}>{g}</button>
              ))}
            </div>
          </div>
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredSeries.map(s => {
                const channel = channels.find(ch => ch.seriesIds.includes(s.id));
                return (
                  <div key={s.id} className="bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">{s.poster}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{s.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-medium">{s.genre}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[s.status]}`}>{s.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-xs font-bold text-amber-400">{s.rating}</span></div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">{s.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Clapperboard size={11} />{s.seasons}S · {s.episodes} eps</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{s.episodeDuration}/ep</span>
                      <span className="flex items-center gap-1"><Globe size={11} />{s.language}</span>
                    </div>
                    {channel && <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${channel.color} rounded-xl`}><span className="text-base">{channel.logo}</span><span className="text-xs font-medium text-white">{channel.name}</span></div>}
                  </div>
                );
              })}
            </div>
          ) : <div className="text-center py-16 bg-slate-900 rounded-2xl border border-white/5"><div className="text-5xl mb-4">📺</div><p className="text-slate-400 text-lg">No series found</p></div>}
        </div>
      )}
    </div>
  );
}
