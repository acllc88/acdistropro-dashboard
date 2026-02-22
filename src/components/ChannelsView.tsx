import { Search, Plus, Users, Film, Star, Eye, Trash2, Clapperboard, UserCheck } from 'lucide-react';
import { Client, Channel, Movie, Series } from '../types';
import { useState } from 'react';
import { cn } from '../utils/cn';

interface ChannelsViewProps {
  channels: Channel[];
  clients: Client[];
  movies: Movie[];
  series: Series[];
  onViewChannel: (channelId: string) => void;
  onAddChannel: () => void;
  onDeleteChannel: (channelId: string) => void;
}

export function ChannelsView({ channels, clients, movies, series, onViewChannel, onAddChannel, onDeleteChannel }: ChannelsViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(channels.map(c => c.category)))];

  const filtered = channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || ch.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Channels</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage your OTT streaming channels</p>
        </div>
        <button
          onClick={onAddChannel}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 font-medium text-sm"
        >
          <Plus size={18} />
          Add Channel
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                categoryFilter === cat
                  ? "bg-violet-100 text-violet-700 shadow-sm"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((channel) => {
          const channelMovies = movies.filter(m => channel.movieIds.includes(m.id));
          const channelSeries = series.filter(s => channel.seriesIds.includes(s.id));
          const allContent = [...channelMovies.map(m => m.rating), ...channelSeries.map(s => s.rating)];
          const avgRating = allContent.length > 0
            ? (allContent.reduce((s, r) => s + r, 0) / allContent.length).toFixed(1)
            : 'N/A';
          const owner = clients.find(cl => cl.channelIds.includes(channel.id));
          return (
            <div key={channel.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
              {/* Channel Header */}
              <div className={`bg-gradient-to-r ${channel.color} p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    {channel.logo}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{channel.name}</h3>
                    <span className="text-xs text-white/70 bg-white/20 px-2 py-0.5 rounded-full">{channel.category}</span>
                  </div>
                </div>
              </div>

              {/* Channel Body */}
              <div className="p-5">
                {/* Owner */}
                {owner && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <UserCheck size={14} className="text-blue-500" />
                    <span>Owned by <strong className="text-gray-800">{owner.name}</strong></span>
                  </div>
                )}

                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{channel.description}</p>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <Users size={13} className="text-violet-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{(channel.subscribers / 1000000).toFixed(0)}M</p>
                    <p className="text-xs text-gray-400">Subs</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <Film size={13} className="text-amber-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{channelMovies.length}</p>
                    <p className="text-xs text-gray-400">Movies</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <Clapperboard size={13} className="text-pink-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{channelSeries.length}</p>
                    <p className="text-xs text-gray-400">Series</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <Star size={13} className="text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-gray-900">{avgRating}</p>
                    <p className="text-xs text-gray-400">Rating</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewChannel(channel.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-700 rounded-xl text-sm font-medium transition-all"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteChannel(channel.id); }}
                    className="px-3 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-gray-500 text-lg">No channels found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
