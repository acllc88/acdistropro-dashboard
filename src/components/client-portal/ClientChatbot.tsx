import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { Client, Channel, Movie, Series } from '../../types';
import { getChatbotResponse } from '../../services/aiService';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface ClientChatbotProps {
  client: Client;
  channels: Channel[];
  movies: Movie[];
  series: Series[];
}

const QUICK_ACTIONS = [
  { label: '📺 How to add channels?', msg: 'How do I add distribution channels to my account?' },
  { label: '🎬 Managing content', msg: 'How can I see the movies and series on my channels?' },
  { label: '💰 Revenue & earnings', msg: 'How does revenue sharing work and where can I see my earnings?' },
  { label: '❓ General help', msg: 'Can you give me an overview of all the features in my dashboard?' },
];

function getTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function getFirstName(name: string): string {
  return name.split(' ')[0];
}

export function ClientChatbot({ client, channels, movies, series }: ClientChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey ${getFirstName(client.name)}! 👋 Welcome to **ACDistro Pro** support!\n\nI'm your AI assistant. I can help you with:\n• 📺 Channels & content\n• 📊 Analytics & performance\n• 💰 Revenue & earnings\n• 📡 Distribution setup\n• 🔔 Notifications\n\nWhat can I help you with today?`,
      time: getTime(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      time: getTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const history = messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await getChatbotResponse(
        client.name,
        client.company,
        client.plan,
        channels.length,
        movies.length,
        series.length,
        text.trim(),
        history
      );

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: response,
        time: getTime(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: `Sorry ${getFirstName(client.name)}, I had trouble connecting. Please try again! 😅`,
        time: getTime(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (msg: string) => {
    sendMessage(msg);
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[200] w-[calc(100vw-32px)] sm:w-96 max-h-[600px] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-violet-600/80 to-indigo-600/80 border-b border-white/10 shrink-0">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">ACDistro Assistant</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-xs text-white/70">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1',
                  msg.role === 'user'
                    ? `bg-gradient-to-br ${client.color} text-white text-sm`
                    : 'bg-violet-500/20 text-violet-400'
                )}>
                  {msg.role === 'user' ? (
                    <span className="text-xs">{client.logo}</span>
                  ) : (
                    <Bot size={14} />
                  )}
                </div>

                {/* Bubble */}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                )}>
                  <div
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                  <p className={cn(
                    'text-[10px] mt-1.5',
                    msg.role === 'user' ? 'text-white/50 text-right' : 'text-slate-500'
                  )}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={14} className="text-violet-400" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 ml-1">Typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (show only at start) */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.msg)}
                  className="text-xs px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 rounded-full transition-all"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 shrink-0">
            <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-violet-500/50 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isTyping}
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl transition-all hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-4 sm:right-6 z-[200] w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center',
          isOpen
            ? 'bg-slate-700 rotate-0 shadow-none'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 shadow-violet-500/30 hover:scale-110 hover:shadow-violet-500/50'
        )}
      >
        {isOpen ? (
          <X size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-pulse">
                1
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
