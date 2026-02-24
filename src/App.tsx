import { useState, useCallback, useEffect } from 'react';
import {
  Client, Channel, Movie, Series, ViewMode, AppMode,
  ClientFinancials, ClientNotification, AdminNotification,
  DistributionPlatform, DistributionChannel, AdminAction,
  SupportTicket, MonthlyRevenue, PaymentRecord
} from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ClientsView } from './components/ClientsView';
import { ClientDetailView } from './components/ClientDetailView';
import { ChannelsView } from './components/ChannelsView';
import { ChannelDetailView } from './components/ChannelDetailView';
import { MoviesView } from './components/MoviesView';
import { SeriesView } from './components/SeriesView';
import { AdminTicketsView } from './components/AdminTicketsView';
import { AdminRevenueManager } from './components/AdminRevenueManager';
import { AddClientModal } from './components/AddClientModal';
import { AddChannelModal } from './components/AddChannelModal';
import { AddMovieModal } from './components/AddMovieModal';
import { AddSeriesModal } from './components/AddSeriesModal';
import { ClientLoginPage } from './components/auth/ClientLoginPage';
import { AdminLoginPage } from './components/auth/AdminLoginPage';
import { ClientPortal } from './components/client-portal/ClientPortal';
import { LoadingScreen } from './components/LoadingScreen';
import { cn } from './utils/cn';
import { initialFinancials } from './data/initialData';

// Firebase services
import {
  seedIfEmpty,
  subscribeToClients,
  subscribeToChannels,
  subscribeToMovies,
  subscribeToSeries,
  subscribeToFinancials,
  subscribeToAdminNotifications,
  saveClient,
  updateClient,
  deleteClient as fbDeleteClient,
  saveChannel,
  updateChannel,
  deleteChannel as fbDeleteChannel,
  saveMovie,
  updateMovie,
  deleteMovie as fbDeleteMovie,
  saveSeries,
  updateSeries,
  deleteSeries as fbDeleteSeries,
  saveFinancials,
  updateDeviceDistribution,
  addAdminNotification,
  markAdminNotifRead,
  markAllAdminNotifsRead,
  clearAllAdminNotifs,
  updateClientNotifications,
  subscribeToTickets,
  saveTicket as fbSaveTicket,
  updateTicket as fbUpdateTicket,
} from './firebase/firebaseService';

const colorOptions = [
  'from-red-600 to-red-800',
  'from-blue-600 to-indigo-800',
  'from-purple-600 to-purple-900',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-orange-700',
  'from-pink-500 to-rose-700',
  'from-teal-500 to-cyan-700',
];

export function App() {
  // ── Loading ──────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Auth ─────────────────────────────────────────────────────────────
  const [appMode, setAppMode] = useState<AppMode>('login');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loggedInClientId, setLoggedInClientId] = useState<string | null>(null);

  // ── Real-time Firestore State ─────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [financials, setFinancials] = useState<Record<string, ClientFinancials>>(initialFinancials);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // ── Admin UI State ────────────────────────────────────────────────────
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddSeries, setShowAddSeries] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Firebase Init + Real-time Subscriptions ───────────────────────────
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    async function init() {
      try {
        await seedIfEmpty();
      } catch (e) {
        console.error('[App] Seed error:', e);
      }

      unsubs.push(subscribeToClients(setClients));
      unsubs.push(subscribeToChannels(setChannels));
      unsubs.push(subscribeToMovies(setMovies));
      unsubs.push(subscribeToSeries(setSeries));
      unsubs.push(subscribeToFinancials(setFinancials));
      unsubs.push(subscribeToAdminNotifications(setAdminNotifications));
      unsubs.push(subscribeToTickets(setTickets));

      setTimeout(() => setIsLoading(false), 1200);
    }

    init();
    return () => { unsubs.forEach(fn => fn()); };
  }, []);

  // ── Admin Notification Helpers ────────────────────────────────────────
  const pushAdminNotification = useCallback(async (
    notif: Omit<AdminNotification, 'id' | 'date' | 'read'>
  ) => {
    const newNotif: AdminNotification = {
      ...notif,
      id: `admin-n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      read: false,
    };
    try { await addAdminNotification(newNotif); } catch (e) { console.error(e); }
  }, []);

  const handleMarkAdminNotifRead = useCallback(async (notifId: string) => {
    try { await markAdminNotifRead(notifId); } catch (e) { console.error(e); }
  }, []);

  const handleMarkAllAdminNotifsRead = useCallback(async () => {
    try { await markAllAdminNotifsRead(adminNotifications); } catch (e) { console.error(e); }
  }, [adminNotifications]);

  const handleClearAdminNotifs = useCallback(async () => {
    try { await clearAllAdminNotifs(adminNotifications); } catch (e) { console.error(e); }
  }, [adminNotifications]);

  // ── Client Notification Helper ────────────────────────────────────────
  const pushNotification = useCallback(async (
    clientId: string,
    notif: Omit<ClientNotification, 'id' | 'date' | 'read'>
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const newNotif: ClientNotification = {
      ...notif,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      read: false,
    };
    const updatedNotifs = [newNotif, ...(client.notifications || [])];
    try { await updateClientNotifications(clientId, updatedNotifs); } catch (e) { console.error(e); }
  }, [clients]);

  // ── Forgot Password ───────────────────────────────────────────────────
  const handleForgotPassword = useCallback(async (clientEmail: string) => {
    const client = clients.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());
    if (!client) return;

    await pushNotification(client.id, {
      title: '🔑 Password Reset Requested',
      message: 'Your password reset request has been sent to the administrator. You will be contacted with a new password shortly.',
      type: 'info',
    });

    await pushAdminNotification({
      clientId: client.id,
      clientName: client.name,
      clientLogo: client.logo,
      title: '🔑 Password Reset Request',
      message: `${client.name} (${client.email}) has requested a password reset. Go to their profile → Actions tab to set a new password.`,
      type: 'password_reset',
    });
  }, [clients, pushNotification, pushAdminNotification]);

  // ── Auth Handlers ─────────────────────────────────────────────────────
  const handleClientLogin = useCallback(async (clientId: string) => {
    setLoggedInClientId(clientId);
    setAppMode('client-portal');
    const client = clients.find(c => c.id === clientId);
    if (client) {
      await pushAdminNotification({
        clientId: client.id,
        clientName: client.name,
        clientLogo: client.logo,
        title: '🟢 Client Logged In',
        message: `${client.name} (${client.company}) has logged into their portal.`,
        type: 'client_login',
      });
    }
  }, [clients, pushAdminNotification]);

  const handleAdminLogin = useCallback(() => {
    setShowAdminLogin(false);
    setAppMode('admin');
  }, []);

  const handleAdminLogout = useCallback(() => {
    setAppMode('login');
    setShowAdminLogin(false);
    setActiveView('dashboard');
    setSelectedClientId(null);
    setSelectedChannelId(null);
  }, []);

  const handleClientLogout = useCallback(async () => {
    const client = clients.find(c => c.id === loggedInClientId);
    if (client) {
      await pushAdminNotification({
        clientId: client.id,
        clientName: client.name,
        clientLogo: client.logo,
        title: '🔴 Client Logged Out',
        message: `${client.name} has logged out of their portal.`,
        type: 'client_action',
      });
    }
    setLoggedInClientId(null);
    setAppMode('login');
  }, [clients, loggedInClientId, pushAdminNotification]);

  // ── Client Status Handler ─────────────────────────────────────────────
  const handleUpdateClientStatus = useCallback(async (
    clientId: string,
    status: Client['status'],
    reason?: string
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newAction: AdminAction = {
      id: `act-${Date.now()}`,
      type: status === 'Banned' ? 'ban' : status === 'Suspended' ? 'suspend' : 'activate',
      reason: reason || '',
      date: new Date().toISOString(),
      adminNote: '',
    };

    const updatedData: Partial<Client> = {
      status,
      adminActions: [newAction, ...(client.adminActions || [])],
    };

    if (status === 'Banned' && reason) updatedData.banReason = reason;
    if (status === 'Suspended' && reason) updatedData.suspendReason = reason;
    if (status === 'Active') { updatedData.banReason = ''; updatedData.suspendReason = ''; }

    try { await updateClient(clientId, updatedData); } catch (e) { console.error(e); }

    if (status === 'Banned') {
      await pushNotification(clientId, {
        title: '🚫 Account Banned',
        message: reason ? `Your account has been banned. Reason: ${reason}` : 'Your account has been banned by admin.',
        type: 'alert',
      });
    } else if (status === 'Suspended') {
      await pushNotification(clientId, {
        title: '⚠️ Account Suspended',
        message: reason ? `Your account has been suspended. Reason: ${reason}` : 'Your account has been suspended by admin.',
        type: 'warning',
      });
    } else if (status === 'Active') {
      await pushNotification(clientId, {
        title: '✅ Account Restored',
        message: 'Your account has been reactivated. You now have full access.',
        type: 'success',
      });
    }
  }, [clients, pushNotification]);

  // ── Distribution Channel Handlers ─────────────────────────────────────
  const handleAddRokuChannel = useCallback(async (
    clientId: string,
    channelId: string,
    channelName: string,
    platform: DistributionPlatform = 'Roku'
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newChannel: DistributionChannel = {
      id: `dist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      platform,
      channelId,
      channelName,
      addedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    const updatedChannels = [...(client.rokuChannels || []), newChannel];
    try { await updateClient(clientId, { rokuChannels: updatedChannels }); } catch (e) { console.error(e); }

    await pushAdminNotification({
      clientId: client.id,
      clientName: client.name,
      clientLogo: client.logo,
      title: '📺 New Distribution Channel Added',
      message: `${client.name} registered a new ${platform} channel: "${channelName}" (ID: ${channelId}). Needs verification.`,
      type: 'distribution_add',
    });
  }, [clients, pushAdminNotification]);

  const handleRemoveRokuChannel = useCallback(async (clientId: string, rokuChannelId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const channel = client.rokuChannels.find(ch => ch.id === rokuChannelId);
    const updatedChannels = client.rokuChannels.filter(ch => ch.id !== rokuChannelId);
    try { await updateClient(clientId, { rokuChannels: updatedChannels }); } catch (e) { console.error(e); }

    if (channel) {
      await pushAdminNotification({
        clientId: client.id,
        clientName: client.name,
        clientLogo: client.logo,
        title: '🗑️ Distribution Channel Removed',
        message: `${client.name} removed their ${channel.platform} channel: "${channel.channelName}" (ID: ${channel.channelId}).`,
        type: 'distribution_remove',
      });
    }
  }, [clients, pushAdminNotification]);

  const handleUpdateRokuStatus = useCallback(async (
    clientId: string,
    rokuChannelId: string,
    status: DistributionChannel['status']
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedChannels = client.rokuChannels.map(ch =>
      ch.id === rokuChannelId ? { ...ch, status } : ch
    );
    try { await updateClient(clientId, { rokuChannels: updatedChannels }); } catch (e) { console.error(e); }

    if (status === 'Active') {
      const channel = client.rokuChannels.find(ch => ch.id === rokuChannelId);
      if (channel) {
        await pushNotification(clientId, {
          title: '✅ Distribution Channel Approved',
          message: `Your ${channel.platform} channel "${channel.channelName}" has been verified and is now active!`,
          type: 'success',
        });
      }
    }
  }, [clients, pushNotification]);

  // ── Client Portal Notification Handlers ──────────────────────────────
  const handleMarkNotificationRead = useCallback(async (clientId: string, notifId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const updatedNotifs = client.notifications.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    try { await updateClientNotifications(clientId, updatedNotifs); } catch (e) { console.error(e); }
  }, [clients]);

  const handleMarkAllNotificationsRead = useCallback(async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const updatedNotifs = client.notifications.map(n => ({ ...n, read: true }));
    try { await updateClientNotifications(clientId, updatedNotifs); } catch (e) { console.error(e); }
  }, [clients]);

  // ── Client CRUD ───────────────────────────────────────────────────────
  const handleViewClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId);
    setActiveView('client-detail');
  }, []);

  const handleBackFromClientDetail = useCallback(() => {
    setSelectedClientId(null);
    setActiveView('clients');
  }, []);

  const handleAddClient = useCallback(async (data: {
    name: string; email: string; phone: string; company: string;
    plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
    logo: string; password: string; revenueShare: number; monthlyFee: number;
  }) => {
    const newClient: Client = {
      id: `cl-${Date.now()}`,
      name: data.name,
      logo: data.logo,
      email: data.email,
      phone: data.phone,
      company: data.company || 'Independent',
      plan: data.plan,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      channelIds: [],
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      password: data.password,
      revenueShare: data.revenueShare,
      monthlyFee: data.monthlyFee,
      rokuChannels: [],
      adminActions: [],
      notifications: [{
        id: `n-welcome-${Date.now()}`,
        title: '🎉 Welcome to ACDistro Pro!',
        message: `Hi ${data.name}, your account has been created by admin. Contact your admin to get channels and content assigned to your account.`,
        type: 'success',
        date: new Date().toISOString(),
        read: false,
      }],
    };

    try { await saveClient(newClient); } catch (e) { console.error(e); }

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const newFin: ClientFinancials = {
      clientId: newClient.id,
      payments: [],
      monthlyRevenue: months.map(month => ({ month, amount: 0 })),
    };
    try { await saveFinancials(newClient.id, newFin); } catch (e) { console.error(e); }

    await pushAdminNotification({
      clientId: newClient.id,
      clientName: newClient.name,
      clientLogo: newClient.logo,
      title: '👤 New Client Added',
      message: `Client "${newClient.name}" (${newClient.company}) has been added to the platform.`,
      type: 'client_action',
    });
  }, [pushAdminNotification]);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    // Unassign channels from this client in Firestore
    const clientChannelList = channels.filter(ch => ch.clientId === clientId);
    for (const ch of clientChannelList) {
      try { await updateChannel(ch.id, { clientId: null }); } catch (e) { console.error(e); }
    }
    try { await fbDeleteClient(clientId); } catch (e) { console.error(e); }

    if (selectedClientId === clientId) {
      setSelectedClientId(null);
      setActiveView('clients');
    }
  }, [channels, selectedClientId]);

  const handleSendNotification = useCallback(async (
    clientId: string,
    notif: Omit<ClientNotification, 'id' | 'date' | 'read'>
  ) => {
    await pushNotification(clientId, notif);
  }, [pushNotification]);

  const handleChangeClientPassword = useCallback(async (clientId: string, newPassword: string) => {
    try { await updateClient(clientId, { password: newPassword }); } catch (e) { console.error(e); }
    await pushNotification(clientId, {
      title: '🔑 Password Updated',
      message: 'Your account password has been updated by the administrator. Please use your new password to log in.',
      type: 'info',
    });
  }, [pushNotification]);

  const handleUpdateRevenueShare = useCallback(async (
    clientId: string,
    revenueShare: number,
    monthlyFee: number
  ) => {
    try { await updateClient(clientId, { revenueShare, monthlyFee }); } catch (e) { console.error(e); }
    await pushNotification(clientId, {
      title: '💰 Revenue Share Updated',
      message: `Your revenue share has been updated to ${revenueShare}% and your monthly fee to $${monthlyFee.toLocaleString()}. These changes take effect immediately.`,
      type: 'info',
    });
  }, [pushNotification]);

  // ── Device Distribution ────────────────────────────────────────────────
  const handleUpdateDeviceDistribution = useCallback(async (
    clientId: string,
    dd: { mobile: number; desktop: number; smartTV: number; tablet: number }
  ) => {
    try { await updateDeviceDistribution(clientId, dd); } catch (e) { console.error(e); }
  }, []);

  // ── Ticket Handlers ────────────────────────────────────────────────────
  const handleCreateTicket = useCallback(async (
    clientId: string,
    subject: string,
    category: SupportTicket['category'],
    priority: SupportTicket['priority'],
    message: string
  ) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const ticket: SupportTicket = {
      id: `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      clientId,
      clientName: client.name,
      clientCompany: client.company,
      clientEmail: client.email,
      clientLogo: client.logo,
      subject,
      category,
      priority,
      status: 'Open',
      messages: [{
        id: `msg-${Date.now()}`,
        senderId: clientId,
        senderName: client.name,
        senderType: 'client',
        message,
        timestamp: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try { await fbSaveTicket(ticket); } catch (e) { console.error(e); }

    await pushAdminNotification({
      clientId: client.id,
      clientName: client.name,
      clientLogo: client.logo,
      title: '🎫 New Support Ticket',
      message: `${client.name} created a ${priority} priority ticket: "${subject}"`,
      type: 'client_action',
    });
  }, [clients, pushAdminNotification]);

  const handleReplyTicket = useCallback(async (
    ticketId: string,
    senderId: string,
    senderName: string,
    senderType: 'client' | 'admin',
    message: string
  ) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId,
      senderName,
      senderType,
      message,
      timestamp: new Date().toISOString(),
    };

    const updatedTicket: Partial<SupportTicket> = {
      messages: [...ticket.messages, newMessage],
      updatedAt: new Date().toISOString(),
      status: senderType === 'admin' && ticket.status === 'Open' ? 'In Progress' : ticket.status,
    };

    try { await fbUpdateTicket(ticketId, updatedTicket); } catch (e) { console.error(e); }

    if (senderType === 'admin') {
      await pushNotification(ticket.clientId, {
        title: '💬 Ticket Reply',
        message: `Admin replied to your ticket: "${ticket.subject}"`,
        type: 'info',
      });
    } else {
      await pushAdminNotification({
        clientId: ticket.clientId,
        clientName: ticket.clientName,
        clientLogo: ticket.clientLogo,
        title: '💬 Ticket Reply',
        message: `${ticket.clientName} replied to ticket: "${ticket.subject}"`,
        type: 'client_action',
      });
    }
  }, [tickets, pushNotification, pushAdminNotification]);

  const handleUpdateTicketStatus = useCallback(async (ticketId: string, status: SupportTicket['status']) => {
    try { await fbUpdateTicket(ticketId, { status, updatedAt: new Date().toISOString() }); } catch (e) { console.error(e); }
  }, []);

  // ── PayPal Handler ────────────────────────────────────────────────────
  const handleSavePayPal = useCallback(async (clientId: string, email: string) => {
    try { await updateClient(clientId, { paypalEmail: email } as Partial<Client>); } catch (e) { console.error(e); }
    await pushNotification(clientId, {
      title: '💳 PayPal Updated',
      message: `Your PayPal email has been updated to ${email}.`,
      type: 'success',
    });
  }, [pushNotification]);

  // ── Revenue Handlers ──────────────────────────────────────────────────
  const handleAddMonthlyRevenue = useCallback(async (clientId: string, revenue: MonthlyRevenue) => {
    const fin = financials[clientId] || { clientId, payments: [], monthlyRevenue: [] };
    const existing = fin.monthlyRevenue.findIndex(r => r.month === revenue.month);
    const updatedRevenue = [...fin.monthlyRevenue];
    if (existing >= 0) {
      updatedRevenue[existing] = revenue;
    } else {
      updatedRevenue.push(revenue);
    }
    const updatedFin = { ...fin, monthlyRevenue: updatedRevenue };
    try { await saveFinancials(clientId, updatedFin); } catch (e) { console.error(e); }
    await pushNotification(clientId, {
      title: '📊 Revenue Updated',
      message: `Your revenue for ${revenue.month} has been updated to $${revenue.amount.toLocaleString()}.`,
      type: 'info',
    });
  }, [financials, pushNotification]);

  const handleAddPayment = useCallback(async (clientId: string, data: { amount: number; method: string; status: string }) => {
    const fin = financials[clientId] || { clientId, payments: [], monthlyRevenue: [] };
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toISOString(),
      amount: data.amount,
      method: data.method,
      status: data.status as 'Paid' | 'Pending' | 'Processing',
      description: `${data.method} payment`,
    };
    const updatedPayments = [payment, ...fin.payments];
    const updatedFin = { ...fin, payments: updatedPayments };
    try { await saveFinancials(clientId, updatedFin); } catch (e) { console.error(e); }
    await pushNotification(clientId, {
      title: '💰 Payment Added',
      message: `A payment of $${payment.amount.toLocaleString()} (${payment.method}) has been recorded as ${payment.status}.`,
      type: payment.status === 'Paid' ? 'success' : 'info',
    });
  }, [financials, pushNotification]);

  // ── Channel CRUD ──────────────────────────────────────────────────────
  const handleViewChannel = useCallback((channelId: string) => {
    setSelectedChannelId(channelId);
    setActiveView('channel-detail');
  }, []);

  const handleBackFromChannelDetail = useCallback(() => {
    setSelectedChannelId(null);
    setActiveView('channels');
  }, []);

  const handleAddChannel = useCallback(async (data: {
    name: string; category: string; description: string; logo: string; clientId: string | null;
  }) => {
    const newChannel: Channel = {
      id: `ch-${Date.now()}`,
      name: data.name,
      logo: data.logo,
      category: data.category,
      subscribers: Math.floor(Math.random() * 50000000) + 1000000,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      description: data.description || `${data.name} — A new streaming channel.`,
      movieIds: [],
      seriesIds: [],
      clientId: data.clientId,
    };

    try { await saveChannel(newChannel); } catch (e) { console.error(e); }

    if (data.clientId) {
      const client = clients.find(c => c.id === data.clientId);
      if (client) {
        const updatedChannelIds = [...client.channelIds, newChannel.id];
        try { await updateClient(data.clientId, { channelIds: updatedChannelIds }); } catch (e) { console.error(e); }
        await pushNotification(data.clientId, {
          title: '📺 New Channel Assigned',
          message: `Channel "${data.name}" has been added to your account by admin.`,
          type: 'success',
        });
      }
    }
  }, [clients, pushNotification]);

  const handleDeleteChannel = useCallback(async (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);

    // Unassign all movies and series in Firestore
    const chMovies = movies.filter(m => m.channelId === channelId);
    const chSeries = series.filter(s => s.channelId === channelId);
    for (const m of chMovies) {
      try { await updateMovie(m.id, { channelId: null }); } catch (e) { console.error(e); }
    }
    for (const s of chSeries) {
      try { await updateSeries(s.id, { channelId: null }); } catch (e) { console.error(e); }
    }

    // Remove from client's channelIds in Firestore
    if (channel?.clientId) {
      const client = clients.find(c => c.id === channel.clientId);
      if (client) {
        const updatedChannelIds = client.channelIds.filter(id => id !== channelId);
        try { await updateClient(client.id, { channelIds: updatedChannelIds }); } catch (e) { console.error(e); }
      }
    }

    try { await fbDeleteChannel(channelId); } catch (e) { console.error(e); }

    if (selectedChannelId === channelId) {
      setSelectedChannelId(null);
      setActiveView('channels');
    }
  }, [channels, movies, series, clients, selectedChannelId]);

  const handleAssignChannel = useCallback(async (channelId: string, clientId: string | null) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    // Remove from old client in Firestore
    if (channel.clientId) {
      const oldClient = clients.find(c => c.id === channel.clientId);
      if (oldClient) {
        const updatedIds = oldClient.channelIds.filter(id => id !== channelId);
        try { await updateClient(oldClient.id, { channelIds: updatedIds }); } catch (e) { console.error(e); }
      }
    }

    // Add to new client in Firestore
    if (clientId) {
      const newClient = clients.find(c => c.id === clientId);
      if (newClient) {
        const updatedIds = [...newClient.channelIds, channelId];
        try { await updateClient(clientId, { channelIds: updatedIds }); } catch (e) { console.error(e); }
        await pushNotification(clientId, {
          title: '📺 Channel Assigned',
          message: `Channel "${channel.name}" has been assigned to your account.`,
          type: 'success',
        });
      }
    }

    try { await updateChannel(channelId, { clientId }); } catch (e) { console.error(e); }
  }, [channels, clients, pushNotification]);

  // ── Movie CRUD ────────────────────────────────────────────────────────
  const handleAddMovie = useCallback(async (data: {
    title: string; genre: string; year: number; rating: number;
    duration: string; description: string; language: string;
    poster: string; channelId: string | null;
  }) => {
    const newMovie: Movie = {
      id: `mv-${Date.now()}`,
      ...data,
      views: 0,
      revenue: 0,
    };

    try { await saveMovie(newMovie); } catch (e) { console.error(e); }

    if (data.channelId) {
      const ch = channels.find(c => c.id === data.channelId);
      if (ch) {
        const updatedMovieIds = [...ch.movieIds, newMovie.id];
        try { await updateChannel(ch.id, { movieIds: updatedMovieIds }); } catch (e) { console.error(e); }

        if (ch.clientId) {
          await pushNotification(ch.clientId, {
            title: '🎬 New Movie Added',
            message: `"${data.title}" has been added to your ${ch.name} channel.`,
            type: 'success',
          });
        }
      }
    }
  }, [channels, pushNotification]);

  const handleDeleteMovie = useCallback(async (movieId: string) => {
    const movie = movies.find(m => m.id === movieId);

    if (movie?.channelId) {
      const ch = channels.find(c => c.id === movie.channelId);
      if (ch) {
        const updatedMovieIds = ch.movieIds.filter(id => id !== movieId);
        try { await updateChannel(ch.id, { movieIds: updatedMovieIds }); } catch (e) { console.error(e); }
      }
    }

    try { await fbDeleteMovie(movieId); } catch (e) { console.error(e); }
  }, [movies, channels]);

  const handleAssignMovie = useCallback(async (movieId: string, channelId: string | null) => {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;

    // Remove from old channel in Firestore
    if (movie.channelId) {
      const oldCh = channels.find(c => c.id === movie.channelId);
      if (oldCh) {
        const updatedMovieIds = oldCh.movieIds.filter(id => id !== movieId);
        try { await updateChannel(oldCh.id, { movieIds: updatedMovieIds }); } catch (e) { console.error(e); }
      }
    }

    // Add to new channel in Firestore
    if (channelId) {
      const newCh = channels.find(c => c.id === channelId);
      if (newCh) {
        const updatedMovieIds = [...newCh.movieIds, movieId];
        try { await updateChannel(newCh.id, { movieIds: updatedMovieIds }); } catch (e) { console.error(e); }

        if (newCh.clientId) {
          await pushNotification(newCh.clientId, {
            title: '🎬 Movie Added to Channel',
            message: `"${movie.title}" has been added to your ${newCh.name} channel.`,
            type: 'success',
          });
        }
      }
    }

    try { await updateMovie(movieId, { channelId }); } catch (e) { console.error(e); }
  }, [movies, channels, pushNotification]);

  // ── Series CRUD ───────────────────────────────────────────────────────
  const handleAddSeries = useCallback(async (data: {
    title: string; genre: string; year: number; rating: number;
    seasons: number; episodes: number; episodeDuration: string;
    description: string; language: string; poster: string;
    status: 'Ongoing' | 'Completed' | 'Cancelled'; channelId: string | null;
  }) => {
    const newSeries: Series = {
      id: `sr-${Date.now()}`,
      ...data,
      views: 0,
      revenue: 0,
    };

    try { await saveSeries(newSeries); } catch (e) { console.error(e); }

    if (data.channelId) {
      const ch = channels.find(c => c.id === data.channelId);
      if (ch) {
        const updatedSeriesIds = [...ch.seriesIds, newSeries.id];
        try { await updateChannel(ch.id, { seriesIds: updatedSeriesIds }); } catch (e) { console.error(e); }

        if (ch.clientId) {
          await pushNotification(ch.clientId, {
            title: '📺 New Series Added',
            message: `"${data.title}" series has been added to your ${ch.name} channel.`,
            type: 'success',
          });
        }
      }
    }
  }, [channels, pushNotification]);

  const handleDeleteSeries = useCallback(async (seriesId: string) => {
    const s = series.find(s => s.id === seriesId);

    if (s?.channelId) {
      const ch = channels.find(c => c.id === s.channelId);
      if (ch) {
        const updatedSeriesIds = ch.seriesIds.filter(id => id !== seriesId);
        try { await updateChannel(ch.id, { seriesIds: updatedSeriesIds }); } catch (e) { console.error(e); }
      }
    }

    try { await fbDeleteSeries(seriesId); } catch (e) { console.error(e); }
  }, [series, channels]);

  const handleAssignSeries = useCallback(async (seriesId: string, channelId: string | null) => {
    const s = series.find(s => s.id === seriesId);
    if (!s) return;

    // Remove from old channel in Firestore
    if (s.channelId) {
      const oldCh = channels.find(c => c.id === s.channelId);
      if (oldCh) {
        const updatedSeriesIds = oldCh.seriesIds.filter(id => id !== seriesId);
        try { await updateChannel(oldCh.id, { seriesIds: updatedSeriesIds }); } catch (e) { console.error(e); }
      }
    }

    // Add to new channel in Firestore
    if (channelId) {
      const newCh = channels.find(c => c.id === channelId);
      if (newCh) {
        const updatedSeriesIds = [...newCh.seriesIds, seriesId];
        try { await updateChannel(newCh.id, { seriesIds: updatedSeriesIds }); } catch (e) { console.error(e); }

        if (newCh.clientId) {
          await pushNotification(newCh.clientId, {
            title: '📺 Series Added to Channel',
            message: `"${s.title}" has been added to your ${newCh.name} channel.`,
            type: 'success',
          });
        }
      }
    }

    try { await updateSeries(seriesId, { channelId }); } catch (e) { console.error(e); }
  }, [series, channels, pushNotification]);

  // ── Computed Values ───────────────────────────────────────────────────
  const selectedChannel = channels.find(c => c.id === selectedChannelId);
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedChannelMovies = selectedChannel
    ? movies.filter(m => selectedChannel.movieIds.includes(m.id))
    : [];
  const selectedChannelSeries = selectedChannel
    ? series.filter(s => selectedChannel.seriesIds.includes(s.id))
    : [];
  const selectedClientChannels = selectedClient
    ? channels.filter(ch => selectedClient.channelIds.includes(ch.id))
    : [];

  // ── Render Admin View ─────────────────────────────────────────────────
  const renderAdminView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            clients={clients}
            channels={channels}
            movies={movies}
            series={series}
            onViewChannel={handleViewChannel}
            onViewClient={handleViewClient}
          />
        );

      case 'clients':
        return (
          <ClientsView
            clients={clients}
            channels={channels}
            movies={movies}
            series={series}
            onViewClient={handleViewClient}
            onAddClient={() => setShowAddClient(true)}
            onDeleteClient={handleDeleteClient}
            onUpdateClientStatus={handleUpdateClientStatus}
          />
        );

      case 'client-detail':
        if (!selectedClient) return null;
        return (
          <ClientDetailView
            client={selectedClient}
            channels={selectedClientChannels}
            allChannels={channels}
            movies={movies}
            series={series}
            onBack={handleBackFromClientDetail}
            onViewChannel={handleViewChannel}
            onAssignChannel={handleAssignChannel}
            onSendNotification={handleSendNotification}
            onUpdateRokuStatus={handleUpdateRokuStatus}
            onUpdateClientStatus={handleUpdateClientStatus}
            onChangePassword={handleChangeClientPassword}
            onUpdateRevenueShare={handleUpdateRevenueShare}
            onUpdateDeviceDistribution={handleUpdateDeviceDistribution}
          />
        );

      case 'channels':
        return (
          <ChannelsView
            channels={channels}
            clients={clients}
            movies={movies}
            series={series}
            onViewChannel={handleViewChannel}
            onAddChannel={() => setShowAddChannel(true)}
            onDeleteChannel={handleDeleteChannel}
          />
        );

      case 'channel-detail':
        if (!selectedChannel) return null;
        return (
          <ChannelDetailView
            channel={selectedChannel}
            channelMovies={selectedChannelMovies}
            channelSeries={selectedChannelSeries}
            allMovies={movies}
            allSeries={series}
            clients={clients}
            onBack={handleBackFromChannelDetail}
            onAssignMovie={handleAssignMovie}
            onDeleteMovie={handleDeleteMovie}
            onAssignSeries={handleAssignSeries}
            onDeleteSeries={handleDeleteSeries}
          />
        );

      case 'movies':
        return (
          <MoviesView
            movies={movies}
            channels={channels}
            onAddMovie={() => setShowAddMovie(true)}
            onDeleteMovie={handleDeleteMovie}
            onAssignMovie={handleAssignMovie}
          />
        );

      case 'series':
        return (
          <SeriesView
            series={series}
            channels={channels}
            onAddSeries={() => setShowAddSeries(true)}
            onDeleteSeries={handleDeleteSeries}
            onAssignSeries={handleAssignSeries}
          />
        );

      case 'tickets':
        return (
          <AdminTicketsView
            tickets={tickets}
            onReplyTicket={(ticketId, message) =>
              handleReplyTicket(ticketId, 'admin', 'ACDistro Pro Support', 'admin', message)
            }
            onUpdateTicketStatus={handleUpdateTicketStatus}
          />
        );

      case 'revenue':
        return (
          <AdminRevenueManager
            clients={clients}
            channels={channels}
            movies={movies}
            series={series}
            financials={financials}
            onAddMonthlyRevenue={(clientId, data) => {
              const revenue: MonthlyRevenue = {
                month: `${data.month} ${data.year}`,
                amount: data.amount,
                views: data.views,
                subscribers: data.subscribers,
                watchTime: data.watchTime,
              };
              handleAddMonthlyRevenue(clientId, revenue);
            }}
            onAddPayment={handleAddPayment}
            onUpdateDeviceDistribution={handleUpdateDeviceDistribution}
            onUpdateContentPerformance={async (type, id, data) => {
              if (type === 'movie') {
                try { await updateMovie(id, { views: data.views, rating: data.rating, revenue: data.revenue }); } catch (e) { console.error(e); }
              } else {
                try { await updateSeries(id, { views: data.views, rating: data.rating, revenue: data.revenue }); } catch (e) { console.error(e); }
              }
            }}
            onUpdateClientAnalytics={async (clientId, data) => {
              try { 
                await updateClient(clientId, { 
                  analytics: { 
                    totalViews: data.totalViews, 
                    totalSubscribers: data.totalSubscribers, 
                    avgWatchTime: data.avgWatchTime 
                  } 
                } as Partial<Client>); 
              } catch (e) { console.error(e); }
            }}
          />
        );

      default:
        return null;
    }
  };

  // ── Loading Screen ────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;

  // ── Auth Screens ──────────────────────────────────────────────────────
  if (appMode === 'login') {
    if (showAdminLogin) {
      return (
        <AdminLoginPage
          onAdminLogin={handleAdminLogin}
          onBackToClient={() => setShowAdminLogin(false)}
        />
      );
    }
    return (
      <ClientLoginPage
        clients={clients}
        onClientLogin={handleClientLogin}
        onAdminHint={() => setShowAdminLogin(true)}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  // ── Client Portal ─────────────────────────────────────────────────────
  if (appMode === 'client-portal' && loggedInClientId) {
    const loggedClient = clients.find(c => c.id === loggedInClientId);
    if (!loggedClient) {
      setAppMode('login');
      return null;
    }

    const clientChannels = channels.filter(ch => loggedClient.channelIds.includes(ch.id));
    const clientMovies = movies.filter(m => clientChannels.some(ch => ch.movieIds.includes(m.id)));
    const clientSeries = series.filter(s => clientChannels.some(ch => ch.seriesIds.includes(s.id)));
    const clientFinancials = financials[loggedInClientId] || {
      clientId: loggedInClientId,
      payments: [],
      monthlyRevenue: [],
    };

    const clientTickets = tickets.filter(t => t.clientId === loggedInClientId);

    return (
      <ClientPortal
        client={loggedClient}
        channels={clientChannels}
        movies={clientMovies}
        series={clientSeries}
        financials={clientFinancials}
        tickets={clientTickets}
        onExitPortal={handleClientLogout}
        onMarkNotificationRead={(id) => handleMarkNotificationRead(loggedInClientId, id)}
        onMarkAllRead={() => handleMarkAllNotificationsRead(loggedInClientId)}
        onAddRokuChannel={(channelId, channelName, platform) =>
          handleAddRokuChannel(loggedInClientId, channelId, channelName, platform)
        }
        onRemoveRokuChannel={(rokuChannelId) =>
          handleRemoveRokuChannel(loggedInClientId, rokuChannelId)
        }
        onCreateTicket={(subject, category, priority, message) =>
          handleCreateTicket(loggedInClientId, subject, category, priority, message)
        }
        onReplyTicket={(ticketId, message) =>
          handleReplyTicket(ticketId, loggedInClientId, loggedClient.name, 'client', message)
        }
        onSavePayPal={(email) => handleSavePayPal(loggedInClientId, email)}
      />
    );
  }

  // ── Admin Dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-slate-100">
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          if (view !== 'client-detail') setSelectedClientId(null);
          if (view !== 'channel-detail') setSelectedChannelId(null);
        }}
        onAddClient={() => setShowAddClient(true)}
        onAddChannel={() => setShowAddChannel(true)}
        onAddMovie={() => setShowAddMovie(true)}
        onAddSeries={() => setShowAddSeries(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleAdminLogout}
        adminNotifications={adminNotifications}
        onMarkAdminNotifRead={handleMarkAdminNotifRead}
        onMarkAllAdminNotifsRead={handleMarkAllAdminNotifsRead}
        onClearAdminNotifs={handleClearAdminNotifs}
        onViewClient={handleViewClient}
      />

      {/* pt-14 on mobile = height of fixed top navbar; lg:pt-0 on desktop */}
      <main className={cn(
        'transition-all duration-300 min-h-screen pt-14 lg:pt-0',
        sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
      )}>
        <div className="p-4 lg:p-6 xl:p-8">
          {renderAdminView()}
        </div>
      </main>

      {/* Modals */}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onAdd={handleAddClient}
        />
      )}
      {showAddChannel && (
        <AddChannelModal
          clients={clients}
          onClose={() => setShowAddChannel(false)}
          onAdd={handleAddChannel}
        />
      )}
      {showAddMovie && (
        <AddMovieModal
          channels={channels}
          onClose={() => setShowAddMovie(false)}
          onAdd={handleAddMovie}
        />
      )}
      {showAddSeries && (
        <AddSeriesModal
          channels={channels}
          onClose={() => setShowAddSeries(false)}
          onAdd={handleAddSeries}
        />
      )}
    </div>
  );
}
