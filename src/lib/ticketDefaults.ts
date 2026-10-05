// Réglages des tickets partagés entre le serveur et les pages (aucune dépendance au disque).

export const STATUS_TONES = ['zinc', 'sky', 'blue', 'violet', 'amber', 'emerald', 'rose'] as const;
export type StatusTone = (typeof STATUS_TONES)[number];

export interface TicketStatus {
  id: string;
  label: string;
  tone: StatusTone;
  important: boolean; // les membres sont prévenus quand le ticket passe à ce statut
}

export interface TicketPermissions {
  replies: boolean; // les clients peuvent écrire
  images: boolean; // envoi d'images
  files: boolean; // envoi de fichiers
  downloads: boolean; // téléchargement des fichiers par les clients
  membersCanReply: boolean; // les membres ajoutés (hors client) peuvent écrire
}

export const PERMISSION_LABELS: Record<keyof TicketPermissions, string> = {
  replies: 'Allow replies',
  images: 'Allow images',
  files: 'Allow files',
  downloads: 'Allow downloads',
  membersCanReply: 'Added members can reply',
};

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export const PRIORITIES: { id: TicketPriority; label: string }[] = [
  { id: 'low', label: 'Low' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
];

export const BUILTIN_SOUNDS: { id: string; label: string; url: string }[] = [
  { id: 'chime', label: 'Chime', url: '/sounds/chime.wav' },
  { id: 'pop', label: 'Pop', url: '/sounds/pop.wav' },
  { id: 'bell', label: 'Bell', url: '/sounds/bell.wav' },
];

export interface TicketSettings {
  statuses: TicketStatus[];
  defaultStatus: string;
  defaultPerms: TicketPermissions;
  sound: string; // adresse du son joué à chaque nouveau message (vide = aucun son)
  soundVolume: number; // 0 à 1
  maxFileMb: number;
}

export const DEFAULT_TICKETS: TicketSettings = {
  statuses: [
    { id: 'new', label: 'New', tone: 'sky', important: false },
    { id: 'reviewing', label: 'Reviewing', tone: 'violet', important: true },
    { id: 'in_progress', label: 'In progress', tone: 'blue', important: true },
    { id: 'waiting_client', label: 'Waiting for client', tone: 'amber', important: true },
    { id: 'paused', label: 'Paused', tone: 'zinc', important: true },
    { id: 'finalizing', label: 'Finalizing', tone: 'emerald', important: true },
    { id: 'completed', label: 'Completed', tone: 'emerald', important: true },
  ],
  defaultStatus: 'new',
  defaultPerms: { replies: true, images: true, files: true, downloads: true, membersCanReply: true },
  sound: '/sounds/chime.wav',
  soundVolume: 0.6,
  maxFileMb: 25,
};

// Extensions de fichiers acceptées dans un ticket (en plus des images).
export const TICKET_FILE_EXT = ['zip', 'rar', '7z', 'pdf', 'txt', 'ydd', 'ytd', 'yft', 'ymt', 'ybn', 'fbx', 'obj', 'blend', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'mov'];

export const TONE_CLASSES: Record<StatusTone, string> = {
  zinc: 'bg-zinc-500/15 text-zinc-300 ring-zinc-400/20',
  sky: 'bg-sky-500/15 text-sky-300 ring-sky-400/20',
  blue: 'bg-blue-500/15 text-blue-300 ring-blue-400/20',
  violet: 'bg-violet-500/15 text-violet-300 ring-violet-400/20',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
};
