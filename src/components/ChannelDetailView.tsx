import { ArrowLeft, Users, Film, Star, Clock, Globe, Plus, X, Trash2, Clapperboard, UserCheck } from 'lucide-react';
import { Client, Channel, Movie, Series } from '../types';
import { useState } from 'react';
import { cn } from '../utils/cn';

interface ChannelDetailViewProps {
  channel: Channel;
  channelMovies: Movie[];
  channelSeries: Series[];
  allMovies: Movie[];
  allSeries: Series[];
  clients: Client[];
  onBack: () => void;
  onAssignMovie: (movieId: string, channelId: string | null) => void;
  onDeleteMovie: (movieId: string) => void;
  onAssignSeries: (seriesId: string, channelId: string | null) => void;
  onDeleteSeries: (seriesId: string) => void;
}

export function ChannelDetailView({ channel, channelMovies, channelSeries, allMovies, allSeries, clients, onBack, onAssignMovie, onDeleteMovie, onAssignSeries, onDeleteSeries }: ChannelDetailViewProps) {
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  const [activeTab, setActiveTab] = useState<'movies' | 'series'>('movies');

  const unassignedMovies = allMovies.filter(m => m.channelId === null);
  const filteredUnassignedMovies = unassignedMovies.filter(m =>
    m.title.toLowerCase().includes(searchContent.toLowerCase())
  );
  const unassignedSeries = allSeries.filter(s => s.channelId === null);
  const filteredUnassignedSeries = unassignedSeries.filter(s =>
    s.title.toLowerCase().includes(searchContent.toLowerCase())
  );

  const allContent = [...channelMovies.map(m => m.rating), ...channelSeries.map(s => s.rating)];
  const avgRating = allContent.length > 0
    ? (allContent.reduce((s, r) => s + r, 0) / allContent.length).toFixed(1)
    : 'N/A';
  const owner = clients.find(cl => cl.channelIds.includes(channel.id));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Channels</span>
      </button>

      {/* Channel Header */}
      <div className={`bg-gradient-to-r ${channel.color} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl shadow-xl shrink-0">
              {channel.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white">{channel.name}</h1>
                <span className="text-[10px] sm:text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full font-medium">{channel.category}</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm max-w-xl line-clamp-2">{channel.description}</p>
              {owner && (
                <div className="flex items-center gap-1 text-white/70 text-xs sm:text-sm mt-1">
                  <UserCheck size={12} />
                  <span>Owned by <strong className="text-white">{owner.name}</strong></span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { icon: Users, value: `${(channel.subscribers / 1000000).toFixed(0)}M`, label: 'Subs' },
              { icon: Film, value: channelMovies.length, label: 'Movies' },
              { icon: Clapperboard, value: channelSeries.length, label: 'Series' },
              { icon: Star, value: avgRating, label: 'Rating' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-2">
                <Icon size={14} className="text-white/70 shrink-0" />
                <div><p className="text-white font-bold text-xs sm:text-sm">{value}</p><p className="text-white/60 text-[10px]">{label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('movies')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'movies' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Film size={16} /> Movies ({channelMovies.length})
          </button>
          <button
            onClick={() => setActiveTab('series')}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeTab === 'series' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Clapperboard size={16} /> Series ({channelSeries.length})
          </button>
        </div>
        <button
          onClick={() => activeTab === 'movies' ? setShowAddMovie(true) : setShowAddSeries(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md text-sm font-medium"
        >
          <Plus size={16} />
          Add {activeTab === 'movies' ? 'Movie' : 'Series'}
        </button>
      </div>

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        channelMovies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {channelMovies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {movie.poster}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{movie.genre}</span>
                      <span className="text-xs text-gray-400">{movie.year}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{movie.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{movie.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock size={12} /> {movie.duration}</span>
                  <span className="flex items-center gap-1"><Globe size={12} /> {movie.language}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onAssignMovie(movie.id, null)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                    <X size={14} /> Remove
                  </button>
                  <button onClick={() => onDeleteMovie(movie.id)} className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-gray-500 text-lg">No movies in this channel</p>
            <button onClick={() => setShowAddMovie(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition-all text-sm font-medium">
              <Plus size={16} /> Add Movie
            </button>
          </div>
        )
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
        channelSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {channelSeries.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {s.poster}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{s.genre}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                        s.status === 'Ongoing' ? 'bg-green-100 text-green-700' : s.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      )}>{s.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{s.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{s.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span>{s.seasons}S · {s.episodes} eps</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {s.episodeDuration}/ep</span>
                  <span className="flex items-center gap-1"><Globe size={12} /> {s.language}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onAssignSeries(s.id, null)} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                    <X size={14} /> Remove
                  </button>
                  <button onClick={() => onDeleteSeries(s.id)} className="px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">📺</div>
            <p className="text-gray-500 text-lg">No series in this channel</p>
            <button onClick={() => setShowAddSeries(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition-all text-sm font-medium">
              <Plus size={16} /> Add Series
            </button>
          </div>
        )
      )}

      {/* Add Movie Modal */}
      {showAddMovie && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Movie to {channel.name}</h3>
              <button onClick={() => { setShowAddMovie(false); setSearchContent(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-gray-100">
              <input type="text" placeholder="Search unassigned movies..." value={searchContent} onChange={(e) => setSearchContent(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredUnassignedMovies.length > 0 ? filteredUnassignedMovies.map(movie => (
                <button key={movie.id} onClick={() => { onAssignMovie(movie.id, channel.id); setShowAddMovie(false); setSearchContent(''); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all text-left group">
                  <span className="text-2xl">{movie.poster}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-violet-700">{movie.title}</p>
                    <p className="text-xs text-gray-400">{movie.genre} · {movie.year} · {movie.language}</p>
                  </div>
                  <div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-gray-600">{movie.rating}</span></div>
                  <Plus size={16} className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )) : (
                <div className="text-center py-8"><p className="text-gray-400">No unassigned movies available</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Series Modal */}
      {showAddSeries && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Series to {channel.name}</h3>
              <button onClick={() => { setShowAddSeries(false); setSearchContent(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-3 border-b border-gray-100">
              <input type="text" placeholder="Search unassigned series..." value={searchContent} onChange={(e) => setSearchContent(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredUnassignedSeries.length > 0 ? filteredUnassignedSeries.map(s => (
                <button key={s.id} onClick={() => { onAssignSeries(s.id, channel.id); setShowAddSeries(false); setSearchContent(''); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all text-left group">
                  <span className="text-2xl">{s.poster}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-violet-700">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.genre} · {s.seasons}S · {s.status}</p>
                  </div>
                  <div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-gray-600">{s.rating}</span></div>
                  <Plus size={16} className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )) : (
                <div className="text-center py-8"><p className="text-gray-400">No unassigned series available</p></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
