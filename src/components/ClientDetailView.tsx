import {
  ArrowLeft, Users, Tv, Film, Clapperboard, Star, Clock,
  Plus, X, Mail, Building2, Bell, Send,
  Shield, ShieldOff, UserCheck, UserX, AlertTriangle, CheckCircle,
  Tv2, Copy, Check, Activity
} from 'lucide-react';
import { Client, Channel, Movie, Series, ClientNotification, DistributionChannel, AdminAction, DeviceDistribution } from '../types';
import { useState } from 'react';
import { cn } from '../utils/cn';

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  );
}

interface ClientDetailViewProps {
  client: Client;
  channels: Channel[];
  allChannels: Channel[];
  movies: Movie[];
  series: Series[];
  onBack: () => void;
  onViewChannel: (channelId: string) => void;
  onAssignChannel: (channelId: string, clientId: string | null) => void;
  onSendNotification: (clientId: string, notif: Omit<ClientNotification, 'id' | 'date' | 'read'>) => void;
  onUpdateRokuStatus: (clientId: string, deviceId: string, status: DistributionChannel['status']) => void;
  onUpdateClientStatus: (clientId: string, status: Client['status'], reason?: string) => void;
  onChangePassword: (clientId: string, newPassword: string) => void;
  onUpdateRevenueShare: (clientId: string, revenueShare: number, monthlyFee: number) => void;
  onUpdateDeviceDistribution: (clientId: string, dd: DeviceDistribution) => void;
}

export function ClientDetailView({
  client, channels, allChannels, movies, series,
  onBack, onViewChannel, onAssignChannel, onSendNotification,
  onUpdateRokuStatus, onUpdateClientStatus, onChangePassword, onUpdateRevenueShare,
  onUpdateDeviceDistribution
}: ClientDetailViewProps) {
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'ban' | 'suspend' | 'activate' | 'warning' | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [searchChannels, setSearchChannels] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'content' | 'notifications' | 'roku' | 'actions'>('overview');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Revenue share edit state
  const [showRevenueEdit, setShowRevenueEdit] = useState(false);
  const [editRevenueShare, setEditRevenueShare] = useState(client.revenueShare);
  const [editMonthlyFee, setEditMonthlyFee] = useState(client.monthlyFee);
  const [revenueSuccess, setRevenueSuccess] = useState('');

  // Device distribution edit state
  const [showDeviceEdit, setShowDeviceEdit] = useState(false);
  const [editDD, setEditDD] = useState<DeviceDistribution>(client.deviceDistribution || { mobile: 0, desktop: 0, smartTV: 0, tablet: 0 });
  const [ddSuccess, setDdSuccess] = useState('');

  const unassignedChannels = allChannels.filter(ch => ch.clientId === null);
  const filteredUnassigned = unassignedChannels.filter(ch =>
    ch.name.toLowerCase().includes(searchChannels.toLowerCase())
  );

  const totalSubs = channels.reduce((sum, ch) => sum + ch.subscribers, 0);
  const clientMovies = movies.filter(m => channels.some(ch => ch.movieIds.includes(m.id)));
  const clientSeries = series.filter(s => channels.some(ch => ch.seriesIds.includes(s.id)));
  const unreadNotifs = client.notifications.filter(n => !n.read).length;

  const handleSendNotif = () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    onSendNotification(client.id, { title: notifTitle, message: notifMessage, type: notifType });
    setNotifTitle('');
    setNotifMessage('');
    setNotifType('info');
    setShowNotifModal(false);
  };

  const handleStatusAction = () => {
    if (!statusAction) return;
    if ((statusAction === 'ban' || statusAction === 'suspend') && !statusReason.trim()) return;
    if (statusAction === 'ban') onUpdateClientStatus(client.id, 'Banned', statusReason);
    else if (statusAction === 'suspend') onUpdateClientStatus(client.id, 'Suspended', statusReason);
    else if (statusAction === 'activate') onUpdateClientStatus(client.id, 'Active');
    else if (statusAction === 'warning') {
      onSendNotification(client.id, {
        title: '⚠️ Admin Warning',
        message: statusReason || 'You have received a warning from the admin. Please review your account activity.',
        type: 'alert',
      });
    }
    setShowStatusModal(false);
    setStatusAction(null);
    setStatusReason('');
  };

  const openStatusModal = (action: 'ban' | 'suspend' | 'activate' | 'warning') => {
    setStatusAction(action);
    setStatusReason('');
    setShowStatusModal(true);
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

  const typeColors: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    alert: 'bg-red-100 text-red-700 border-red-200',
  };

  const rokuStatusConfig: Record<DistributionChannel['status'], { color: string; bg: string; label: string }> = {
    Active: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Active' },
    Pending: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending' },
    Inactive: { color: 'text-red-700', bg: 'bg-red-100', label: 'Inactive' },
  };

  const adminActions: AdminAction[] = client.adminActions || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors group w-fit">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Clients</span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {client.status !== 'Banned' && (
            <button onClick={() => openStatusModal('ban')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all">
              <ShieldOff size={12} /> <span className="hidden sm:inline">Ban</span><span className="sm:hidden">Ban</span>
            </button>
          )}
          {client.status !== 'Suspended' && client.status !== 'Banned' && (
            <button onClick={() => openStatusModal('suspend')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all">
              <UserX size={12} /> Suspend
            </button>
          )}
          {(client.status === 'Suspended' || client.status === 'Banned' || client.status === 'Inactive') && (
            <button onClick={() => openStatusModal('activate')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all">
              <UserCheck size={12} /> Activate
            </button>
          )}
          <button onClick={() => openStatusModal('warning')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all">
            <AlertTriangle size={12} /> Warn
          </button>
          <button onClick={() => setShowNotifModal(true)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg sm:rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all shadow-md text-xs sm:text-sm font-medium">
            <Send size={14} /> Notify
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {(client.status === 'Banned' || client.status === 'Suspended') && (
        <div className={cn(
          'flex items-center gap-4 px-6 py-4 rounded-2xl border',
          client.status === 'Banned' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
        )}>
          <ShieldOff size={20} className={client.status === 'Banned' ? 'text-red-500' : 'text-amber-500'} />
          <div>
            <p className={cn('font-bold', client.status === 'Banned' ? 'text-red-700' : 'text-amber-700')}>
              Account {client.status}
            </p>
            {(client.banReason || client.suspendReason) && (
              <p className="text-sm text-gray-600 mt-0.5">
                Reason: {client.banReason || client.suspendReason}
              </p>
            )}
          </div>
          <button
            onClick={() => openStatusModal('activate')}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            <UserCheck size={14} /> Restore Access
          </button>
        </div>
      )}

      {/* Client Header */}
      <div className={`bg-gradient-to-r ${client.color} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-4xl shadow-xl shrink-0">{client.logo}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white truncate">{client.name}</h1>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${planColors[client.plan]}`}>{client.plan}</span>
                <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[client.status]}`}>{client.status}</span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm">
                <div className="flex items-center gap-1"><Building2 size={12} /> <span className="truncate">{client.company}</span></div>
                <div className="flex items-center gap-1 hidden sm:flex"><Mail size={12} /> <span className="truncate">{client.email}</span></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {[
              { icon: Tv, value: channels.length, label: 'Ch' },
              { icon: Film, value: clientMovies.length, label: 'Movies' },
              { icon: Clapperboard, value: clientSeries.length, label: 'Series' },
              { icon: Users, value: totalSubs > 0 ? `${(totalSubs / 1000000).toFixed(0)}M` : '0', label: 'Subs' },
              { icon: Tv2, value: client.rokuChannels.length, label: 'Dist.' },
              { icon: Bell, value: unreadNotifs, label: 'Alerts' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-1.5 sm:gap-2 bg-white/10 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2">
                <Icon size={14} className="text-white/70 shrink-0" />
                <div><p className="text-white font-bold text-xs sm:text-sm">{value}</p><p className="text-white/60 text-[10px]">{label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-max sm:w-auto">
          {(['overview', 'channels', 'content', 'roku', 'notifications', 'actions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              'px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap',
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}>
              {tab === 'roku' && <Tv2 size={13} />}
              {tab === 'roku'
                ? <>Dist.{client.rokuChannels.length > 0 && <span className="bg-cyan-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{client.rokuChannels.length}</span>}</>
                : tab === 'notifications'
                ? <>Notifs{unreadNotifs > 0 && <span className="bg-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifs}</span>}</>
                : <span className="capitalize">{tab}</span>
              }
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Tv size={18} className="text-violet-500" /><h2 className="text-lg font-semibold text-gray-900">Channels</h2></div>
              <span className="text-xs text-gray-400">{channels.length} total</span>
            </div>
            <div className="divide-y divide-gray-50">
              {channels.length > 0 ? channels.map(ch => {
                const chMovies = movies.filter(m => ch.movieIds.includes(m.id));
                const chSeries = series.filter(s => ch.seriesIds.includes(s.id));
                return (
                  <div key={ch.id} onClick={() => onViewChannel(ch.id)} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 cursor-pointer transition-colors group">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition-transform`}>{ch.logo}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">{ch.name}</h3>
                      <p className="text-xs text-gray-500">{chMovies.length} movies · {chSeries.length} series</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{(ch.subscribers / 1000000).toFixed(0)}M</p>
                      <p className="text-xs text-gray-400">subs</p>
                    </div>
                  </div>
                );
              }) : <div className="p-8 text-center text-gray-400">No channels assigned</div>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><Film size={18} className="text-amber-500" /><h2 className="text-lg font-semibold text-gray-900">Top Movies</h2></div>
              <div className="divide-y divide-gray-50">
                {clientMovies.slice(0, 5).map(movie => (
                  <div key={movie.id} className="flex items-center gap-3 px-6 py-3">
                    <span className="text-lg">{movie.poster}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{movie.title}</p><p className="text-xs text-gray-400">{movie.genre} · {movie.year}</p></div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-700">{movie.rating}</span></div>
                  </div>
                ))}
                {clientMovies.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No movies yet</div>}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><Clapperboard size={18} className="text-pink-500" /><h2 className="text-lg font-semibold text-gray-900">Top Series</h2></div>
              <div className="divide-y divide-gray-50">
                {clientSeries.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                    <span className="text-lg">{s.poster}</span>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{s.title}</p><p className="text-xs text-gray-400">{s.seasons}S · {s.episodes} eps · {s.status}</p></div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-700">{s.rating}</span></div>
                  </div>
                ))}
                {clientSeries.length === 0 && <div className="p-6 text-center text-gray-400 text-sm">No series yet</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANNELS TAB ── */}
      {activeTab === 'channels' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Client Channels</h2>
            <button onClick={() => setShowAddChannel(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md text-sm font-medium">
              <Plus size={16} /> Assign Channel
            </button>
          </div>
          {channels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {channels.map(ch => {
                const chMovies = movies.filter(m => ch.movieIds.includes(m.id));
                const chSeries = series.filter(s => ch.seriesIds.includes(s.id));
                return (
                  <div key={ch.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                    <div className={`bg-gradient-to-r ${ch.color} p-5 relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-lg">{ch.logo}</div>
                        <div><h3 className="text-lg font-bold text-white">{ch.name}</h3><span className="text-xs text-white/70">{ch.category}</span></div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-xl"><p className="text-sm font-bold text-gray-900">{(ch.subscribers / 1000000).toFixed(0)}M</p><p className="text-xs text-gray-400">Subs</p></div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl"><p className="text-sm font-bold text-gray-900">{chMovies.length}</p><p className="text-xs text-gray-400">Movies</p></div>
                        <div className="text-center p-2 bg-gray-50 rounded-xl"><p className="text-sm font-bold text-gray-900">{chSeries.length}</p><p className="text-xs text-gray-400">Series</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => onViewChannel(ch.id)} className="flex-1 py-2.5 bg-gray-50 hover:bg-violet-50 text-gray-700 hover:text-violet-700 rounded-xl text-sm font-medium transition-all text-center">View Channel</button>
                        <button onClick={() => onAssignChannel(ch.id, null)} className="px-3 py-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"><X size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">📺</div>
              <p className="text-gray-500 text-lg">No channels assigned</p>
              <button onClick={() => setShowAddChannel(true)} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition-all text-sm font-medium"><Plus size={16} /> Assign Channel</button>
            </div>
          )}
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><Film size={18} className="text-amber-500" /><h2 className="text-lg font-semibold text-gray-900">All Movies ({clientMovies.length})</h2></div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {clientMovies.map(movie => (
                <div key={movie.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/80 transition-colors">
                  <span className="text-lg">{movie.poster}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{movie.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{movie.genre}</span><span>·</span><span>{movie.year}</span><span>·</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {movie.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-700">{movie.rating}</span></div>
                </div>
              ))}
              {clientMovies.length === 0 && <div className="p-8 text-center text-gray-400">No movies</div>}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2"><Clapperboard size={18} className="text-pink-500" /><h2 className="text-lg font-semibold text-gray-900">All Series ({clientSeries.length})</h2></div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {clientSeries.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/80 transition-colors">
                  <span className="text-lg">{s.poster}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{s.genre}</span><span>·</span><span>{s.seasons}S / {s.episodes} eps</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-700">{s.rating}</span></div>
                </div>
              ))}
              {clientSeries.length === 0 && <div className="p-8 text-center text-gray-400">No series</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── DISTRIBUTION CHANNELS TAB ── */}
      {activeTab === 'roku' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Tv2 size={20} className="text-cyan-500" /> Distribution Channels ({client.rokuChannels.length})</h2>
          </div>
          {client.rokuChannels.length > 0 ? (
            <div className="space-y-4">
              {client.rokuChannels.map((device) => {
                const cfg = rokuStatusConfig[device.status];
                return (
                  <div key={device.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-5 flex-wrap">
                      <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center">
                        <Tv2 size={26} className="text-cyan-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">{device.channelName}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-violet-100 text-violet-700">{device.platform}</span>
                          <span className={cn('text-xs px-3 py-1 rounded-full font-semibold', cfg.bg, cfg.color)}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">{device.channelId}</code>
                          <CopyBtn text={device.channelId} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Added {new Date(device.addedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      {/* Admin status controls */}
                      <div className="flex gap-2 flex-wrap">
                        <p className="text-xs text-gray-500 w-full font-medium">Admin Controls:</p>
                        {(['Active', 'Pending', 'Inactive'] as DistributionChannel['status'][]).map(status => (
                          <button
                            key={status}
                            onClick={() => onUpdateRokuStatus(client.id, device.id, status)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                              device.status === status
                                ? status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                  : status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-red-100 text-red-700 border-red-300'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                            )}
                          >
                            {status === 'Active' && <CheckCircle size={10} className="inline mr-1" />}
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
              <Tv2 size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No Distribution Channels Registered</p>
              <p className="text-gray-400 text-sm mt-1">The client hasn't registered any distribution channels yet.</p>
              <p className="text-gray-400 text-sm">Once they add channel IDs from their portal (Apple TV, Roku, Fire TV, etc.), they will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Notifications Sent to Client</h2>
            <button onClick={() => setShowNotifModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-sm font-medium shadow-md hover:from-pink-600 hover:to-rose-700 transition-all">
              <Send size={16} /> Send New
            </button>
          </div>
          {client.notifications.length > 0 ? (
            <div className="space-y-3">
              {client.notifications.map(n => (
                <div key={n.id} className={cn('bg-white rounded-2xl p-5 border flex items-start gap-4', typeColors[n.type])}>
                  <Bell size={18} className={n.type === 'success' ? 'text-emerald-600' : n.type === 'info' ? 'text-blue-600' : n.type === 'warning' ? 'text-amber-600' : 'text-red-600'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-gray-900">{n.title}</p>{!n.read && <span className="w-2 h-2 bg-pink-500 rounded-full" />}</div>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${n.read ? 'bg-gray-100 text-gray-400' : 'bg-pink-100 text-pink-700'}`}>{n.read ? 'Read' : 'Unread'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100"><Bell size={40} className="text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No notifications sent yet</p></div>
          )}
        </div>
      )}

      {/* ── ACTIONS TAB ── */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Activity size={20} className="text-violet-500" /> Admin Actions</h2>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => openStatusModal('ban')}
              disabled={client.status === 'Banned'}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-red-100 hover:border-red-300 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-2xl flex items-center justify-center transition-all">
                <ShieldOff size={22} className="text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Ban User</p>
                <p className="text-xs text-gray-500 mt-1">Permanently block access</p>
              </div>
            </button>

            <button
              onClick={() => openStatusModal('suspend')}
              disabled={client.status === 'Suspended' || client.status === 'Banned'}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-amber-100 hover:border-amber-300 hover:bg-amber-50 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-2xl flex items-center justify-center transition-all">
                <UserX size={22} className="text-amber-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Suspend</p>
                <p className="text-xs text-gray-500 mt-1">Temporarily block access</p>
              </div>
            </button>

            <button
              onClick={() => openStatusModal('activate')}
              disabled={client.status === 'Active'}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-2xl flex items-center justify-center transition-all">
                <UserCheck size={22} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Activate</p>
                <p className="text-xs text-gray-500 mt-1">Restore full access</p>
              </div>
            </button>

            <button
              onClick={() => openStatusModal('warning')}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-orange-100 hover:border-orange-300 hover:bg-orange-50 rounded-2xl transition-all group"
            >
              <div className="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-2xl flex items-center justify-center transition-all">
                <AlertTriangle size={22} className="text-orange-600" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Send Warning</p>
                <p className="text-xs text-gray-500 mt-1">Alert client via notification</p>
              </div>
            </button>
          </div>

          {/* Password Change Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Change Client Password</h3>
              </div>
              <button
                onClick={() => { setShowPasswordChange(!showPasswordChange); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setPasswordSuccess(''); }}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {showPasswordChange ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            <div className="p-6">
              {!showPasswordChange ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={18} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Client Login Password</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Current password is set. Click "Change Password" to set a new one for this client.
                      The client will be notified automatically.
                    </p>
                    {/* Show if client has a password reset notification pending */}
                    {client.notifications.some(n => n.title.includes('Password Reset Requested') && !n.read) && (
                      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">⚠️ This client has a pending password reset request!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                      <input
                        type="text"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); setPasswordSuccess(''); }}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                      <AlertTriangle size={14} className="text-red-500 shrink-0" />
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <p className="text-sm text-emerald-600">{passwordSuccess}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowPasswordChange(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); setPasswordSuccess(''); }}
                      className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newPassword.trim()) { setPasswordError('Password cannot be empty.'); return; }
                        if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
                        if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
                        onChangePassword(client.id, newPassword);
                        setPasswordSuccess(`Password updated successfully! Client has been notified.`);
                        setNewPassword('');
                        setConfirmPassword('');
                        setTimeout(() => { setShowPasswordChange(false); setPasswordSuccess(''); }, 2500);
                      }}
                      className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Shield size={15} />
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Share Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-500" />
                <h3 className="text-lg font-semibold text-gray-900">Revenue Share & Billing</h3>
              </div>
              <button
                onClick={() => { setShowRevenueEdit(!showRevenueEdit); setEditRevenueShare(client.revenueShare); setEditMonthlyFee(client.monthlyFee); setRevenueSuccess(''); }}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
              >
                {showRevenueEdit ? 'Cancel' : 'Edit Billing'}
              </button>
            </div>
            <div className="p-6">
              {!showRevenueEdit ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <p className="text-3xl font-black text-emerald-600">{client.revenueShare}%</p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">Revenue Share</p>
                    <p className="text-xs text-gray-500 mt-1">Client receives this % of earnings</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <p className="text-3xl font-black text-blue-600">${client.monthlyFee.toLocaleString()}</p>
                    <p className="text-xs text-blue-700 mt-1 font-medium">Monthly Fee</p>
                    <p className="text-xs text-gray-500 mt-1">Base subscription fee</p>
                  </div>
                  <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl text-center">
                    <p className="text-3xl font-black text-violet-600">{client.plan}</p>
                    <p className="text-xs text-violet-700 mt-1 font-medium">Plan</p>
                    <p className="text-xs text-gray-500 mt-1">Current subscription tier</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Share (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={editRevenueShare}
                          onChange={(e) => setEditRevenueShare(Math.min(100, Math.max(0, Number(e.target.value))))}
                          min={0}
                          max={100}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Percentage of content revenue paid to client</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                        <input
                          type="number"
                          value={editMonthlyFee}
                          onChange={(e) => setEditMonthlyFee(Math.max(0, Number(e.target.value)))}
                          min={0}
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Fixed monthly subscription charge</p>
                    </div>
                  </div>

                  {/* Preview changes */}
                  {(editRevenueShare !== client.revenueShare || editMonthlyFee !== client.monthlyFee) && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        <p className="font-semibold mb-1">Changes Preview:</p>
                        <ul className="space-y-0.5">
                          {editRevenueShare !== client.revenueShare && (
                            <li>Revenue Share: {client.revenueShare}% → <span className="font-bold">{editRevenueShare}%</span></li>
                          )}
                          {editMonthlyFee !== client.monthlyFee && (
                            <li>Monthly Fee: ${client.monthlyFee} → <span className="font-bold">${editMonthlyFee}</span></li>
                          )}
                        </ul>
                        <p className="mt-1">Client will be notified of these changes.</p>
                      </div>
                    </div>
                  )}

                  {revenueSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <p className="text-sm text-emerald-600">{revenueSuccess}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowRevenueEdit(false); setEditRevenueShare(client.revenueShare); setEditMonthlyFee(client.monthlyFee); setRevenueSuccess(''); }}
                      className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onUpdateRevenueShare(client.id, editRevenueShare, editMonthlyFee);
                        setRevenueSuccess('Billing updated successfully! Client has been notified.');
                        setTimeout(() => { setShowRevenueEdit(false); setRevenueSuccess(''); }, 2500);
                      }}
                      disabled={editRevenueShare === client.revenueShare && editMonthlyFee === client.monthlyFee}
                      className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Users size={15} />
                      Update Billing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device Distribution Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-cyan-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-cyan-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv2 size={18} className="text-cyan-500" />
                <h3 className="text-lg font-semibold text-gray-900">Device Distribution (Analytics)</h3>
              </div>
              <button
                onClick={() => { setShowDeviceEdit(!showDeviceEdit); setEditDD(client.deviceDistribution || { mobile: 0, desktop: 0, smartTV: 0, tablet: 0 }); setDdSuccess(''); }}
                className="text-xs text-cyan-600 hover:text-cyan-800 font-medium transition-colors"
              >
                {showDeviceEdit ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {!showDeviceEdit ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Mobile', value: client.deviceDistribution?.mobile || 0, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'Desktop', value: client.deviceDistribution?.desktop || 0, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { label: 'Smart TV', value: client.deviceDistribution?.smartTV || 0, color: 'bg-violet-50 text-violet-600 border-violet-100' },
                    { label: 'Tablet', value: client.deviceDistribution?.tablet || 0, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  ].map(d => (
                    <div key={d.label} className={`p-4 rounded-xl border text-center ${d.color}`}>
                      <p className="text-2xl font-black">{d.value}%</p>
                      <p className="text-xs font-medium mt-1">{d.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">Set the device usage percentage for this client's analytics dashboard. Values should roughly sum to 100.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'mobile' as const, label: 'Mobile' },
                      { key: 'desktop' as const, label: 'Desktop' },
                      { key: 'smartTV' as const, label: 'Smart TV' },
                      { key: 'tablet' as const, label: 'Tablet' },
                    ].map(d => (
                      <div key={d.key}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{d.label} %</label>
                        <input
                          type="number"
                          value={editDD[d.key]}
                          onChange={(e) => setEditDD({ ...editDD, [d.key]: Math.max(0, Number(e.target.value)) })}
                          min={0} max={100}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Total: {editDD.mobile + editDD.desktop + editDD.smartTV + editDD.tablet}%</p>
                  {ddSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                      <p className="text-sm text-emerald-600">{ddSuccess}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeviceEdit(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                    <button
                      onClick={() => {
                        onUpdateDeviceDistribution(client.id, editDD);
                        setDdSuccess('Device distribution updated! Client analytics will reflect this.');
                        setTimeout(() => { setShowDeviceEdit(false); setDdSuccess(''); }, 2500);
                      }}
                      className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 rounded-xl shadow-md transition-all"
                    >
                      Save Distribution
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Shield size={18} className="text-violet-500" /><h3 className="text-lg font-semibold text-gray-900">Action History</h3></div>
              <span className="text-xs text-gray-400">{adminActions.length} actions</span>
            </div>
            {adminActions.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {adminActions.map(action => (
                  <div key={action.id} className="flex items-start gap-4 px-6 py-4">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      action.type === 'ban' ? 'bg-red-100' :
                      action.type === 'suspend' ? 'bg-amber-100' :
                      action.type === 'activate' ? 'bg-emerald-100' : 'bg-orange-100'
                    )}>
                      {action.type === 'ban' ? <ShieldOff size={16} className="text-red-600" /> :
                       action.type === 'suspend' ? <UserX size={16} className="text-amber-600" /> :
                       action.type === 'activate' ? <UserCheck size={16} className="text-emerald-600" /> :
                       <AlertTriangle size={16} className="text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 capitalize">{action.type} action</p>
                      <p className="text-sm text-gray-600">{action.reason}</p>
                      {action.adminNote && <p className="text-xs text-gray-400 mt-0.5">Note: {action.adminNote}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(action.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center">
                <Activity size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No admin actions yet</p>
                <p className="text-xs text-gray-300 mt-1">Actions taken on this client will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ASSIGN CHANNEL MODAL ── */}
      {showAddChannel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Assign Channel to {client.name}</h3>
              <button onClick={() => setShowAddChannel(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="px-6 py-3 border-b border-gray-100">
              <input type="text" placeholder="Search unassigned channels..." value={searchChannels} onChange={(e) => setSearchChannels(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredUnassigned.length > 0 ? filteredUnassigned.map(ch => (
                <button key={ch.id} onClick={() => { onAssignChannel(ch.id, client.id); setShowAddChannel(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all text-left group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center text-lg`}>{ch.logo}</div>
                  <div className="flex-1"><p className="font-medium text-gray-900 group-hover:text-violet-700">{ch.name}</p><p className="text-xs text-gray-400">{ch.category} · {(ch.subscribers / 1000000).toFixed(0)}M subs</p></div>
                  <Plus size={16} className="text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )) : <div className="text-center py-8"><p className="text-gray-400">No unassigned channels available</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* ── SEND NOTIFICATION MODAL ── */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Send Notification to {client.name}</h3>
              <button onClick={() => setShowNotifModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="flex gap-2">
                  {(['info', 'success', 'warning', 'alert'] as const).map(t => (
                    <button key={t} onClick={() => setNotifType(t)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all', notifType === t ? typeColors[t] : 'bg-gray-50 text-gray-500 hover:bg-gray-100')}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="Notification title" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="Write your message..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowNotifModal(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button onClick={handleSendNotif} className="flex-1 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"><Send size={16} /> Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS ACTION MODAL ── */}
      {showStatusModal && statusAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={cn(
              'px-6 py-5 flex items-center gap-3',
              statusAction === 'ban' ? 'bg-red-50 border-b border-red-100' :
              statusAction === 'suspend' ? 'bg-amber-50 border-b border-amber-100' :
              statusAction === 'activate' ? 'bg-emerald-50 border-b border-emerald-100' :
              'bg-orange-50 border-b border-orange-100'
            )}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                statusAction === 'ban' ? 'bg-red-100' :
                statusAction === 'suspend' ? 'bg-amber-100' :
                statusAction === 'activate' ? 'bg-emerald-100' : 'bg-orange-100'
              )}>
                {statusAction === 'ban' ? <ShieldOff size={20} className="text-red-600" /> :
                 statusAction === 'suspend' ? <UserX size={20} className="text-amber-600" /> :
                 statusAction === 'activate' ? <UserCheck size={20} className="text-emerald-600" /> :
                 <AlertTriangle size={20} className="text-orange-600" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {statusAction === 'activate' ? 'Activate Account' :
                   statusAction === 'warning' ? 'Send Warning' :
                   `${statusAction.charAt(0).toUpperCase() + statusAction.slice(1)} User`}
                </h3>
                <p className="text-sm text-gray-500">{client.name}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {statusAction === 'activate' ? (
                <p className="text-sm text-gray-600">
                  This will restore full access for <strong>{client.name}</strong>. They will be able to log in and access all their channels and content.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    {statusAction === 'ban'
                      ? `Banning ${client.name} will permanently block their access. They will not be able to log in.`
                      : statusAction === 'suspend'
                      ? `Suspending ${client.name} will temporarily block their access until you reactivate.`
                      : `Send an official warning notification to ${client.name}.`}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {statusAction === 'warning' ? 'Warning Message *' : 'Reason *'}
                    </label>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder={
                        statusAction === 'ban' ? 'Reason for banning this user...' :
                        statusAction === 'suspend' ? 'Reason for suspension...' :
                        'Write your warning message...'
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                      required
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowStatusModal(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">Cancel</button>
                <button
                  onClick={handleStatusAction}
                  disabled={statusAction !== 'activate' && !statusReason.trim()}
                  className={cn(
                    'flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    statusAction === 'ban' ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/25' :
                    statusAction === 'suspend' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25' :
                    statusAction === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25' :
                    'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/25'
                  )}
                >
                  {statusAction === 'ban' && <><ShieldOff size={16} /> Confirm Ban</>}
                  {statusAction === 'suspend' && <><UserX size={16} /> Confirm Suspend</>}
                  {statusAction === 'activate' && <><UserCheck size={16} /> Activate Account</>}
                  {statusAction === 'warning' && <><AlertTriangle size={16} /> Send Warning</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
