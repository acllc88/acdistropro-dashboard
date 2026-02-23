import {
  LayoutDashboard, Tv, Film, Users, Clapperboard, Plus,
  ChevronLeft, ChevronRight, LogOut, Menu, X,
  Bell, Check, Trash2, Eye, LogIn, Key, Tv2, AlertCircle,
  MessageSquare, DollarSign
} from 'lucide-react';
import { ViewMode, AdminNotification } from '../types';
import { cn } from '../utils/cn';
import { useState } from 'react';

interface SidebarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onAddClient: () => void;
  onAddChannel: () => void;
  onAddMovie: () => void;
  onAddSeries: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  adminNotifications: AdminNotification[];
  onMarkAdminNotifRead: (id: string) => void;
  onMarkAllAdminNotifsRead: () => void;
  onClearAdminNotifs: () => void;
  onViewClient: (clientId: string) => void;
}

export function Sidebar({
  activeView, onViewChange, onAddClient, onAddChannel, onAddMovie, onAddSeries,
  collapsed, onToggleCollapse, onLogout,
  adminNotifications, onMarkAdminNotifRead, onMarkAllAdminNotifsRead, onClearAdminNotifs, onViewClient
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const unreadAdminCount = adminNotifications.filter(n => !n.read).length;

  const getNotifIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'client_login': return <LogIn size={14} className="text-blue-400" />;
      case 'distribution_add': return <Tv2 size={14} className="text-cyan-400" />;
      case 'distribution_remove': return <Trash2 size={14} className="text-red-400" />;
      case 'password_reset': return <Key size={14} className="text-amber-400" />;
      case 'client_action': return <AlertCircle size={14} className="text-violet-400" />;
      default: return <Bell size={14} className="text-gray-400" />;
    }
  };

  const getNotifColor = (type: AdminNotification['type']) => {
    switch (type) {
      case 'client_login': return 'border-blue-500/20 bg-blue-500/5';
      case 'distribution_add': return 'border-cyan-500/20 bg-cyan-500/5';
      case 'distribution_remove': return 'border-red-500/20 bg-red-500/5';
      case 'password_reset': return 'border-amber-500/20 bg-amber-500/5';
      default: return 'border-violet-500/20 bg-violet-500/5';
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as ViewMode, label: 'Clients', icon: Users },
    { id: 'channels' as ViewMode, label: 'Channels', icon: Tv },
    { id: 'movies' as ViewMode, label: 'Movies', icon: Film },
    { id: 'series' as ViewMode, label: 'Series', icon: Clapperboard },
    { id: 'tickets' as ViewMode, label: 'Tickets', icon: MessageSquare },
    { id: 'revenue' as ViewMode, label: 'Revenue', icon: DollarSign },
  ];

  const quickActions = [
    { label: 'Add Client', onClick: onAddClient, color: 'text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10' },
    { label: 'Add Channel', onClick: onAddChannel, color: 'text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/10' },
    { label: 'Add Movie', onClick: onAddMovie, color: 'text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10' },
    { label: 'Add Series', onClick: onAddSeries, color: 'text-pink-400 border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/10' },
  ];

  const isActive = (id: ViewMode) =>
    activeView === id ||
    (id === 'clients' && activeView === 'client-detail') ||
    (id === 'channels' && activeView === 'channel-detail');

  const handleNavClick = (view: ViewMode) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  // ── Notification Panel ──
  const NotificationPanel = () => {
    if (!showNotifPanel) return null;
    return (
      <div className="fixed inset-0 z-[100]">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotifPanel(false)} />
        <div className={cn(
          "absolute top-0 bottom-0 w-full sm:w-[400px] bg-gray-900 border-gray-700/50 shadow-2xl flex flex-col overflow-hidden",
          "sm:border sm:rounded-2xl sm:top-4 sm:bottom-4 sm:right-4"
        )}>
          <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between shrink-0 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center">
                <Bell size={18} className="text-pink-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Notifications</h3>
                <p className="text-xs text-gray-500">{adminNotifications.length} total · {unreadAdminCount} unread</p>
              </div>
            </div>
            <button onClick={() => setShowNotifPanel(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          {adminNotifications.length > 0 && (
            <div className="px-4 py-2.5 border-b border-gray-700/30 flex items-center gap-2 bg-gray-900/80 shrink-0">
              {unreadAdminCount > 0 && (
                <button onClick={onMarkAllAdminNotifsRead} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-all">
                  <Check size={12} /> Mark all read
                </button>
              )}
              <button onClick={() => { onClearAdminNotifs(); setShowNotifPanel(false); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all ml-auto">
                <Trash2 size={12} /> Clear all
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {adminNotifications.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {adminNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={cn("px-4 py-4 hover:bg-white/[0.03] transition-all cursor-pointer", !notif.read && "bg-white/[0.02]")}
                    onClick={() => onMarkAdminNotifRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", getNotifColor(notif.type))}>
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg shrink-0">{notif.clientLogo}</span>
                          <p className="text-xs font-semibold text-gray-300 truncate">{notif.clientName}</p>
                          {!notif.read && <span className="w-2 h-2 bg-pink-500 rounded-full shrink-0 animate-pulse" />}
                        </div>
                        <p className="text-sm font-semibold text-white mb-0.5">{notif.title}</p>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-600">{getRelativeTime(notif.date)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewClient(notif.clientId); setShowNotifPanel(false); setMobileOpen(false); }}
                            className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-medium transition-colors"
                          >
                            <Eye size={10} /> View Client
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Bell size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-semibold text-base">No notifications yet</p>
                <p className="text-gray-600 text-sm mt-1 text-center">Client activity will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Sidebar inner content (shared between mobile drawer and desktop) ──
  const SidebarInner = ({ isMobile }: { isMobile: boolean }) => (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white overflow-hidden">
      {/* Logo + close (mobile) */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-700/50 shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0 text-sm font-black text-white">
          AC
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent truncate">ACDistro Pro</h1>
            <p className="text-[10px] text-gray-500">Admin Panel</p>
          </div>
        )}
        {isMobile ? (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="px-3 pt-3 shrink-0">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl",
          collapsed && !isMobile ? "justify-center px-2" : ""
        )}>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
          {(!collapsed || isMobile) && <span className="text-xs text-red-400 font-semibold">Admin Mode</span>}
        </div>
      </div>

      {/* Notification Bell */}
      <div className="px-3 pt-2 shrink-0">
        <button
          onClick={() => setShowNotifPanel(!showNotifPanel)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
            collapsed && !isMobile ? "justify-center px-2" : "",
            showNotifPanel
              ? "bg-pink-600/20 text-white border border-pink-500/30"
              : unreadAdminCount > 0
                ? "bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 border border-pink-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
          )}
        >
          <div className="relative shrink-0">
            <Bell size={18} />
            {unreadAdminCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadAdminCount > 9 ? '9+' : unreadAdminCount}
              </span>
            )}
          </div>
          {(!collapsed || isMobile) && (
            <span className="text-sm font-medium flex-1 text-left">
              Notifications
              {unreadAdminCount > 0 && <span className="ml-1 text-pink-400 font-bold">({unreadAdminCount})</span>}
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-2 font-semibold">Navigation</p>
        )}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            title={collapsed && !isMobile ? item.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              collapsed && !isMobile ? "justify-center px-2" : "",
              isActive(item.id)
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                : "text-gray-400 hover:text-white hover:bg-gray-800/60"
            )}
          >
            <item.icon size={19} className={cn("shrink-0", !isActive(item.id) && "group-hover:text-violet-400")} />
            {(!collapsed || isMobile) && <span className="text-sm font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 pb-2 space-y-1 shrink-0">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] text-gray-500 uppercase tracking-wider px-3 mb-2 font-semibold">Quick Add</p>
        )}
        {quickActions.map(action => (
          <button
            key={action.label}
            onClick={() => { action.onClick(); setMobileOpen(false); }}
            title={collapsed && !isMobile ? action.label : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all border",
              collapsed && !isMobile ? "justify-center px-2" : "",
              action.color
            )}
          >
            <Plus size={15} className="shrink-0" />
            {(!collapsed || isMobile) && <span>{action.label}</span>}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-gray-700/40 shrink-0">
        <button
          onClick={onLogout}
          title={collapsed && !isMobile ? 'Logout' : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            collapsed && !isMobile ? "justify-center px-2" : "",
            "text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Notification Panel (portal-style overlay) */}
      <NotificationPanel />

      {/* ── MOBILE TOP NAVBAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 border-b border-gray-700/60 flex items-center px-4 gap-3 shadow-lg">
        {/* Hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">
            AC
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            ACDistro Pro
          </span>
        </div>

        {/* Bell on mobile top bar */}
        <button
          onClick={() => setShowNotifPanel(true)}
          className="relative w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadAdminCount > 0 && (
            <span className="absolute top-1 right-1 bg-pink-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {unreadAdminCount > 9 ? '9+' : unreadAdminCount}
            </span>
          )}
        </button>

        {/* Logout on mobile top bar */}
        <button
          onClick={onLogout}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div className={cn(
        "lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[95] shadow-2xl transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarInner isMobile={true} />
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-2xl transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <SidebarInner isMobile={false} />
      </aside>
    </>
  );
}
