import { useState } from 'react';
import { BarChart3, Eye, Users, Clock, TrendingUp, Monitor, Smartphone, Tv, Tablet } from 'lucide-react';
import { Movie, Series, Channel, ClientFinancials, Client } from '../../types';

interface ClientPortalAnalyticsProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
  financials: ClientFinancials | null;
}

export function ClientPortalAnalytics({
  client,
  channels,
  movies,
  series,
  financials
}: ClientPortalAnalyticsProps) {
  // Get analytics and device distribution from client
  const analytics = (client as any).analytics || null;
  const deviceDistribution = client.deviceDistribution || null;
  const [activeTab, setActiveTab] = useState<'overview' | 'content'>('overview');

  // Get client's movies and series
  const clientChannelIds = channels.map(c => c.id);
  const clientMovies = movies.filter(m => m.channelId && clientChannelIds.includes(m.channelId));
  const clientSeries = series.filter(s => s.channelId && clientChannelIds.includes(s.channelId));

  // Calculate totals from analytics or content
  const totalViews = analytics?.totalViews || 
    clientMovies.reduce((sum, m) => sum + (m.views || 0), 0) + 
    clientSeries.reduce((sum, s) => sum + (s.views || 0), 0);
  
  const totalSubscribers = analytics?.totalSubscribers || 
    channels.reduce((sum, c) => sum + (c.subscribers || 0), 0);
  
  const avgWatchTime = analytics?.avgWatchTime || 0;
  
  const totalRevenue = analytics?.totalRevenue || 
    financials?.monthlyRevenue?.reduce((sum, m) => sum + (m.amount || 0), 0) || 0;

  // Monthly revenue data for chart
  const monthlyData = financials?.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthlyData.map(m => m.amount || 0), 1);

  // Device distribution
  const devices = deviceDistribution || { mobile: 0, desktop: 0, smartTV: 0, tablet: 0 };
  const deviceTotal = devices.mobile + devices.desktop + devices.smartTV + devices.tablet;

  // Content performance - combine movies and series
  const allContent = [
    ...clientMovies.map(m => ({
      id: m.id,
      title: m.title,
      type: 'Movie' as const,
      views: m.views || 0,
      rating: m.rating || 0,
      revenue: m.revenue || 0
    })),
    ...clientSeries.map(s => ({
      id: s.id,
      title: s.title,
      type: 'Series' as const,
      views: s.views || 0,
      rating: s.rating || 0,
      revenue: s.revenue || 0
    }))
  ].sort((a, b) => b.views - a.views);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Track your content performance and audience insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalViews)}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-gray-400 text-sm">Subscribers</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(totalSubscribers)}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-gray-400 text-sm">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">${formatNumber(totalRevenue)}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-gray-400 text-sm">Avg Watch Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{avgWatchTime} min</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          🎬 Content Performance
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Monthly Revenue</h3>
            </div>
            
            {monthlyData.length > 0 ? (
              <div className="space-y-3">
                {monthlyData.slice(-6).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-16">{item.month}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max((item.amount / maxRevenue) * 100, 10)}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          ${formatNumber(item.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No revenue data yet</p>
                <p className="text-gray-500 text-sm">Admin will add your monthly revenue</p>
              </div>
            )}
          </div>

          {/* Device Distribution */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Device Distribution</h3>
            </div>

            {deviceTotal > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300 w-20">Mobile</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${devices.mobile}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">{devices.mobile}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300 w-20">Desktop</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${devices.desktop}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">{devices.desktop}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <Tv className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300 w-20">Smart TV</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${devices.smartTV}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">{devices.smartTV}%</span>
                </div>

                <div className="flex items-center gap-3">
                  <Tablet className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-300 w-20">Tablet</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{ width: `${devices.tablet}%` }}
                    />
                  </div>
                  <span className="text-white font-medium w-12 text-right">{devices.tablet}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No device data yet</p>
                <p className="text-gray-500 text-sm">Admin will set your device distribution</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Content Performance</h3>
            <p className="text-gray-400 text-sm">All your movies & series ranked by views</p>
          </div>

          {allContent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Title</th>
                    <th className="text-left text-gray-400 font-medium px-4 py-3">Type</th>
                    <th className="text-right text-gray-400 font-medium px-4 py-3">Views</th>
                    <th className="text-right text-gray-400 font-medium px-4 py-3">Rating</th>
                    <th className="text-right text-gray-400 font-medium px-4 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {allContent.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.type === 'Movie' ? '🎬' : '📺'}</span>
                          <span className="text-white font-medium">{item.title}</span>
                          {index === 0 && (
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                              🏆 Top
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.type === 'Movie' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-white font-medium">
                          👁️ {formatNumber(item.views)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${
                          item.rating >= 8 ? 'text-green-400' :
                          item.rating >= 6 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          ⭐ {item.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-400 font-medium">
                          💰 ${formatNumber(item.revenue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-gray-400">No content assigned yet</p>
              <p className="text-gray-500 text-sm">Admin will assign movies & series to your channels</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
