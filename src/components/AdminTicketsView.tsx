import { useState } from 'react';
import { SupportTicket, TicketMessage } from '../types';
import { Search, Filter, MessageSquare, Clock, Send, ChevronLeft, AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface AdminTicketsViewProps {
  tickets: SupportTicket[];
  onReplyTicket: (ticketId: string, message: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
}

export function AdminTicketsView({ tickets, onReplyTicket, onUpdateTicketStatus }: AdminTicketsViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const urgentCount = tickets.filter(t => t.priority === 'Urgent' && t.status !== 'Resolved' && t.status !== 'Closed').length;

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const priorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'Open': return 'bg-blue-500/20 text-blue-400';
      case 'In Progress': return 'bg-amber-500/20 text-amber-400';
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-400';
      case 'Closed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case 'Open': return <AlertCircle size={12} />;
      case 'In Progress': return <Loader size={12} />;
      case 'Resolved': return <CheckCircle size={12} />;
      case 'Closed': return <XCircle size={12} />;
      default: return null;
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    onReplyTicket(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  const relTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ── Ticket Detail View ──
  if (selectedTicket) {
    const ticket = tickets.find(t => t.id === selectedTicket.id) || selectedTicket;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Back to Tickets
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{ticket.subject}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-gray-500">{ticket.clientLogo} {ticket.clientName}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500">{ticket.clientCompany}</span>
                  <span className="text-gray-300">·</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', priorityColor(ticket.priority))}>{ticket.priority}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', statusColor(ticket.status))}>{statusIcon(ticket.status)} {ticket.status}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {(['Open', 'In Progress', 'Resolved', 'Closed'] as SupportTicket['status'][]).map(s => (
                  <button
                    key={s}
                    onClick={() => { onUpdateTicketStatus(ticket.id, s); setSelectedTicket({ ...ticket, status: s }); }}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                      ticket.status === s ? 'bg-violet-600 text-white border-violet-600' : 'text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[400px] overflow-y-auto bg-gray-50/50">
            {ticket.messages.map((msg: TicketMessage) => (
              <div key={msg.id} className={cn('flex', msg.senderType === 'admin' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
                  msg.senderType === 'admin'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                )}>
                  <p className={cn('text-xs font-semibold mb-1', msg.senderType === 'admin' ? 'text-violet-200' : 'text-gray-500')}>{msg.senderName}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <p className={cn('text-[10px] mt-2', msg.senderType === 'admin' ? 'text-violet-300' : 'text-gray-400')}>{relTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ticket List View ──
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🎫 Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client support requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{openCount}</p>
          <p className="text-xs text-blue-600">Open</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{inProgressCount}</p>
          <p className="text-xs text-amber-600">In Progress</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
          <p className="text-xs text-red-600">Urgent</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none">
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tickets found</p>
            <p className="text-gray-400 text-sm mt-1">Tickets from clients will appear here</p>
          </div>
        ) : (
          filtered.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">{ticket.clientLogo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-violet-600 transition-colors">{ticket.subject}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', priorityColor(ticket.priority))}>{ticket.priority}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1', statusColor(ticket.status))}>{statusIcon(ticket.status)} {ticket.status}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium">{ticket.clientName}</span>
                    <span>·</span>
                    <span>{ticket.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {relTime(ticket.updatedAt)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MessageSquare size={10} /> {ticket.messages.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
