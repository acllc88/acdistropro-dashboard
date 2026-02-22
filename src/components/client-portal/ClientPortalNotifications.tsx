import { ClientNotification } from '../../types';
import { Bell, CheckCircle, Info, AlertTriangle, AlertOctagon, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ClientPortalNotificationsProps {
  notifications: ClientNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
  },
  alert: {
    icon: AlertOctagon,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-400',
  },
};

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ClientPortalNotifications({ notifications, onMarkRead, onMarkAllRead }: ClientPortalNotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-lg font-bold bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">Updates and alerts from your admin</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all border border-white/5"
          >
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Unread Notifications */}
      {unread.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New ({unread.length})</h2>
          <div className="space-y-3">
            {unread.map(notification => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'bg-slate-900 border rounded-2xl p-5 transition-all hover:border-white/15',
                    config.border
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.bg)}>
                      <Icon size={20} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white">{notification.title}</h3>
                        <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />
                      </div>
                      <p className="text-sm text-slate-300">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{getRelativeTime(notification.date)}</p>
                    </div>
                    <button
                      onClick={() => onMarkRead(notification.id)}
                      className="shrink-0 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
                      title="Mark as read"
                    >
                      <Check size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {read.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Earlier ({read.length})</h2>
          <div className="space-y-3">
            {read.map(notification => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;
              return (
                <div
                  key={notification.id}
                  className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 opacity-60 hover:opacity-80 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-300">{notification.title}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-slate-600 mt-2">{getRelativeTime(notification.date)}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-600 bg-white/5 px-2 py-1 rounded-lg">Read</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="text-center py-24 bg-slate-900 rounded-2xl border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-slate-500" />
          </div>
          <p className="text-slate-400 text-lg font-semibold">All caught up!</p>
          <p className="text-slate-500 text-sm mt-1">No notifications at the moment</p>
        </div>
      )}

      {/* Summary Stats */}
      {notifications.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {(['success', 'info', 'warning', 'alert'] as const).map(type => {
            const count = notifications.filter(n => n.type === type).length;
            const config = typeConfig[type];
            const Icon = config.icon;
            const labels = { success: 'Success', info: 'Info', warning: 'Warning', alert: 'Alert' };
            return (
              <div key={type} className={cn('rounded-2xl p-4 border text-center', config.bg, config.border)}>
                <Icon size={20} className={cn('mx-auto mb-2', config.color)} />
                <p className="text-xl font-black text-white">{count}</p>
                <p className="text-xs text-slate-400">{labels[type]}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
