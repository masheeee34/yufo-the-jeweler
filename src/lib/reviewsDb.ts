import fs from 'fs';
import path from 'path';

export interface ReviewItem {
  id: string;
  pseudo: string;
  date: string;
  message: string;
  rating: number; // 1 à 5
  isVerified: boolean;
  createdAt: string;
  source?: 'verified' | 'imported' | 'manual'; // achat vérifié, avis importé, ajouté à la main
  hidden?: boolean;
  featured?: boolean;
  productId?: string;
  orderId?: string;
  reply?: { text: string; by: string; at: string };
  deletedAt?: string; // corbeille
  updatedAt?: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'reviews.json');

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev_1',
    pseudo: 'Ghost_RP',
    date: 'Il y a 2 jours',
    message: 'Qualite des streams .ydd et .ytd incroyable. Le pendentif brille parfaitement sous les lumieres de la ville sans aucune baisse de FPS.',
    rating: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev_2',
    pseudo: 'Kevz#0001',
    date: 'Il y a 4 jours',
    message: 'Commande custom livree tres vite. Le rigging sur ped male et female est parfait, aucun clipping avec les vestes ou gilets.',
    rating: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev_3',
    pseudo: 'Brahim_LS',
    date: '18 Septembre 2026',
    message: 'Service client reactif sur Discord, reponse directe et le rendu diamant de la chaine Cuban link depasse toutes les attentes.',
    rating: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev_4',
    pseudo: 'Yanis.dev',
    date: '14 Septembre 2026',
    message: 'Le meilleur atelier de joaillerie 3D pour FiveM. Les specular maps et normales sont ultra propres, integration facile dans le stream.',
    rating: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'rev_5',
    pseudo: 'Montana_V',
    date: '8 Septembre 2026',
    message: 'Notre logo de faction reproduit a la perfection en medaillon. Tous les joueurs du serveur nous demandent d ou vient la piece.',
    rating: 5,
    isVerified: true,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
  },
];

export function getReviews(): ReviewItem[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_REVIEWS, null, 2), 'utf-8');
      return DEFAULT_REVIEWS;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const items: ReviewItem[] = JSON.parse(data || '[]');
    if (items.length === 0) {
      saveReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    return items;
  } catch (e) {
    console.error('Error reading reviews DB:', e);
    return DEFAULT_REVIEWS;
  }
}

export function saveReviews(items: ReviewItem[]) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving reviews DB:', e);
  }
}

export function addReview(data: {
  pseudo: string;
  date?: string;
  message: string;
  rating?: number;
  isVerified?: boolean;
}): ReviewItem {
  const reviews = getReviews();
  const now = new Date();
  
  const newReview: ReviewItem = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    pseudo: data.pseudo.trim(),
    date: data.date?.trim() || 'Aujourd hui',
    message: data.message.trim(),
    rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
    isVerified: data.isVerified !== undefined ? Boolean(data.isVerified) : true,
    createdAt: now.toISOString(),
  };

  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

export function deleteReview(id: string): boolean {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length !== reviews.length) {
    saveReviews(filtered);
    return true;
  }
  return false;
}

export function updateReview(id: string, updates: Partial<ReviewItem>): ReviewItem | null {
  const reviews = getReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = reviews[index];
  const updated: ReviewItem = {
    ...current,
    ...updates,
    rating: updates.rating !== undefined ? Math.min(5, Math.max(1, Number(updates.rating))) : current.rating,
  };

  reviews[index] = updated;
  saveReviews(reviews);
  return updated;
}
