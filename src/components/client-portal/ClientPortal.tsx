import { Client, Channel, Movie, Series, ClientFinancials, SupportTicket } from '../../types';
import { ClientPortalDashboard } from './ClientPortalDashboard';
import { DistributionPlatform } from '../../types';

interface ClientPortalProps {
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

export function ClientPortal({
  client, channels, movies, series, financials, tickets,
  onExitPortal, onMarkNotificationRead, onMarkAllRead,
  onAddRokuChannel, onRemoveRokuChannel,
  onCreateTicket, onReplyTicket, onSavePayPal
}: ClientPortalProps) {
  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Client not found</p>
          <button onClick={onExitPortal} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <ClientPortalDashboard
      client={client}
      channels={channels}
      movies={movies}
      series={series}
      financials={financials}
      tickets={tickets}
      onExitPortal={onExitPortal}
      onMarkNotificationRead={onMarkNotificationRead}
      onMarkAllRead={onMarkAllRead}
      onAddRokuChannel={onAddRokuChannel}
      onRemoveRokuChannel={onRemoveRokuChannel}
      onCreateTicket={onCreateTicket}
      onReplyTicket={onReplyTicket}
      onSavePayPal={onSavePayPal}
    />
  );
}
