import {
  Search, Plus, Tv, Film, Clapperboard, Eye, Trash2,
  Mail, Phone, Building2, ShieldOff, UserX, UserCheck,
  Tv2, AlertTriangle, Shield
} from 'lucide-react';
import { Client, Channel, Movie, Series } from '../types';
import { useState } from 'react';
import { cn } from '../utils/cn';

interface ClientsViewProps {
  clients: Client[];
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  onViewClient: (clientId: string) => void;
  onAddClient: () => void;
  onDeleteClient: (clientId: string) => void;
  onUpdateClientStatus: (clientId: string, status: Client['status'], reason?: string) => void;
}

export function ClientsView({
  clients, channels, movies, series,
  onViewClient, onAddClient, onDeleteClient, onUpdateClientStatus
}: ClientsViewProps) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionModal, setActionModal] = useState<{ clientId: string; action: 'ban' | 'suspend' | 'activate' } | null>(null);
  const [actionReason, setActionReason] = useState('');

  const plans = ['All', 'Basic', 'Standard', 'Premium', 'Enterprise'];
  const statuses = ['All', 'Active', 'Inactive', 'Suspended', 'Banned'];

  const filtered = clients.filter(cl => {
    const matchSearch = cl.name.toLowerCase().includes(search.toLowerCase()) || cl.company.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === 'All' || cl.plan === planFilter;
    const matchStatus = statusFilter === 'All' || cl.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const getClientStats = (client: Client) => {
    const clientChannels = channels.filter(ch => client.channelIds.includes(ch.id));
    const totalMovies = movies.filter(m => clientChannels.some(ch => ch.movieIds.includes(m.id))).length;
    const totalSeries = series.filter(s => clientChannels.some(ch => ch.seriesIds.includes(s.id))).length;
    const totalSubs = clientChannels.reduce((sum, ch) => sum + ch.subscribers, 0);
    return { channelCount: clientChannels.length, totalMovies, totalSeries, totalSubs };
  };

  const planColors: Record<string, string> = {
    Basic: 'bg-gray-100 text-gray-700',
    Standard: 'bg-blue-100 text-blue-700',
    Premium: 'bg-purple-100 text-purple-700',
    Enterprise: 'bg-amber-100 text-amber-700',
  };

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

  const handleActionConfirm = () => {
    if (!actionModal) return;
    if (actionModal.action !== 'activate' && !actionReason.trim()) return;
    const statusMap = { ban: 'Banned', suspend: 'Suspended', activate: 'Active' } as const;
    onUpdateClientStatus(actionModal.clientId, statusMap[actionModal.action], actionReason);
    setActionModal(null);
    setActionReason('');
  };

  const activeCount = clients.filter(c => c.status === 'Active').length;
  const suspendedCount = clients.filter(c => c.status === 'Suspended').length;
  const bannedCount = clients.filter(c => c.status === 'Banned').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage clients, control access, and monitor activity</p>
        </div>
        <button
          onClick={onAddClient}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-medium text-sm"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Status Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200' },
          { label: 'Active', value: activeCount, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Suspended', value: suspendedCount, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: 'Banned', value: bannedCount, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-3 sm:py-4', s.bg, s.border)}>
            <p className={cn('text-xl sm:text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {plans.map(p => (
            <button key={p} onClick={() => setPlanFilter(p)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition-all', planFilter === p ? 'bg-violet-100 text-violet-700' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200')}>{p}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition-all', statusFilter === s ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200')}>{s}</button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((client) => {
          const stats = getClientStats(client);
          const isBanned = client.status === 'Banned';
          const isSuspended = client.status === 'Suspended';
          const isActive = client.status === 'Active';

          return (
            <div key={client.id} className={cn(
              'bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all group',
              isBanned ? 'border-red-200' : isSuspended ? 'border-amber-200' : 'border-gray-100'
            )}>
              {/* Client Header */}
              <div className={`bg-gradient-to-r ${client.color} p-5 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10" />
                {/* Status banner for banned/suspended */}
                {(isBanned || isSuspended) && (
                  <div className={cn('absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm',
                    isBanned ? 'bg-red-500/80 text-white' : 'bg-amber-500/80 text-white'
                  )}>
                    <ShieldOff size={10} />
                    {client.status}
                  </div>
                )}
                <div className="relative flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg">{client.logo}</div>
                    <div className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white', statusDot[client.status])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white truncate">{client.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColors[client.plan]}`}>{client.plan}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[client.status]}`}>{client.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Body */}
              <div className="p-5">
                {/* Suspension/Ban reason */}
                {(client.banReason || client.suspendReason) && (
                  <div className={cn('flex items-start gap-2 mb-3 px-3 py-2 rounded-xl text-xs',
                    isBanned ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  )}>
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.banReason || client.suspendReason}</span>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Building2 size={13} className="text-gray-400 shrink-0" /><span className="truncate">{client.company}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={13} className="text-gray-400 shrink-0" /><span className="truncate">{client.email}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={13} className="text-gray-400 shrink-0" /><span>{client.phone}</span></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1"><Tv size={12} className="text-violet-500" /></div>
                    <p className="text-sm font-bold text-gray-900">{stats.channelCount}</p>
                    <p className="text-xs text-gray-400">Ch.</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1"><Film size={12} className="text-amber-500" /></div>
                    <p className="text-sm font-bold text-gray-900">{stats.totalMovies}</p>
                    <p className="text-xs text-gray-400">Movies</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1"><Clapperboard size={12} className="text-pink-500" /></div>
                    <p className="text-sm font-bold text-gray-900">{stats.totalSeries}</p>
                    <p className="text-xs text-gray-400">Series</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-center gap-1 mb-1"><Tv2 size={12} className="text-cyan-500" /></div>
                    <p className="text-sm font-bold text-gray-900">{client.rokuChannels.length}</p>
                    <p className="text-xs text-gray-400">Dist.</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-xl">
                    <p className="text-sm font-black text-emerald-600">{client.revenueShare}%</p>
                    <p className="text-xs text-emerald-700">Rev Share</p>
                  </div>
                </div>

                {/* Roku pending indicator */}
                {client.rokuChannels.some(d => d.status === 'Pending') && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border border-cyan-200 rounded-xl mb-3">
                    <Tv2 size={13} className="text-cyan-500 shrink-0" />
                    <span className="text-xs text-cyan-700 font-medium">
                      {client.rokuChannels.filter(d => d.status === 'Pending').length} Roku channel(s) pending approval
                    </span>
                  </div>
                )}

                {/* Main actions */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => onViewClient(client.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-700 rounded-xl text-sm font-medium transition-all"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}
                    className="px-3 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Admin Status Controls */}
                <div className="flex gap-1.5 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1 mr-1">
                    <Shield size={12} className="text-gray-300" />
                  </div>
                  {!isBanned && (
                    <button
                      onClick={() => { setActionModal({ clientId: client.id, action: 'ban' }); setActionReason(''); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-all"
                    >
                      <ShieldOff size={11} /> Ban
                    </button>
                  )}
                  {!isSuspended && !isBanned && (
                    <button
                      onClick={() => { setActionModal({ clientId: client.id, action: 'suspend' }); setActionReason(''); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs font-medium transition-all"
                    >
                      <UserX size={11} /> Suspend
                    </button>
                  )}
                  {!isActive && (
                    <button
                      onClick={() => onUpdateClientStatus(client.id, 'Active')}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-medium transition-all"
                    >
                      <UserCheck size={11} /> Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👤</div>
          <p className="text-gray-500 text-lg">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={cn(
              'px-6 py-5 flex items-center gap-3',
              actionModal.action === 'ban' ? 'bg-red-50 border-b border-red-100' : 'bg-amber-50 border-b border-amber-100'
            )}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                actionModal.action === 'ban' ? 'bg-red-100' : 'bg-amber-100'
              )}>
                {actionModal.action === 'ban'
                  ? <ShieldOff size={20} className="text-red-600" />
                  : <UserX size={20} className="text-amber-600" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{actionModal.action === 'ban' ? 'Ban User' : 'Suspend User'}</h3>
                <p className="text-sm text-gray-500">{clients.find(c => c.id === actionModal.clientId)?.name}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={actionModal.action === 'ban' ? 'Reason for banning...' : 'Reason for suspension...'}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActionModal(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button
                  onClick={handleActionConfirm}
                  disabled={!actionReason.trim()}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    actionModal.action === 'ban'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600'
                  )}
                >
                  {actionModal.action === 'ban' ? <><ShieldOff size={15} /> Confirm Ban</> : <><UserX size={15} /> Confirm Suspend</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
