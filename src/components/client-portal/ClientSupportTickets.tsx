import { useState } from 'react';
import { SupportTicket, TicketMessage } from '../../types';
import { Plus, Send, ChevronLeft, MessageSquare, Clock, AlertCircle, CheckCircle, Loader, XCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ClientSupportTicketsProps {
  tickets: SupportTicket[];
  clientId: string;
  clientName: string;
  onCreateTicket: (subject: string, category: SupportTicket['category'], priority: SupportTicket['priority'], message: string) => void;
  onReplyTicket: (ticketId: string, message: string) => void;
}

export function ClientSupportTickets({ tickets, clientId, clientName: _clientName, onCreateTicket, onReplyTicket }: ClientSupportTicketsProps) {
  void _clientName;
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('General');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('Medium');
  const [newMessage, setNewMessage] = useState('');

  const myTickets = tickets.filter(t => t.clientId === clientId);

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
      case 'Closed': return 'bg-slate-500/20 text-slate-400';
      default: return 'bg-slate-500/20 text-slate-400';
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

  const relTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleCreate = () => {
    if (!newSubject.trim() || !newMessage.trim()) return;
    onCreateTicket(newSubject.trim(), newCategory, newPriority, newMessage.trim());
    setNewSubject('');
    setNewMessage('');
    setNewCategory('General');
    setNewPriority('Medium');
    setShowCreate(false);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    onReplyTicket(selectedTicket.id, replyText.trim());
    setReplyText('');
  };

  // ── Create Modal ──
  if (showCreate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-lg font-bold text-white">📝 New Support Ticket</h3>
            <button onClick={() => setShowCreate(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Subject</label>
              <input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Brief description of your issue" className="w-full px-4 py-2.5 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as SupportTicket['category'])} className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30">
                  {['Technical','Billing','Content','Distribution','Account','General'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1 block">Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as SupportTicket['priority'])} className="w-full px-3 py-2.5 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30">
                  {['Low','Medium','High','Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Description</label>
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows={4} placeholder="Describe your issue in detail..." className="w-full px-4 py-2.5 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" />
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-400 border border-white/10 rounded-xl hover:bg-white/5">Cancel</button>
            <button onClick={handleCreate} disabled={!newSubject.trim() || !newMessage.trim()} className="flex-1 px-4 py-2.5 text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-40">Submit Ticket</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Ticket Detail ──
  if (selectedTicket) {
    const ticket = myTickets.find(t => t.id === selectedTicket.id) || selectedTicket;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors">
          <ChevronLeft size={16} /> Back to Tickets
        </button>

        <div className="bg-slate-900/50 rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/5">
            <h2 className="text-lg font-bold text-white mb-2">{ticket.subject}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', priorityColor(ticket.priority))}>{ticket.priority}</span>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', statusColor(ticket.status))}>{statusIcon(ticket.status)} {ticket.status}</span>
              <span className="text-xs text-slate-500">{ticket.category}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {relTime(ticket.createdAt)}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 max-h-[400px] overflow-y-auto">
            {ticket.messages.map((msg: TicketMessage) => (
              <div key={msg.id} className={cn('flex', msg.senderType === 'client' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                  'max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3',
                  msg.senderType === 'client'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : 'bg-slate-800 border border-white/10 text-slate-200'
                )}>
                  <p className={cn('text-xs font-semibold mb-1', msg.senderType === 'client' ? 'text-violet-200' : 'text-violet-400')}>{msg.senderName}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <p className={cn('text-[10px] mt-2', msg.senderType === 'client' ? 'text-violet-300' : 'text-slate-500')}>{relTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== 'Closed' && (
            <div className="p-4 sm:p-6 border-t border-white/5">
              <div className="flex gap-3">
                <input
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 text-sm bg-slate-800 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-violet-500/30"
                />
                <button onClick={handleSendReply} disabled={!replyText.trim()} className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg disabled:opacity-40">
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Ticket List ──
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">🎫 Support</h2>
          <p className="text-sm text-slate-400 mt-1">Get help from our team</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all">
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {myTickets.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-12 text-center">
          <MessageSquare size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium">No tickets yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a ticket to get help from our support team</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-500">Create Your First Ticket</button>
        </div>
      ) : (
        <div className="space-y-3">
          {myTickets.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="bg-slate-900/50 rounded-xl border border-white/10 p-4 hover:border-violet-500/30 hover:bg-slate-900/80 transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-violet-300 transition-colors">{ticket.subject}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium border', priorityColor(ticket.priority))}>{ticket.priority}</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1', statusColor(ticket.status))}>{statusIcon(ticket.status)} {ticket.status}</span>
                    <span className="text-xs text-slate-500">{ticket.category}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={10} /> {relTime(ticket.updatedAt)}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1"><MessageSquare size={10} /> {ticket.messages.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
