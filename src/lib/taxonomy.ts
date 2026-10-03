import { readJson, writeJson } from './jsonStore';
import { CATEGORIES_NAV, COLLECTIONS_NAV } from './products';

// Catégories (type de bijou) et collections (drops, thèmes, collabs) gérées depuis le back-office.
export interface TaxonomyItem {
  id: string;
  label: string;
  description?: string;
  visible: boolean;
  order: number;
  deletedAt?: string;
}

export interface Taxonomy {
  categories: TaxonomyItem[];
  collections: TaxonomyItem[];
}

function defaults(): Taxonomy {
  return {
    categories: CATEGORIES_NAV.filter((c) => c.id !== 'all').map((c, i) => ({ id: c.id, label: c.label, visible: true, order: i })),
    collections: COLLECTIONS_NAV.filter((c) => c.id !== 'all').map((c, i) => ({ id: c.id, label: c.label, description: c.desc, visible: true, order: i })),
  };
}

export function getTaxonomy(): Taxonomy {
  const saved = readJson<Taxonomy | null>('taxonomy.json', null);
  return saved || defaults();
}

export function saveTaxonomy(t: Taxonomy) {
  writeJson('taxonomy.json', t);
}

export function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

// Version publique : uniquement ce qui est visible, dans l'ordre choisi.
export function publicTaxonomy(): Taxonomy {
  const t = getTaxonomy();
  const pub = (list: TaxonomyItem[]) => list.filter((i) => i.visible && !i.deletedAt).sort((a, b) => a.order - b.order);
  return { categories: pub(t.categories), collections: pub(t.collections) };
}
