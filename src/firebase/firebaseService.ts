import {
  collection, doc, setDoc, getDoc,
  onSnapshot, updateDoc, deleteDoc,
  query, orderBy, writeBatch, serverTimestamp,
  Unsubscribe, DocumentData
} from 'firebase/firestore';
import { db } from './config';
import {
  Client, Channel, Movie, Series, ClientFinancials,
  AdminNotification, ClientNotification
} from '../types';
import { initialClients, initialChannels, initialMovies, initialSeries, initialFinancials } from '../data/initialData';

// ─── Collection names ───────────────────────────────────────────────
const COLLECTIONS = {
  clients: 'clients',
  channels: 'channels',
  movies: 'movies',
  series: 'series',
  financials: 'financials',
  adminNotifications: 'adminNotifications',
  meta: 'meta',
};

// ─── Seed initial data if Firestore is empty ────────────────────────
export async function seedIfEmpty(): Promise<void> {
  try {
    const metaRef = doc(db, COLLECTIONS.meta, 'seeded');
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) return; // Already seeded

    console.log('[ACDistro] Seeding Firestore with initial data...');
    const batch = writeBatch(db);

    // Seed clients
    for (const client of initialClients) {
      batch.set(doc(db, COLLECTIONS.clients, client.id), client);
    }

    // Seed channels
    for (const channel of initialChannels) {
      batch.set(doc(db, COLLECTIONS.channels, channel.id), channel);
    }

    // Seed movies
    for (const movie of initialMovies) {
      batch.set(doc(db, COLLECTIONS.movies, movie.id), movie);
    }

    // Seed series
    for (const s of initialSeries) {
      batch.set(doc(db, COLLECTIONS.series, s.id), s);
    }

    // Seed financials
    for (const [clientId, fin] of Object.entries(initialFinancials)) {
      batch.set(doc(db, COLLECTIONS.financials, clientId), fin);
    }

    // Mark as seeded
    batch.set(metaRef, { seededAt: serverTimestamp() });

    await batch.commit();
    console.log('[ACDistro] Firestore seeded successfully!');
  } catch (error) {
    console.error('[ACDistro] Seed error:', error);
  }
}

// ─── Generic helpers ─────────────────────────────────────────────────
function stripUndefined(obj: DocumentData): DocumentData {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Real-time listeners ─────────────────────────────────────────────

export function subscribeToClients(cb: (clients: Client[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.clients), snap => {
    const clients = snap.docs.map(d => ({ ...d.data() } as Client));
    cb(clients);
  }, err => console.error('clients listener error:', err));
}

export function subscribeToChannels(cb: (channels: Channel[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.channels), snap => {
    const channels = snap.docs.map(d => ({ ...d.data() } as Channel));
    cb(channels);
  }, err => console.error('channels listener error:', err));
}

export function subscribeToMovies(cb: (movies: Movie[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.movies), snap => {
    const movies = snap.docs.map(d => ({ ...d.data() } as Movie));
    cb(movies);
  }, err => console.error('movies listener error:', err));
}

export function subscribeToSeries(cb: (series: Series[]) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.series), snap => {
    const series = snap.docs.map(d => ({ ...d.data() } as Series));
    cb(series);
  }, err => console.error('series listener error:', err));
}

export function subscribeToFinancials(cb: (financials: Record<string, ClientFinancials>) => void): Unsubscribe {
  return onSnapshot(collection(db, COLLECTIONS.financials), snap => {
    const fin: Record<string, ClientFinancials> = {};
    snap.docs.forEach(d => { fin[d.id] = d.data() as ClientFinancials; });
    cb(fin);
  }, err => console.error('financials listener error:', err));
}

export function subscribeToAdminNotifications(cb: (notifs: AdminNotification[]) => void): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.adminNotifications), orderBy('date', 'desc'));
  return onSnapshot(q, snap => {
    const notifs = snap.docs.map(d => ({ ...d.data() } as AdminNotification));
    cb(notifs);
  }, err => console.error('adminNotifications listener error:', err));
}

// ─── Client CRUD ─────────────────────────────────────────────────────

export async function saveClient(client: Client): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.clients, client.id), stripUndefined(client));
}

export async function updateClient(clientId: string, data: Partial<Client>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.clients, clientId), stripUndefined(data as DocumentData));
}

export async function deleteClient(clientId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.clients, clientId));
}

// ─── Channel CRUD ─────────────────────────────────────────────────────

export async function saveChannel(channel: Channel): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.channels, channel.id), stripUndefined(channel));
}

export async function updateChannel(channelId: string, data: Partial<Channel>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.channels, channelId), stripUndefined(data as DocumentData));
}

export async function deleteChannel(channelId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.channels, channelId));
}

// ─── Movie CRUD ───────────────────────────────────────────────────────

export async function saveMovie(movie: Movie): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.movies, movie.id), stripUndefined(movie));
}

export async function updateMovie(movieId: string, data: Partial<Movie>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.movies, movieId), stripUndefined(data as DocumentData));
}

export async function deleteMovie(movieId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.movies, movieId));
}

// ─── Series CRUD ──────────────────────────────────────────────────────

export async function saveSeries(series: Series): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.series, series.id), stripUndefined(series));
}

export async function updateSeries(seriesId: string, data: Partial<Series>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.series, seriesId), stripUndefined(data as DocumentData));
}

export async function deleteSeries(seriesId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.series, seriesId));
}

// ─── Financials ───────────────────────────────────────────────────────

export async function saveFinancials(clientId: string, fin: ClientFinancials): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.financials, clientId), stripUndefined(fin as unknown as DocumentData));
}

// ─── Admin Notifications ──────────────────────────────────────────────

export async function addAdminNotification(notif: AdminNotification): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.adminNotifications, notif.id), stripUndefined(notif as unknown as DocumentData));
}

export async function markAdminNotifRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.adminNotifications, notifId), { read: true });
}

export async function markAllAdminNotifsRead(notifs: AdminNotification[]): Promise<void> {
  const batch = writeBatch(db);
  notifs.filter(n => !n.read).forEach(n => {
    batch.update(doc(db, COLLECTIONS.adminNotifications, n.id), { read: true });
  });
  await batch.commit();
}

export async function clearAllAdminNotifs(notifs: AdminNotification[]): Promise<void> {
  const batch = writeBatch(db);
  notifs.forEach(n => {
    batch.delete(doc(db, COLLECTIONS.adminNotifications, n.id));
  });
  await batch.commit();
}

// ─── Bulk update helpers ──────────────────────────────────────────────

export async function updateClientNotifications(clientId: string, notifications: ClientNotification[]): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.clients, clientId), { notifications: stripUndefined(notifications as unknown as DocumentData) });
}
