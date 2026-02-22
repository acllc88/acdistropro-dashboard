import { X } from 'lucide-react';
import { useState } from 'react';
import { Channel } from '../types';

interface AddSeriesModalProps {
  channels: Channel[];
  onClose: () => void;
  onAdd: (series: { title: string; genre: string; year: number; rating: number; seasons: number; episodes: number; episodeDuration: string; description: string; language: string; poster: string; status: 'Ongoing' | 'Completed' | 'Cancelled'; channelId: string | null }) => void;
}

const emojis = ['🎬', '🎭', '👑', '🚀', '⚡', '🐉', '💰', '💥', '⚽', '🔴', '🌀', '🏠', '🌌', '🦑', '🏜️', '🎪', '🎯', '🌟', '🔥', '🌊'];
const genres = ['Sci-Fi', 'Drama', 'Thriller', 'Action', 'Fantasy', 'Comedy', 'Horror', 'Romance', 'Documentary', 'Animation'];
const languages = ['English', 'Spanish', 'Korean', 'Japanese', 'French', 'Hindi', 'German'];
const statusOptions: ('Ongoing' | 'Completed' | 'Cancelled')[] = ['Ongoing', 'Completed', 'Cancelled'];

export function AddSeriesModal({ channels, onClose, onAdd }: AddSeriesModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Drama');
  const [year, setYear] = useState(2024);
  const [rating, setRating] = useState(8.0);
  const [seasons, setSeasons] = useState(1);
  const [episodes, setEpisodes] = useState(10);
  const [episodeDuration, setEpisodeDuration] = useState('45m');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [poster, setPoster] = useState('🎬');
  const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Cancelled'>('Ongoing');
  const [channelId, setChannelId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, genre, year, rating, seasons, episodes, episodeDuration, description, language, poster, status, channelId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add New Series</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Poster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Series Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setPoster(e)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                    poster === e ? 'bg-pink-100 ring-2 ring-pink-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter series title"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              required
            />
          </div>

          {/* Genre, Year, Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={1950}
                max={2030}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Ongoing' | 'Completed' | 'Cancelled')}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Rating, Seasons, Episodes, Duration */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                step={0.1}
                min={0}
                max={10}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seasons</label>
              <input
                type="number"
                value={seasons}
                onChange={(e) => setSeasons(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Episodes</label>
              <input
                type="number"
                value={episodes}
                onChange={(e) => setEpisodes(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ep. Duration</label>
              <input
                type="text"
                value={episodeDuration}
                onChange={(e) => setEpisodeDuration(e.target.value)}
                placeholder="45m"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            >
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Assign to Channel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Channel (optional)</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setChannelId(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  channelId === null ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                None
              </button>
              {channels.map(ch => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannelId(ch.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    channelId === ch.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>{ch.logo}</span>
                  {ch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the series"
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl shadow-lg shadow-pink-500/25 transition-all"
            >
              Add Series
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
