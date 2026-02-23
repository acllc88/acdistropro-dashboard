import { X } from 'lucide-react';
import { useState } from 'react';
import { Client } from '../types';

interface AddChannelModalProps {
  clients: Client[];
  onClose: () => void;
  onAdd: (channel: { name: string; category: string; description: string; logo: string; clientId: string | null }) => void;
}

const emojis = [
  '📺','🎬','🎭','🎪','🎯','🎮','🏰','🚀','🌟','📡',
  '🎵','🎸','⚡','🔥','🌊','🎨','🏆','👑','💎','🌈',
  '🎤','🎹','🥁','🎺','🎻','🦁','🐉','🛸','💫','🎊',
  '🎉','💥','🌍','🔬','💡','🖥️','📱','🎓','❤️','⭐',
];
const categories = ['Entertainment', 'Family', 'Premium', 'Sports', 'News', 'Documentary', 'Music'];

export function AddChannelModal({ clients, onClose, onAdd }: AddChannelModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('📺');
  const [clientId, setClientId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name, category, description, logo, clientId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Add New Channel</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Logo Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel Icon</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setLogo(e)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    logo === e ? 'bg-violet-100 ring-2 ring-violet-500 scale-110' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    category === c ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Assign to Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Client (optional)</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setClientId(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  clientId === null ? 'bg-gray-200 text-gray-700' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                None
              </button>
              {clients.map(cl => (
                <button
                  key={cl.id}
                  type="button"
                  onClick={() => setClientId(cl.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    clientId === cl.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>{cl.logo}</span>
                  {cl.name}
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
              placeholder="Brief description of the channel"
              rows={3}
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
              className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-violet-500/25 transition-all"
            >
              Add Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
