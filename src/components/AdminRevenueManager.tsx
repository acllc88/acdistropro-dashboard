import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Users, Clock, CreditCard,
  Monitor, Smartphone, Tv, Tablet, Save, Plus, Film,
  PlayCircle, Eye, CheckCircle, AlertCircle, Loader,
  BarChart3, Activity
} from 'lucide-react';
import { Client, Channel, Movie, Series, ClientFinancials } from '../types';
import { cn } from '../utils/cn';

interface AdminRevenueManagerProps {
  clients: Client[];
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: Record<string, ClientFinancials>;
  onUpdateClientAnalytics: (clientId: string, data: { totalViews: number; totalSubscribers: number; avgWatchTime: number }) => void;
  onAddMonthlyRevenue: (clientId: string, data: { month: string; year: number; amount: number; views: number; subscribers: number; watchTime: number }) => void;
  onAddPayment: (clientId: string, data: { amount: number; method: string; status: string }) => void;
  onUpdateDeviceDistribution: (clientId: string, data: { mobile: number; desktop: number; smartTV: number; tablet: number }) => void;
  onUpdateContentPerformance: (type: 'movie' | 'series', id: string, data: { views: number; rating: number; revenue: number }) => void;
}

export const AdminRevenueManager: React.FC<AdminRevenueManagerProps> = ({
  clients, channels, movies, series, financials,
  onUpdateClientAnalytics, onAddMonthlyRevenue, onAddPayment,
  onUpdateDeviceDistribution, onUpdateContentPerformance
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [saving, setSaving] = useState<string>('');

  // Analytics
  const [totalViews, setTotalViews] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [avgWatchTime, setAvgWatchTime] = useState(0);

  // Monthly Revenue
  const [revenueMonth, setRevenueMonth] = useState('January');
  const [revenueYear, setRevenueYear] = useState(2025);
  const [revenueAmount, setRevenueAmount] = useState(0);
  const [revenueViews, setRevenueViews] = useState(0);
  const [revenueSubscribers, setRevenueSubscribers] = useState(0);
  const [revenueWatchTime, setRevenueWatchTime] = useState(0);

  // Payment
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  // Devices
  const [deviceMobile, setDeviceMobile] = useState(25);
  const [deviceDesktop, setDeviceDesktop] = useState(25);
  const [deviceSmartTV, setDeviceSmartTV] = useState(25);
  const [deviceTablet, setDeviceTablet] = useState(25);

  // Content
  const [contentUpdates, setContentUpdates] = useState<Record<string, { views: number; rating: number; revenue: number }>>({});

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientChannels = channels.filter(ch => ch.clientId === selectedClientId);
  const clientChannelIds = clientChannels.map(ch => ch.id);
  const clientMovies = movies.filter(m => m.channelId && clientChannelIds.includes(m.channelId));
  const clientSeries = series.filter(s => s.channelId && clientChannelIds.includes(s.channelId));
  const clientFinancials = selectedClientId ? financials[selectedClientId] : null;

  useEffect(() => {
    if (selectedClient) {
      const dd = selectedClient.deviceDistribution;
      if (dd) {
        setDeviceMobile(dd.mobile || 25);
        setDeviceDesktop(dd.desktop || 25);
        setDeviceSmartTV(dd.smartTV || 25);
        setDeviceTablet(dd.tablet || 25);
      }
      const updates: Record<string, { views: number; rating: number; revenue: number }> = {};
      clientMovies.forEach(m => { updates[`movie-${m.id}`] = { views: m.views || 0, rating: m.rating || 0, revenue: m.revenue || 0 }; });
      clientSeries.forEach(s => { updates[`series-${s.id}`] = { views: s.views || 0, rating: s.rating || 0, revenue: s.revenue || 0 }; });
      setContentUpdates(updates);
    }
  }, [selectedClientId]);

  const handleSaveAnalytics = async () => {
    if (!selectedClientId) return;
    setSaving('analytics');
    await onUpdateClientAnalytics(selectedClientId, { totalViews, totalSubscribers, avgWatchTime });
    setTimeout(() => setSaving(''), 1000);
  };

  const handleAddRevenue = async () => {
    if (!selectedClientId || revenueAmount <= 0) return;
    setSaving('revenue');
    await onAddMonthlyRevenue(selectedClientId, { month: revenueMonth, year: revenueYear, amount: revenueAmount, views: revenueViews, subscribers: revenueSubscribers, watchTime: revenueWatchTime });
    setRevenueAmount(0); setRevenueViews(0); setRevenueSubscribers(0); setRevenueWatchTime(0);
    setTimeout(() => setSaving(''), 1000);
  };

  const handleAddPayment = async () => {
    if (!selectedClientId || paymentAmount <= 0) return;
    setSaving('payment');
    await onAddPayment(selectedClientId, { amount: paymentAmount, method: paymentMethod, status: paymentStatus });
    setPaymentAmount(0);
    setTimeout(() => setSaving(''), 1000);
  };

  const handleUpdateDevices = async () => {
    if (!selectedClientId) return;
    setSaving('devices');
    await onUpdateDeviceDistribution(selectedClientId, { mobile: deviceMobile, desktop: deviceDesktop, smartTV: deviceSmartTV, tablet: deviceTablet });
    setTimeout(() => setSaving(''), 1000);
  };

  const handleUpdateContent = async (type: 'movie' | 'series', id: string) => {
    const key = `${type}-${id}`;
    const data = contentUpdates[key];
    if (!data) return;
    setSaving(key);
    await onUpdateContentPerformance(type, id, data);
    setTimeout(() => setSaving(''), 1000);
  };

  const updateContentField = (key: string, field: 'views' | 'rating' | 'revenue', value: number) => {
    setContentUpdates(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const deviceTotal = deviceMobile + deviceDesktop + deviceSmartTV + deviceTablet;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const totalEarnings = clientFinancials?.monthlyRevenue?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Revenue Manager</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage client analytics, revenue, payments and content performance</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
          <DollarSign size={16} className="text-green-600" />
          <span className="text-green-700 font-semibold text-sm">Revenue Control</span>
        </div>
      </div>

      {/* Client Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Select Client</label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
        >
          <option value="">-- Choose a client --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name} — {client.company} ({client.plan})
            </option>
          ))}
        </select>

        {selectedClient && (
          <div className="mt-4 flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-xl text-white font-bold shadow-lg shadow-violet-500/25">
              {selectedClient.logo || selectedClient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-bold">{selectedClient.name}</p>
              <p className="text-gray-500 text-sm">{selectedClient.company} • {selectedClient.email}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">{selectedClient.plan}</span>
              <p className="text-gray-500 text-xs mt-1">{selectedClient.revenueShare}% revenue share</p>
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Channels', value: clientChannels.length, icon: Tv, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
              { label: 'Movies', value: clientMovies.length, icon: Film, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
              { label: 'Series', value: clientSeries.length, icon: PlayCircle, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
              { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
            ].map(stat => (
              <div key={stat.label} className={cn('bg-white rounded-2xl shadow-sm border p-4', stat.border)}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                    <p className="text-xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 1: Client Analytics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Client Analytics</h2>
                <p className="text-xs text-gray-400">Set total views, subscribers and watch time</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Views</label>
                  <div className="relative">
                    <Eye size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={totalViews}
                      onChange={(e) => setTotalViews(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Subscribers</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={totalSubscribers}
                      onChange={(e) => setTotalSubscribers(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Avg Watch Time (min)</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={avgWatchTime}
                      onChange={(e) => setAvgWatchTime(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveAnalytics}
                disabled={saving === 'analytics'}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 font-medium text-sm disabled:opacity-50"
              >
                {saving === 'analytics' ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                Save Analytics
              </button>
            </div>
          </div>

          {/* Section 2: Monthly Revenue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <BarChart3 size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Monthly Revenue</h2>
                <p className="text-xs text-gray-400">Add monthly revenue data for the client</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Month</label>
                  <select
                    value={revenueMonth}
                    onChange={(e) => setRevenueMonth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    {months.map(m => <option key={m} value={m}>{m.slice(0,3)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Year</label>
                  <select
                    value={revenueYear}
                    onChange={(e) => setRevenueYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    value={revenueAmount}
                    onChange={(e) => setRevenueAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Views</label>
                  <input
                    type="number"
                    value={revenueViews}
                    onChange={(e) => setRevenueViews(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subscribers</label>
                  <input
                    type="number"
                    value={revenueSubscribers}
                    onChange={(e) => setRevenueSubscribers(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Watch Time</label>
                  <input
                    type="number"
                    value={revenueWatchTime}
                    onChange={(e) => setRevenueWatchTime(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <button
                onClick={handleAddRevenue}
                disabled={saving === 'revenue' || revenueAmount <= 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 font-medium text-sm disabled:opacity-50"
              >
                {saving === 'revenue' ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Monthly Revenue
              </button>

              {clientFinancials?.monthlyRevenue && clientFinancials.monthlyRevenue.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Revenue</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Month</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Views</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Subscribers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {clientFinancials.monthlyRevenue.slice(-5).reverse().map((rev, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{rev.month}</td>
                            <td className="px-4 py-3 font-bold text-green-600">${rev.amount?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-600">{rev.views?.toLocaleString() || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{rev.subscribers?.toLocaleString() || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Content Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Activity size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Content Performance</h2>
                <p className="text-xs text-gray-400">All movies & series ranked by views — set views, rating and revenue</p>
              </div>
            </div>
            <div className="p-6">
              {clientMovies.length === 0 && clientSeries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🎬</div>
                  <p className="text-gray-500 font-medium">No content assigned yet</p>
                  <p className="text-gray-400 text-sm mt-1">Assign channels with movies & series to this client first</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-gray-50 rounded-xl text-xs font-semibold text-gray-500">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-2 text-center">Views</div>
                    <div className="col-span-2 text-center">Rating</div>
                    <div className="col-span-2 text-center">Revenue ($)</div>
                    <div className="col-span-2 text-center">Action</div>
                  </div>

                  {/* Movies */}
                  {clientMovies.map(movie => {
                    const key = `movie-${movie.id}`;
                    const data = contentUpdates[key] || { views: 0, rating: 0, revenue: 0 };
                    return (
                      <div key={movie.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Film size={14} className="text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{movie.title}</p>
                            <p className="text-xs text-gray-400">{movie.genre} · Movie</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={data.views}
                            onChange={(e) => updateContentField(key, 'views', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={data.rating}
                            onChange={(e) => updateContentField(key, 'rating', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={data.revenue}
                            onChange={(e) => updateContentField(key, 'revenue', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => handleUpdateContent('movie', movie.id)}
                            disabled={saving === key}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                              saving === key ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700'
                            )}
                          >
                            {saving === key ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            {saving === key ? '...' : 'Update'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Series */}
                  {clientSeries.map(s => {
                    const key = `series-${s.id}`;
                    const data = contentUpdates[key] || { views: 0, rating: 0, revenue: 0 };
                    return (
                      <div key={s.id} className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <PlayCircle size={14} className="text-pink-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{s.title}</p>
                            <p className="text-xs text-gray-400">{s.genre} · Series · {s.seasons}S</p>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={data.views}
                            onChange={(e) => updateContentField(key, 'views', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={data.rating}
                            onChange={(e) => updateContentField(key, 'rating', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={data.revenue}
                            onChange={(e) => updateContentField(key, 'revenue', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => handleUpdateContent('series', s.id)}
                            disabled={saving === key}
                            className={cn(
                              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                              saving === key ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700'
                            )}
                          >
                            {saving === key ? <Loader size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            {saving === key ? '...' : 'Update'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Payments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center">
                <CreditCard size={18} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Payments</h2>
                <p className="text-xs text-gray-400">Add payment records to client's payment history</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount ($)</label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                  >
                    <option value="PayPal">PayPal</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Wire">Wire Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500"
                  >
                    <option value="Paid">✅ Paid</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Processing">🔄 Processing</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddPayment}
                disabled={saving === 'payment' || paymentAmount <= 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg shadow-yellow-500/25 font-medium text-sm disabled:opacity-50"
              >
                {saving === 'payment' ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Payment
              </button>

              {clientFinancials?.payments && clientFinancials.payments.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment History</h3>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Method</th>
                          <th className="px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {clientFinancials.payments.slice(-5).reverse().map((payment, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                            <td className="px-4 py-3 font-bold text-green-600">${payment.amount?.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-600">{payment.method}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                                payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              )}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Device Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                <Monitor size={18} className="text-pink-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Device Distribution</h2>
                <p className="text-xs text-gray-400">Set device usage percentages for the client</p>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[
                  { label: 'Mobile', value: deviceMobile, setValue: setDeviceMobile, icon: Smartphone, color: 'text-blue-600', accent: 'accent-blue-500', bg: 'bg-blue-50' },
                  { label: 'Desktop', value: deviceDesktop, setValue: setDeviceDesktop, icon: Monitor, color: 'text-green-600', accent: 'accent-green-500', bg: 'bg-green-50' },
                  { label: 'Smart TV', value: deviceSmartTV, setValue: setDeviceSmartTV, icon: Tv, color: 'text-purple-600', accent: 'accent-purple-500', bg: 'bg-purple-50' },
                  { label: 'Tablet', value: deviceTablet, setValue: setDeviceTablet, icon: Tablet, color: 'text-amber-600', accent: 'accent-amber-500', bg: 'bg-amber-50' },
                ].map(device => (
                  <div key={device.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', device.bg)}>
                          <device.icon size={16} className={device.color} />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{device.label}</span>
                      </div>
                      <span className="text-lg font-black text-gray-900">{device.value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={device.value}
                      onChange={(e) => device.setValue(Number(e.target.value))}
                      className={cn('w-full', device.accent)}
                    />
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all', device.bg)} style={{ width: `${device.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium',
                  deviceTotal === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                )}>
                  {deviceTotal === 100
                    ? <CheckCircle size={16} className="text-emerald-500" />
                    : <AlertCircle size={16} className="text-amber-500" />
                  }
                  Total: {deviceTotal}% {deviceTotal !== 100 && '— must equal 100%'}
                </div>
                <button
                  onClick={handleUpdateDevices}
                  disabled={saving === 'devices'}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/25 font-medium text-sm disabled:opacity-50"
                >
                  {saving === 'devices' ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  Update Devices
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRevenueManager;
