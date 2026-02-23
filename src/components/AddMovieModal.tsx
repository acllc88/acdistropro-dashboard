import { X, Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Channel } from '../types';
import { getAIRating } from '../services/aiService';

interface AddMovieModalProps {
  channels: Channel[];
  onClose: () => void;
  onAdd: (movie: {
    title: string; genre: string; year: number; rating: number;
    duration: string; description: string; language: string;
    poster: string; channelId: string | null;
  }) => void;
}

const emojis = ['🎬', '🎭', '👑', '🚀', '⚡', '🐉', '💰', '💥', '⚽', '🔴', '🌀', '🏠', '🌌', '🦑', '🏜️', '🎪', '🎯', '🌟', '🔥', '🌊'];
const genres = ['Sci-Fi', 'Drama', 'Thriller', 'Action', 'Fantasy', 'Comedy', 'Horror', 'Romance', 'Documentary', 'Animation'];
const languages = ['English', 'Spanish', 'Korean', 'Japanese', 'French', 'Hindi', 'German'];

export function AddMovieModal({ channels, onClose, onAdd }: AddMovieModalProps) {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Sci-Fi');
  const [year, setYear] = useState(2024);
  const [rating, setRating] = useState(8.0);
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [poster, setPoster] = useState('🎬');
  const [channelId, setChannelId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIRate = async () => {
    if (!title.trim()) return;
    setAiLoading(true);
    try {
      const r = await getAIRating(title, genre, 'movie');
      setRating(r);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, genre, year, rating, duration, description, language, poster, channelId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add New Movie</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Poster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Movie Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => (
                <button key={e} type="button" onClick={() => setPoster(e)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${poster === e ? 'bg-amber-100 ring-2 ring-amber-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter movie title"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              required />
          </div>

          {/* Genre & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
                min={1900} max={2030}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
          </div>

          {/* Rating (AI) & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0–10)</label>
              <div className="flex gap-2">
                <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))}
                  step={0.1} min={0} max={10}
                  className="flex-1 min-w-0 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                <button type="button" onClick={handleAIRate} disabled={aiLoading || !title.trim()}
                  title="Auto-rate with AI"
                  className="flex items-center gap-1 px-2.5 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl text-xs font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md">
                  {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  AI
                </button>
              </div>
              {aiLoading && <p className="text-xs text-violet-500 mt-1">AI is rating...</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 120m"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Assign to Channel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Channel (optional)</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setChannelId(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${channelId === null ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                None
              </button>
              {channels.map(ch => (
                <button key={ch.id} type="button" onClick={() => setChannelId(ch.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${channelId === ch.id ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  <span>{ch.logo}</span>{ch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the movie" rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl shadow-lg shadow-amber-500/25 transition-all">
              Add Movie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
