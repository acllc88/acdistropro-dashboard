import { useState } from 'react';
import { Client, DistributionChannel, DistributionPlatform } from '../../types';
import {
  Tv2, Plus, Trash2, CheckCircle, Clock, XCircle, Info,
  Copy, Check, X, Zap, Smartphone, Monitor, Globe
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface ClientPortalRokuProps {
  client: Client;
  onAddChannel: (channelId: string, channelName: string, platform: DistributionPlatform) => void;
  onRemoveChannel: (rokuChannelId: string) => void;
}

const PLATFORMS: { id: DistributionPlatform; label: string; icon: string; color: string }[] = [
  { id: 'Apple TV', label: 'Apple TV', icon: '🍎', color: 'from-gray-600 to-gray-800' },
  { id: 'Roku', label: 'Roku', icon: '📺', color: 'from-purple-600 to-indigo-700' },
  { id: 'Android TV', label: 'Android TV', icon: '📱', color: 'from-green-600 to-emerald-700' },
  { id: 'Fire TV', label: 'Fire TV', icon: '🔥', color: 'from-orange-600 to-red-700' },
  { id: 'Samsung Tizen', label: 'Samsung Tizen', icon: '📺', color: 'from-blue-600 to-blue-800' },
  { id: 'LG WebOS', label: 'LG WebOS', icon: '📺', color: 'from-rose-600 to-pink-700' },
  { id: 'Vizio', label: 'Vizio', icon: '📺', color: 'from-amber-600 to-yellow-700' },
  { id: 'iOS', label: 'iOS App', icon: '📲', color: 'from-sky-500 to-blue-600' },
  { id: 'Android', label: 'Android App', icon: '🤖', color: 'from-lime-600 to-green-700' },
  { id: 'Web Player', label: 'Web Player', icon: '🌐', color: 'from-violet-600 to-purple-700' },
];

const statusConfig: Record<DistributionChannel['status'], {
  color: string; bg: string; border: string; icon: React.ElementType; label: string;
}> = {
  Active: {
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
    icon: CheckCircle, label: 'Active',
  },
  Pending: {
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    icon: Clock, label: 'Pending',
  },
  Inactive: {
    color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
    icon: XCircle, label: 'Inactive',
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-white/10 rounded-lg transition-all"
      title="Copy Channel ID"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
}

function getPlatformConfig(platform: DistributionPlatform) {
  return PLATFORMS.find(p => p.id === platform) || PLATFORMS[1]; // Default to Roku
}

export function ClientPortalRoku({ client, onAddChannel, onRemoveChannel }: ClientPortalRokuProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<DistributionPlatform>('Roku');
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [channelIdError, setChannelIdError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<DistributionPlatform | 'all'>('all');

  const activeChannels = client.rokuChannels.filter(ch => ch.status === 'Active');
  const pendingChannels = client.rokuChannels.filter(ch => ch.status === 'Pending');

  const filteredChannels = platformFilter === 'all'
    ? client.rokuChannels
    : client.rokuChannels.filter(ch => ch.platform === platformFilter);

  const platformCounts = PLATFORMS.map(p => ({
    ...p,
    count: client.rokuChannels.filter(ch => ch.platform === p.id).length
  })).filter(p => p.count > 0);

  const validateChannelId = (id: string) => {
    if (!id.trim()) return 'Channel/App ID is required';
    if (id.trim().length < 4) return 'ID must be at least 4 characters';
    if (client.rokuChannels.some(ch => ch.channelId.toLowerCase() === id.trim().toLowerCase())) {
      return 'This Channel ID is already registered';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateChannelId(newChannelId);
    if (error) { setChannelIdError(error); return; }
    if (!newChannelName.trim()) return;
    onAddChannel(newChannelId.trim().toUpperCase(), newChannelName.trim(), selectedPlatform);
    setNewChannelId('');
    setNewChannelName('');
    setChannelIdError('');
    setShowAddForm(false);
    setSelectedPlatform('Roku');
  };

  const handleDelete = (channelId: string) => {
    if (confirmDelete === channelId) {
      onRemoveChannel(channelId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(channelId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 flex-wrap">
            <Tv2 size={28} className="text-cyan-400" />
            Distribution Channels
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Add your OTT channel IDs for all platforms so admin can distribute content
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm"
            >
              <Plus size={16} />
              Add Channel
            </button>
          )}
        </div>
      </div>

      {/* Platform Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center">
          <Globe size={20} className="text-cyan-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-white">{client.rokuChannels.length}</p>
          <p className="text-xs text-slate-400">Total Channels</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <CheckCircle size={20} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-emerald-400">{activeChannels.length}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <Clock size={20} className="text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-black text-amber-400">{pendingChannels.length}</p>
          <p className="text-xs text-slate-400">Pending</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-center col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {platformCounts.slice(0, 4).map(p => (
              <span key={p.id} className="text-sm" title={p.label}>{p.icon}</span>
            ))}
            {platformCounts.length > 4 && <span className="text-xs text-slate-500">+{platformCounts.length - 4}</span>}
          </div>
          <p className="text-xs text-slate-400 mt-1">{platformCounts.length} Platforms</p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-cyan-400" />
              Register Distribution Channel
            </h3>
            <button
              onClick={() => { setShowAddForm(false); setNewChannelId(''); setNewChannelName(''); setChannelIdError(''); }}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Select Platform <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {PLATFORMS.map(platform => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border',
                      selectedPlatform === platform.id
                        ? 'bg-gradient-to-r ' + platform.color + ' text-white border-transparent shadow-lg'
                        : 'bg-slate-800 text-slate-300 border-white/10 hover:border-white/20'
                    )}
                  >
                    <span className="text-base">{platform.icon}</span>
                    <span className="truncate">{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel ID & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Channel/App ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newChannelId}
                  onChange={(e) => { setNewChannelId(e.target.value.toUpperCase()); setChannelIdError(''); }}
                  placeholder="e.g. 12345 or ABCDEF"
                  className={cn(
                    'w-full px-3 py-2.5 bg-slate-800 border rounded-xl text-white placeholder-slate-600 text-sm font-mono focus:outline-none transition-all',
                    channelIdError
                      ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/30'
                      : 'border-white/10 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50'
                  )}
                />
                {channelIdError && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <XCircle size={10} /> {channelIdError}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                  Channel Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. My Entertainment Channel"
                  className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setNewChannelId(''); setNewChannelName(''); setChannelIdError(''); }}
                className="flex-1 py-2.5 text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newChannelId || !newChannelName}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap size={14} />
                Register on {selectedPlatform}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
        <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <p className="font-medium text-cyan-300 mb-1">Multi-Platform Distribution</p>
          <p>Add your channel IDs for each platform where you distribute content. Admin will verify each channel and can then push movies & series directly to your OTT apps.</p>
          <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" /> Active = Ready</span>
            <span className="flex items-center gap-1"><Clock size={10} className="text-amber-400" /> Pending = Awaiting approval</span>
          </div>
        </div>
      </div>

      {/* Platform Filter */}
      {client.rokuChannels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPlatformFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              platformFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            )}
          >
            All ({client.rokuChannels.length})
          </button>
          {platformCounts.map(p => (
            <button
              key={p.id}
              onClick={() => setPlatformFilter(p.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                platformFilter === p.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
              )}
            >
              <span>{p.icon}</span>
              {p.count}
            </button>
          ))}
        </div>
      )}

      {/* Channel List */}
      {client.rokuChannels.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-white/5 rounded-2xl">
          <Tv2 size={32} className="text-cyan-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Distribution Channels</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mb-4">
            Add your OTT channel IDs so admin can start distributing content to your apps.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-sm"
          >
            <Plus size={16} />
            Add First Channel
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Your Distribution Channels ({filteredChannels.length})
          </h2>
          {filteredChannels.map((channel) => {
            const cfg = statusConfig[channel.status];
            const StatusIcon = cfg.icon;
            const platformCfg = getPlatformConfig(channel.platform);
            const isConfirmingDelete = confirmDelete === channel.id;
            return (
              <div
                key={channel.id}
                className={cn('bg-slate-900 border rounded-xl p-4 transition-all', cfg.border)}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br', platformCfg.color)}>
                    <span className="text-lg">{platformCfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-white">{channel.channelName}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                        {channel.platform}
                      </span>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium',
                        cfg.bg, cfg.color
                      )}>
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{channel.channelId}</code>
                      <CopyButton text={channel.channelId} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Added {new Date(channel.addedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(channel.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0',
                      isConfirmingDelete
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                    )}
                  >
                    <Trash2 size={12} />
                    {isConfirmingDelete ? 'Confirm?' : 'Remove'}
                  </button>
                </div>
                {channel.status === 'Pending' && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                    <Clock size={12} className="text-amber-400 shrink-0" />
                    <p className="text-xs text-amber-300">Awaiting admin verification before content can be distributed.</p>
                  </div>
                )}
                {channel.status === 'Active' && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg">
                    <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                    <p className="text-xs text-emerald-300">Channel verified! Admin can now distribute content.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Supported Platforms */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Monitor size={16} className="text-violet-400" />
          Supported Platforms
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLATFORMS.map(platform => (
            <div
              key={platform.id}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5"
            >
              <span className="text-lg">{platform.icon}</span>
              <span className="text-xs text-slate-300 font-medium">{platform.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
          <Smartphone size={12} />
          Add your channel ID from each platform's developer dashboard
        </p>
      </div>
    </div>
  );
}
