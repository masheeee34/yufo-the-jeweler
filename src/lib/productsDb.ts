import fs from 'fs';
import path from 'path';
import { Product, YUFO_PRODUCTS, ProductCategory, ProductCollection } from './products';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

export function getProducts(): Product[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(YUFO_PRODUCTS, null, 2), 'utf-8');
      return YUFO_PRODUCTS;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const items: Product[] = JSON.parse(data || '[]');
    if (items.length === 0) {
      saveProducts(YUFO_PRODUCTS);
      return YUFO_PRODUCTS;
    }
    return items;
  } catch (e) {
    console.error('Error reading products DB:', e);
    return YUFO_PRODUCTS;
  }
}

export function saveProducts(items: Product[]) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving products DB:', e);
  }
}

export function addProduct(data: {
  name: string;
  price: number;
  shortDescription?: string;
  fullDescription: string;
  category: ProductCategory;
  collection?: ProductCollection;
  brand?: string;
  reference?: string;
  image?: string;
  hoverImage?: string;
  specs?: Partial<Product['specs']>;
  inStock?: boolean;
  featured?: boolean;
}): Product {
  const products = getProducts();
  const rawPrice = Number(data.price) || 0;
  const formattedPrice = `$${rawPrice.toLocaleString('en-US')}`;

  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = `${slug || 'piece'}-${Date.now().toString(36)}`;

  const ref =
    data.reference && data.reference.trim()
      ? data.reference.trim().toUpperCase()
      : `REF-YUF-${Math.floor(1000 + Math.random() * 9000)}`;

  const newProduct: Product = {
    id,
    name: data.name.trim(),
    category: data.category || 'pendants',
    collection: data.collection || 'essence',
    brand: data.brand?.trim() || 'YUFO The Jeweler',
    reference: ref,
    price: rawPrice,
    priceDisplay: formattedPrice,
    image: data.image?.trim() || '/assets/products/category_pendants.png',
    hoverImage: data.hoverImage?.trim() || data.image?.trim() || '/assets/products/category_chains.png',
    shortDescription: data.shortDescription?.trim() || `${data.name} · FiveM Stream Ready`,
    fullDescription: data.fullDescription.trim(),
    specs: {
      material: data.specs?.material || 'Solid 18K Precious Alloy',
      stones: data.specs?.stones || 'Hand-Set VVS Lab Diamond Pavé',
      compatibility: data.specs?.compatibility || 'Universal FiveM MP Male & Female Ped Skeletons',
      delivery: data.specs?.delivery || 'Instant Asset Allocation (.ydd / .ytd ready)',
    },
    inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
    featured: Boolean(data.featured),
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = products[index];
  const price = updates.price !== undefined ? Number(updates.price) : current.price;
  const priceDisplay = updates.price !== undefined ? `$${price.toLocaleString('en-US')}` : current.priceDisplay;

  const updated: Product = {
    ...current,
    ...updates,
    price,
    priceDisplay,
    specs: {
      ...current.specs,
      ...(updates.specs || {}),
    },
  };

  products[index] = updated;
  saveProducts(products);
  return updated;
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length !== products.length) {
    saveProducts(filtered);
    return true;
  }
  return false;
}
