import { useState } from 'react';
import { Client, Channel, Movie, Series, ClientFinancials, DistributionPlatform, SupportTicket } from '../../types';
import { ClientPortalOverview } from './ClientPortalOverview';
import { ClientPortalAnalytics } from './ClientPortalAnalytics';
import { ClientPortalEarnings } from './ClientPortalEarnings';
import { ClientPortalContent } from './ClientPortalContent';
import { ClientPortalNotifications } from './ClientPortalNotifications';
import { ClientPortalRoku } from './ClientPortalRoku';
import { ClientSupportTickets } from './ClientSupportTickets';
import { ClientPayPalSettings } from './ClientPayPalSettings';
import { ClientChatbot } from './ClientChatbot';
import {
  LayoutDashboard, BarChart2, DollarSign, PlaySquare,
  Bell, LogOut, ChevronLeft, ChevronRight, Menu, X, Tv2,
  MessageSquare, CreditCard
} from 'lucide-react';
import { cn } from '../../utils/cn';

type PortalTab = 'overview' | 'analytics' | 'earnings' | 'content' | 'notifications' | 'roku' | 'support' | 'paypal';

interface ClientPortalDashboardProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials;
  tickets: SupportTicket[];
  onExitPortal: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
  onAddRokuChannel: (channelId: string, channelName: string, platform: DistributionPlatform) => void;
  onRemoveRokuChannel: (rokuChannelId: string) => void;
  onCreateTicket: (subject: string, category: SupportTicket['category'], priority: SupportTicket['priority'], message: string) => void;
  onReplyTicket: (ticketId: string, message: string) => void;
  onSavePayPal: (email: string) => void;
}

export function ClientPortalDashboard({
  client, channels, movies, series, financials, tickets,
  onExitPortal, onMarkNotificationRead, onMarkAllRead,
  onAddRokuChannel, onRemoveRokuChannel,
  onCreateTicket, onReplyTicket, onSavePayPal
}: ClientPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const unreadCount = client.notifications.filter(n => !n.read).length;
  const rokuCount = client.rokuChannels.length;

  const tabs = [
    { id: 'overview' as PortalTab, label: 'Overview', icon: LayoutDashboard, color: 'text-violet-400' },
    { id: 'analytics' as PortalTab, label: 'Analytics', icon: BarChart2, color: 'text-blue-400' },
    { id: 'earnings' as PortalTab, label: 'Earnings', icon: DollarSign, color: 'text-emerald-400' },
    { id: 'content' as PortalTab, label: 'My Content', icon: PlaySquare, color: 'text-amber-400' },
    { id: 'roku' as PortalTab, label: 'Distribution', icon: Tv2, color: 'text-cyan-400', badge: rokuCount },
    { id: 'support' as PortalTab, label: 'Support', icon: MessageSquare, color: 'text-orange-400', badge: tickets.filter(t => t.clientId === client.id && t.status !== 'Closed').length },
    { id: 'paypal' as PortalTab, label: 'PayPal', icon: CreditCard, color: 'text-blue-400' },
    { id: 'notifications' as PortalTab, label: 'Notifications', icon: Bell, color: 'text-pink-400', badge: unreadCount },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ClientPortalOverview client={client} channels={channels} movies={movies} series={series} financials={financials} onTabChange={setActiveTab} />;
      case 'analytics':
        return <ClientPortalAnalytics client={client} channels={channels} movies={movies} series={series} financials={financials} />;
      case 'earnings':
        return <ClientPortalEarnings client={client} channels={channels} movies={movies} series={series} financials={financials} />;
      case 'content':
        return <ClientPortalContent channels={channels} movies={movies} series={series} />;
      case 'roku':
        return <ClientPortalRoku client={client} onAddChannel={onAddRokuChannel} onRemoveChannel={onRemoveRokuChannel} />;
      case 'support':
        return <ClientSupportTickets tickets={tickets} clientId={client.id} clientName={client.name} onCreateTicket={onCreateTicket} onReplyTicket={onReplyTicket} />;
      case 'paypal':
        return <ClientPayPalSettings client={client} onSavePayPal={onSavePayPal} />;
      case 'notifications':
        return <ClientPortalNotifications notifications={client.notifications} onMarkRead={onMarkNotificationRead} onMarkAllRead={onMarkAllRead} />;
      default:
        return null;
    }
  };

  const handleTabClick = (tabId: PortalTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // ── Shared sidebar nav content ──
  const SidebarNav = ({ isMobile }: { isMobile: boolean }) => (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 shrink-0">
        <div className={cn(
          `bg-gradient-to-br ${client.color} rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0`,
          desktopCollapsed && !isMobile ? 'w-9 h-9 text-base' : 'w-10 h-10'
        )}>
          {client.logo}
        </div>
        {(!desktopCollapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{client.name}</p>
            <p className="text-xs text-purple-400 truncate">{client.company}</p>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0"
            title={desktopCollapsed ? 'Expand' : 'Collapse'}
          >
            {desktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto pt-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            title={desktopCollapsed && !isMobile ? tab.label : undefined}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative',
              desktopCollapsed && !isMobile ? 'justify-center px-2' : '',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <tab.icon
              size={19}
              className={cn('shrink-0', activeTab === tab.id ? 'text-white' : tab.color)}
            />
            {(!desktopCollapsed || isMobile) && (
              <>
                <span className="text-sm font-medium flex-1 text-left">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {tab.badge}
                  </span>
                )}
              </>
            )}
            {/* Badge when collapsed */}
            {desktopCollapsed && !isMobile && tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-1 right-1 bg-pink-500 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-2 shrink-0">
        {(!desktopCollapsed || isMobile) && (
          <div className="px-3 py-2.5 bg-white/5 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Account</p>
            <p className="text-sm font-bold text-white">{client.plan}</p>
            <p className="text-xs text-slate-400">{client.revenueShare}% revenue share</p>
          </div>
        )}
        <button
          onClick={onExitPortal}
          title={desktopCollapsed && !isMobile ? 'Logout' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all',
            desktopCollapsed && !isMobile ? 'justify-center px-2' : ''
          )}
        >
          <LogOut size={18} className="shrink-0" />
          {(!desktopCollapsed || isMobile) && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── MOBILE MENU OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <div className={cn(
        'lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[90] shadow-2xl transition-transform duration-300 ease-in-out',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarNav isMobile={true} />
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-2xl transition-all duration-300 ease-in-out',
        desktopCollapsed ? 'w-[72px]' : 'w-64'
      )}>
        <SidebarNav isMobile={false} />
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen transition-all duration-300',
        desktopCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
      )}>

        {/* ── MOBILE TOP NAVBAR ── */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-3 shadow-lg">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(`bg-gradient-to-br ${client.color} w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0`)}>
              {client.logo}
            </div>
            <span className="text-sm font-bold text-white truncate">{client.name}</span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => handleTabClick('notifications')}
              className="relative w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 bg-pink-500 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            </button>
          )}

          <button
            onClick={onExitPortal}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* ── DESKTOP TOP BAR ── */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 px-6 xl:px-8 py-3 items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-violet-400 font-semibold">ACDistro Pro</span>
            <ChevronRight size={14} />
            <span className="text-white font-semibold">{currentTab?.label}</span>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                <Bell size={18} className="text-slate-300" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              </button>
            )}
            <div className={cn(`bg-gradient-to-br ${client.color} w-8 h-8 rounded-lg flex items-center justify-center text-base shadow`)}>
              {client.logo}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        {/* pt-14 on mobile to clear the fixed top navbar */}
        <main className="flex-1 pt-14 lg:pt-0 p-4 lg:p-6 xl:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* ── AI CHATBOT ── */}
      <ClientChatbot
        client={client}
        channels={channels}
        movies={movies}
        series={series}
      />
    </div>
  );
}
