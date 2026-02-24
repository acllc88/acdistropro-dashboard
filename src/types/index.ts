export type DistributionPlatform = 
  | 'Apple TV'
  | 'Roku'
  | 'Android TV'
  | 'Fire TV'
  | 'Samsung Tizen'
  | 'LG WebOS'
  | 'Vizio'
  | 'iOS'
  | 'Android'
  | 'Web Player';

export interface DistributionChannel {
  id: string;
  platform: DistributionPlatform;
  channelId: string;
  channelName: string;
  addedDate: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

// Alias for backward compatibility
export type RokuChannel = DistributionChannel;
export type RokuDevice = DistributionChannel;

export interface DeviceDistribution {
  mobile: number;
  desktop: number;
  smartTV: number;
  tablet: number;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  email: string;
  phone: string;
  company: string;
  plan: 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Banned';
  joinDate: string;
  channelIds: string[];
  color: string;
  password: string;
  notifications: ClientNotification[];
  revenueShare: number;
  monthlyFee: number;
  rokuChannels: RokuChannel[];
  deviceDistribution?: DeviceDistribution;
  adminActions?: AdminAction[];
  banReason?: string;
  suspendReason?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  subscribers: number;
  color: string;
  description: string;
  movieIds: string[];
  seriesIds: string[];
  clientId: string | null;
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  poster: string;
  description: string;
  language: string;
  channelId: string | null;
  views: number;
  revenue: number;
}

export interface Series {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: number;
  seasons: number;
  episodes: number;
  episodeDuration: string;
  poster: string;
  description: string;
  language: string;
  status: 'Ongoing' | 'Completed' | 'Cancelled';
  channelId: string | null;
  views: number;
  revenue: number;
}

export type ViewMode =
  | 'dashboard'
  | 'clients'
  | 'client-detail'
  | 'channels'
  | 'channel-detail'
  | 'movies'
  | 'series'
  | 'tickets'
  | 'revenue';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'admin';
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientLogo: string;
  subject: string;
  category: 'Technical' | 'Billing' | 'Content' | 'Distribution' | 'Account' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export type AppMode = 'login' | 'admin' | 'client-portal';

export interface AdminAction {
  id: string;
  type: 'ban' | 'suspend' | 'activate' | 'warning';
  reason: string;
  date: string;
  adminNote: string;
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  date: string;
  read: boolean;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
  views?: number;
  subscribers?: number;
  watchTime?: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Processing';
  method: string;
  description: string;
}

export interface ClientFinancials {
  clientId: string;
  payments: PaymentRecord[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface AdminNotification {
  id: string;
  clientId: string;
  clientName: string;
  clientLogo: string;
  title: string;
  message: string;
  type: 'client_login' | 'distribution_add' | 'distribution_remove' | 'password_reset' | 'client_action';
  date: string;
  read: boolean;
}
