export interface WatchProduct {
  id: string;
  brand: string;
  name: string;
  subtitle: string;
  reference: string;
  caseSize: string;
  material: string;
  dial: string;
  bracelet: string;
  condition: string;
  year?: string;
  image: string;
  status: 'In Vault' | 'Available';
}

export interface EssentialCategory {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  href: string;
}

export const WATCH_VAULT: WatchProduct[] = [
  {
    id: 'rolex-datejust-41',
    brand: 'Rolex',
    name: 'Datejust 41 Iced',
    subtitle: 'Fluted Bezel · Jubilee Bracelet',
    reference: '126334',
    caseSize: '41 mm',
    material: '18K White Gold & VVS Diamonds',
    dial: 'Bright Blue Sunray',
    bracelet: 'Jubilee Five-Piece Links',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/rolex_datejust_41.png',
    status: 'Available',
  },
  {
    id: 'rolex-daydate-40-everose',
    brand: 'Rolex',
    name: 'Day-Date 40 President',
    subtitle: 'President · Olive Green Dial',
    reference: '228235',
    caseSize: '40 mm',
    material: '18K Everose Gold',
    dial: 'Olive Green with Roman Numerals',
    bracelet: 'President Semicircular Links',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/rolex_daydate_everose.png',
    status: 'Available',
  },
  {
    id: 'rolex-daydate-40-yellow',
    brand: 'Rolex',
    name: 'Day-Date 40 Bustdown',
    subtitle: 'President · Baguette Diamond Dial',
    reference: '228238',
    caseSize: '40 mm',
    material: '18K Yellow Gold',
    dial: 'Full Baguette Diamond Pavé',
    bracelet: 'President Bracelet',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/rolex_daydate_yellow.png',
    status: 'Available',
  },
  {
    id: 'rolex-gmt-bruce-wayne',
    brand: 'Rolex',
    name: 'GMT-Master II "Bruce Wayne"',
    subtitle: 'Cerachrom Black & Grey · Jubilee',
    reference: '126710GRNR',
    caseSize: '40 mm',
    material: 'Oystersteel',
    dial: 'Gloss Black with Green GMT Hand',
    bracelet: 'Jubilee Bracelet',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/rolex_gmt_bruce_wayne.png',
    status: 'Available',
  },
  {
    id: 'ap-royal-oak-15510or',
    brand: 'Audemars Piguet',
    name: 'Royal Oak Selfwinding',
    subtitle: '18K Pink Gold · "Grande Tapisserie"',
    reference: '15510OR',
    caseSize: '41 mm',
    material: '18K Pink Gold',
    dial: 'Black "Grande Tapisserie"',
    bracelet: 'Pink Gold Integrated Bracelet',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/ap_royal_oak_rosegold.png',
    status: 'Available',
  },
  {
    id: 'ap-royal-oak-chrono-26240st',
    brand: 'Audemars Piguet',
    name: 'Royal Oak Chronograph',
    subtitle: 'Stainless Steel · Bleu Nuit Nuage 50',
    reference: '26240ST',
    caseSize: '41 mm',
    material: 'Stainless Steel',
    dial: 'Bleu Nuit Nuage 50 with Tapisserie',
    bracelet: 'Integrated Steel Bracelet',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/ap_royal_oak_chrono.png',
    status: 'Available',
  },
  {
    id: 'patek-nautilus-5980',
    brand: 'Patek Philippe',
    name: 'Nautilus Flyback Chronograph',
    subtitle: '18K Rose Gold · Monocounter Subdial',
    reference: '5980/1R',
    caseSize: '40.5 mm',
    material: '18K Rose Gold',
    dial: 'Black Gradated Brown Embossed',
    bracelet: 'Rose Gold Nautilus Bracelet',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/patek_nautilus_5980.png',
    status: 'Available',
  },
  {
    id: 'patek-aquanaut-5167a',
    brand: 'Patek Philippe',
    name: 'Aquanaut Extra Flat',
    subtitle: 'Stainless Steel · Tropical Composite Strap',
    reference: '5167A',
    caseSize: '40.8 mm',
    material: 'Stainless Steel',
    dial: 'Black Embossed with White Gold Numerals',
    bracelet: 'Black Tropical Rubber Strap',
    condition: 'Custom 3D Rigged',
    image: '/assets/products/patek_aquanaut_5167a.png',
    status: 'Available',
  },
];

export const ESSENTIALS_CATEGORIES: EssentialCategory[] = [
  {
    id: 'chains',
    name: 'CHAINS',
    subtitle: 'Solid gold diamond tennis, miami cuban & baguette collars',
    image: '/assets/products/category_chains.png',
    href: '#chains',
  },
  {
    id: 'pendants',
    name: 'PENDANTS',
    subtitle: 'Custom crew emblems, diamond medallions & 3D monogram pieces',
    image: '/assets/products/category_pendants.png',
    href: '#pendants',
  },
  {
    id: 'rings',
    name: 'RINGS',
    subtitle: 'Full eternity bands, structural signet rings & modern pavé',
    image: '/assets/products/category_rings.png',
    href: '#rings',
  },
  {
    id: 'studs',
    name: 'STUDS & GRILLZ',
    subtitle: 'Custom diamond grillz and brilliant solitaire ear studs',
    image: '/assets/products/category_studs.png',
    href: '#studs',
  },
];

export const YUFO_BRAND = {
  name: 'YUFO THE JEWELRY',
  tagline: 'Private Watch & Jewelry Deals · 3D Atelier',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '',
  discord: 'https://discord.gg/yufo',
  email: 'contact@yufothejewelry.com',
};
