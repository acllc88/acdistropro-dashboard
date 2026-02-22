import { Search, Plus, Star, Clock, Globe, ArrowRightLeft, Trash2, X, Clapperboard } from 'lucide-react';
import { Channel, Series } from '../types';
import { useState } from 'react';
import { cn } from '../utils/cn';

interface SeriesViewProps {
  series: Series[];
  channels: Channel[];
  onAddSeries: () => void;
  onDeleteSeries: (seriesId: string) => void;
  onAssignSeries: (seriesId: string, channelId: string | null) => void;
}

export function SeriesView({ series, channels, onAddSeries, onDeleteSeries, onAssignSeries }: SeriesViewProps) {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignFilter, setAssignFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [assigningSeries, setAssigningSeries] = useState<string | null>(null);

  const genres = ['All', ...Array.from(new Set(series.map(s => s.genre)))];
  const statuses = ['All', 'Ongoing', 'Completed', 'Cancelled'];

  const filtered = series.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === 'All' || s.genre === genreFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchAssign = assignFilter === 'all' ||
      (assignFilter === 'assigned' && s.channelId !== null) ||
      (assignFilter === 'unassigned' && s.channelId === null);
    return matchSearch && matchGenre && matchStatus && matchAssign;
  });

  const getChannel = (channelId: string | null) => channels.find(c => c.id === channelId);

  const statusBadge: Record<string, string> = {
    Ongoing: 'bg-green-100 text-green-700',
    Completed: 'bg-blue-100 text-blue-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Series</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage TV series and assign them to channels</p>
        </div>
        <button
          onClick={onAddSeries}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 font-medium text-sm"
        >
          <Plus size={18} />
          Add Series
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenreFilter(g)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                genreFilter === g
                  ? "bg-violet-100 text-violet-700"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                statusFilter === s
                  ? "bg-pink-100 text-pink-700"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'assigned', 'unassigned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setAssignFilter(f)}
              className={cn(
                "px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                assignFilter === f
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((s) => {
          const channel = getChannel(s.channelId);
          const isAssigning = assigningSeries === s.id;
          return (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group relative">
              {/* Series Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                    {s.poster}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate text-lg">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">{s.genre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[s.status]}`}>{s.status}</span>
                      <span className="text-xs text-gray-400">{s.year}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-amber-700">{s.rating}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-5">
                <p className="text-sm text-gray-500 line-clamp-2">{s.description}</p>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 px-5 py-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Clapperboard size={12} />
                  <span>{s.seasons} Seasons</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{s.episodes} Episodes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{s.episodeDuration}/ep</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={12} />
                  <span>{s.language}</span>
                </div>
              </div>

              {/* Channel Assignment */}
              <div className="px-5 pb-4">
                {channel ? (
                  <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${channel.color} rounded-xl`}>
                    <span className="text-lg">{channel.logo}</span>
                    <span className="text-sm font-medium text-white flex-1">{channel.name}</span>
                    <button
                      onClick={() => onAssignSeries(s.id, null)}
                      className="text-white/70 hover:text-white transition-colors"
                      title="Remove from channel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <span className="text-sm text-gray-400 flex-1">Not assigned to any channel</span>
                  </div>
                )}
              </div>

              {/* Assign Dropdown */}
              {isAssigning && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col p-5 z-10">
                  <h4 className="font-semibold text-gray-900 mb-3">Assign to Channel</h4>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {channels.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => { onAssignSeries(s.id, ch.id); setAssigningSeries(null); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-left",
                          s.channelId === ch.id && "ring-2 ring-violet-500 bg-violet-50"
                        )}
                      >
                        <span className="text-lg">{ch.logo}</span>
                        <span className="text-sm font-medium text-gray-700">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAssigningSeries(null)}
                    className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={() => setAssigningSeries(isAssigning ? null : s.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-700 rounded-xl text-sm font-medium transition-all"
                >
                  <ArrowRightLeft size={16} />
                  {s.channelId ? 'Reassign' : 'Assign'}
                </button>
                <button
                  onClick={() => onDeleteSeries(s.id)}
                  className="px-3 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-gray-500 text-lg">No series found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
