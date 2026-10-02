import fs from 'fs';
import path from 'path';

export interface ChatMessage {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  createdAt: string;
  attachments?: string[];
}

export interface ClientRequest {
  id: string;
  pseudo: string;
  discordId?: string;
  discordChannelId?: string;
  discordThreadId?: string;
  discordMessageId?: string;
  subject: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'answered' | 'closed';
  messages: ChatMessage[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'requests.json');

export function getRequests(): ClientRequest[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const items: ClientRequest[] = JSON.parse(data || '[]');
    const now = new Date().getTime();

    // Auto-prune 72 hours expiration
    const active = items.filter((item) => new Date(item.expiresAt).getTime() > now);
    if (active.length !== items.length) {
      saveRequests(active);
    }
    return active;
  } catch (e) {
    console.error('Error reading requests DB:', e);
    return [];
  }
}

export function saveRequests(items: ClientRequest[]) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving requests DB:', e);
  }
}
