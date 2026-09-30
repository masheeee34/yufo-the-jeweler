/**
 * YUFO THE JEWELRY - CATALOG & PRODUCT DEFINITIONS
 * Handcrafted 3D Jewelry & Haute Horlogerie rigged for FiveM ped skeletons.
 */

export type ProductCategory = 'all' | 'watches' | 'chains' | 'pendants' | 'rings' | 'studs';
export type ProductCollection = 'all' | 'cathedral-of-dreams' | 'neo' | 'the-saint-mark' | 'essence';

export interface ProductSpec {
  material: string;
  stones: string;
  compatibility: string;
  delivery: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  collection?: ProductCollection;
  brand: string;
  reference: string;
  price: number;
  priceDisplay: string;
  image: string;
  hoverImage?: string;
  shortDescription: string;
  fullDescription: string;
  specs: ProductSpec;
  inStock: boolean;
  featured?: boolean;
}

export const CATEGORIES_NAV: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Pieces' },
  { id: 'watches', label: 'Timepieces' },
  { id: 'chains', label: 'Chains & Necklaces' },
  { id: 'pendants', label: 'Pendants & Medallions' },
  { id: 'rings', label: 'Rings & Bands' },
  { id: 'studs', label: 'Grillz & Studs' },
];

export const COLLECTIONS_NAV: { id: ProductCollection; label: string; desc: string }[] = [
  { id: 'all', label: 'Shop All', desc: 'Every piece sculpted in our SoHo & Los Santos atelier.' },
  { id: 'cathedral-of-dreams', label: 'Cathedral of Dreams', desc: 'Sacred crosses, high-relief icons, and intricate pavé halos.' },
  { id: 'neo', label: 'NEO', desc: 'Hyper-contemporary step-cut baguettes and kinetic rotating medallions.' },
  { id: 'the-saint-mark', label: 'The Saint Mark', desc: 'Signature heavy curb links, collar chokers, and solid gold weight.' },
  { id: 'essence', label: 'Essence', desc: 'Flawless round diamond tennis rows and timeless signet bands.' },
];

export const YUFO_PRODUCTS: Product[] = [
  // ==========================================
  // 1. WATCHES / TIMEPIECES (HAUTE HORLOGERIE)
  // ==========================================
  {
    id: 'rolex-datejust-41-mint',
    name: 'Rolex Datejust 41 Mint Green Dial',
    category: 'watches',
    collection: 'essence',
    brand: 'Rolex Geneve',
    reference: 'REF-DJ41-MG',
    price: 950,
    priceDisplay: '$950',
    image: '/assets/products/rolex_datejust_41.png',
    hoverImage: '/assets/products/rolex_gmt_bruce_wayne.png',
    shortDescription: 'Oystersteel & White Gold · Fluted Bezel · Jubilee Bracelet · Mint Sunburst Dial',
    fullDescription: 'The reference of timeless elegance. Featuring an ultra-precise 3D sculptured fluted bezel, custom reflections, and rigged to the male and female left hand wrist bone without vertex tearing.',
    specs: {
      material: 'Oystersteel & 18K White Gold Bezel',
      stones: 'Factory Sunburst Dial with Chromalight Lume',
      compatibility: 'Male & Female MP Skeletons (Left Hand Bone 60309)',
      delivery: 'Instant Streaming Asset (.ydr/.ytd ready)',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'rolex-daydate-40-everose',
    name: 'Rolex Day-Date 40 Everose Gold & Olive',
    category: 'watches',
    collection: 'cathedral-of-dreams',
    brand: 'Rolex Geneve',
    reference: 'REF-DD40-EVO',
    price: 1100,
    priceDisplay: '$1,100',
    image: '/assets/products/rolex_daydate_everose.png',
    hoverImage: '/assets/products/rolex_daydate_yellow.png',
    shortDescription: '18K Everose Gold · President Bracelet · Roman Numerals · Olive Green Dial',
    fullDescription: 'The ultimate watch of prestige. Full 18K Everose gold case with the iconic semi-circular three-piece links President bracelet. Specular maps reflect Los Santos sunlight and neon reflections.',
    specs: {
      material: 'Solid 18K Everose Gold Alloy',
      stones: 'Faceted Rose Gold Roman Numerals',
      compatibility: 'Universal FiveM Left Wrist Bone Alignment',
      delivery: 'Ready-to-stream FiveM Resource Folder',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'rolex-daydate-40-bustdown',
    name: 'Rolex Day-Date 40 Full Diamond Bustdown',
    category: 'watches',
    collection: 'cathedral-of-dreams',
    brand: 'Rolex Custom Atelier',
    reference: 'REF-DD40-ICE',
    price: 1850,
    priceDisplay: '$1,850',
    image: '/assets/products/rolex_daydate_yellow.png',
    hoverImage: '/assets/products/rolex_daydate_everose.png',
    shortDescription: 'Honeycomb Pavé Setting · Baguette Bezel · Fully Iced Bracelet & Case',
    fullDescription: 'Hand-set honeycomb diamond pavé throughout the case, lugs, bezel and President bracelet. Configured with realistic GTA V glass shaders and sparkle normal maps.',
    specs: {
      material: '18K Yellow Gold with Full Diamond Pavé',
      stones: 'Over 2,400 Hand-Set Pavé Stones + 40 Baguettes',
      compatibility: 'No clipping during driving, walking, or aiming animations',
      delivery: 'Instant Asset Download + Discord VIP Role',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'rolex-gmt-bruce-wayne',
    name: 'Rolex GMT-Master II "Bruce Wayne"',
    category: 'watches',
    collection: 'neo',
    brand: 'Rolex Geneve',
    reference: 'REF-GMT-BW',
    price: 1050,
    priceDisplay: '$1,050',
    image: '/assets/products/rolex_gmt_bruce_wayne.png',
    hoverImage: '/assets/products/rolex_datejust_41.png',
    shortDescription: 'Oystersteel · Grey & Black Cerachrom Bezel · Jubilee Bracelet',
    fullDescription: 'The elusive 2024 release. Grey and black bidirectional rotating 24-hour bezel in ceramic with green GMT arrow hand. Optimized polycount for zero client FPS drop.',
    specs: {
      material: 'Oystersteel 904L & Bi-Color Cerachrom',
      stones: 'Sapphire Crystal with Cyclops Lens Shader',
      compatibility: 'FiveM Freemode MP Male & Female',
      delivery: 'Direct Download (.ydr + .ytd + meta files)',
    },
    inStock: true,
  },
  {
    id: 'ap-royal-oak-pink-gold',
    name: 'Audemars Piguet Royal Oak Selfwinding',
    category: 'watches',
    collection: 'the-saint-mark',
    brand: 'Audemars Piguet',
    reference: 'REF-AP-RO15500',
    price: 1300,
    priceDisplay: '$1,300',
    image: '/assets/products/ap_royal_oak_rosegold.png',
    hoverImage: '/assets/products/ap_royal_oak_chrono.png',
    shortDescription: '18K Pink Gold · Grande Tapisserie Dial · Integrated Bracelet',
    fullDescription: 'The defining luxury sports watch. Octagonal bezel with eight hexagonal white gold screws and hand-finished satin-brushed chamfers that catch dynamic city lighting.',
    specs: {
      material: '18K Pink Gold Satin-Brushed & Polished',
      stones: 'Pink Gold Applied Hour-Markers & Royal Oak Hands',
      compatibility: 'Left Hand Bone 60309 (Universal Rig)',
      delivery: 'Instant Stream-Ready FiveM Resource Pack',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'ap-royal-oak-chrono',
    name: 'Audemars Piguet Royal Oak Chronograph Iced',
    category: 'watches',
    collection: 'cathedral-of-dreams',
    brand: 'Audemars Piguet Custom',
    reference: 'REF-AP-ROC-ICE',
    price: 1950,
    priceDisplay: '$1,950',
    image: '/assets/products/ap_royal_oak_chrono.png',
    hoverImage: '/assets/products/ap_royal_oak_rosegold.png',
    shortDescription: 'Full Pavé Case & Dial · Baguette Cut Diamond Bezel · Integrated Iced Links',
    fullDescription: 'Masterpiece of haute joaillerie horology. Channel-set baguette diamonds on the octagonal bezel paired with micro-pavé dial subdials.',
    specs: {
      material: 'Stainless Steel Case Set with VVS Cut Stones',
      stones: 'Baguette Cut Bezel + Brilliant Cut Case Pavé',
      compatibility: 'Weighted & Vertex Painted for Zero Deformation',
      delivery: 'YDR + YTD + Installation Documentation',
    },
    inStock: true,
  },
  {
    id: 'patek-nautilus-5980',
    name: 'Patek Philippe Nautilus Chronograph 5980',
    category: 'watches',
    collection: 'the-saint-mark',
    brand: 'Patek Philippe Geneve',
    reference: 'REF-PP-5980R',
    price: 1450,
    priceDisplay: '$1,450',
    image: '/assets/products/patek_nautilus_5980.png',
    hoverImage: '/assets/products/patek_aquanaut_5167a.png',
    shortDescription: 'Rose Gold · Horizontally Embossed Brown Dial · Monocounter Chronograph',
    fullDescription: 'The epitome of refined opulence. Patek Philippe rounded octagonal bezel with lateral case hinges, finished with horizontal dial grooves and high-reflection sapphire shader.',
    specs: {
      material: '18K Rose Gold with Brushed & Mirror Polishing',
      stones: 'Luminescent Coated Gold Applied Hour Markers',
      compatibility: 'Tested across 15+ custom ped clothing jackets & cuffs',
      delivery: 'Direct Download Link + Discord Support',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'patek-aquanaut-5167a',
    name: 'Patek Philippe Aquanaut 5167A',
    category: 'watches',
    collection: 'neo',
    brand: 'Patek Philippe Geneve',
    reference: 'REF-PP-5167A',
    price: 850,
    priceDisplay: '$850',
    image: '/assets/products/patek_aquanaut_5167a.png',
    hoverImage: '/assets/products/patek_nautilus_5980.png',
    shortDescription: 'Stainless Steel · Tropical Composite Strap · Embossed Black Dial',
    fullDescription: 'Contemporary, sporty, and ultra-rare. Distinctive rounded octagonal case mounted on a waterproof composite strap, optimized for tactical, casual, or black-tie character outfits.',
    specs: {
      material: 'Stainless Steel with Ultra-Resistant Composite Strap',
      stones: 'Gold Applied Numerals with Luminescent Coating',
      compatibility: 'FiveM Male & Female mp_m_freemode_01',
      delivery: 'FiveM Stream Files Ready to Deploy',
    },
    inStock: true,
  },

  // ==========================================
  // 2. CHAINS & NECKLACES
  // ==========================================
  {
    id: 'chain-diamond-tennis-5mm',
    name: 'Solid Gold Diamond Tennis Chain 5mm',
    category: 'chains',
    collection: 'essence',
    brand: 'Yufo Atelier',
    reference: 'YUF-CHN-01',
    price: 800,
    priceDisplay: '$800',
    image: '/assets/products/category_chains.png',
    hoverImage: '/assets/products/filly_necklace_bust.png',
    shortDescription: '18K Yellow Gold · 5mm Round Brilliant Diamonds · 4-Prong Setting',
    fullDescription: 'Continuous row of brilliant round stones individually set in 4-prong solid gold collets. Fully dynamic spine physics rigged for running and driving without clipping.',
    specs: {
      material: '18K Yellow Gold / 18K White Gold Options',
      stones: 'Full Specular Brilliant Cut Stones',
      compatibility: 'Spine2 & Neck Rigged (Zero Clipping)',
      delivery: 'Instant Streaming Asset (.ydr/.ytd)',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'chain-miami-cuban-14mm',
    name: 'Miami Cuban Link Diamond Choker 14mm',
    category: 'chains',
    collection: 'the-saint-mark',
    brand: 'Yufo Atelier',
    reference: 'YUF-CHN-02',
    price: 1100,
    priceDisplay: '$1,100',
    image: '/assets/products/category_chains.png',
    hoverImage: '/assets/products/filly_necklace_bust.png',
    shortDescription: '14mm Heavy Gauge Cuban Links · Micro-Pavé Triple Row Ice',
    fullDescription: 'Heavyweight street luxury. Triple-row micro-pavé ice on every interlocked Cuban curb link, featuring a double safety box clasp with custom Yufo hallmark.',
    specs: {
      material: 'Solid 18K Yellow / White Gold',
      stones: 'VVS Micro-Pavé Setting',
      compatibility: 'Weighted to Upper Torso & Collarbones',
      delivery: 'Stream-Ready Resource + Server Config',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'chain-baguette-eternity',
    name: 'Baguette Cut Diamond Collar Chain',
    category: 'chains',
    collection: 'neo',
    brand: 'Yufo Atelier',
    reference: 'YUF-CHN-03',
    price: 1250,
    priceDisplay: '$1,250',
    image: '/assets/products/category_chains.png',
    hoverImage: '/assets/products/filly_necklace_bust.png',
    shortDescription: 'Invisible Set Step-Cut Baguettes · Mirror Reflection Finish',
    fullDescription: 'Art Deco geometric precision. Channel-set baguette stones creating an uninterrupted ribbon of light around the neckline.',
    specs: {
      material: '18K White Gold Rhodium Coated',
      stones: 'Step-Cut Baguette Stones',
      compatibility: 'FiveM MP Skeletons (Male & Female)',
      delivery: 'Direct Download + Discord Concierge',
    },
    inStock: true,
  },

  // ==========================================
  // 3. PENDANTS & MEDALLIONS
  // ==========================================
  {
    id: 'pendant-sovereign-medallion',
    name: 'The Sovereign Medallion 1-of-1',
    category: 'pendants',
    collection: 'cathedral-of-dreams',
    brand: 'Yufo Atelier',
    reference: 'YUF-SVR-01',
    price: 1600,
    priceDisplay: '$1,600',
    image: '/assets/media/campaign_solo_medallion.jpg',
    hoverImage: '/assets/media/campaign_portrait_medallion.jpg',
    shortDescription: 'Sunburst Diamond Halo · 18K Yellow Gold Relief · Rope Bail',
    fullDescription: 'As seen in the 2026 High Jewelry Campaign. A heavy ceremonial disc with intricate multi-tiered pavé halo and sovereign micro-sculpture.',
    specs: {
      material: '18K Solid Yellow Gold',
      stones: 'Double Row Brilliant Pavé Halo',
      compatibility: 'Rigged to Gold Rope Chain & Spine Bone',
      delivery: '1-of-1 Exclusivity Rights on Your Server',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'pendant-memory-photo-medallion',
    name: 'Custom Memory Photo Medallion & Rope',
    category: 'pendants',
    collection: 'cathedral-of-dreams',
    brand: 'Yufo Atelier',
    reference: 'YUF-MEM-02',
    price: 1400,
    priceDisplay: '$1,400',
    image: '/assets/media/campaign_portrait_medallion.jpg',
    hoverImage: '/assets/media/campaign_solo_medallion.jpg',
    shortDescription: 'Custom High-Res Portrait Frame · Baguette Border · Heavy Gold Rope',
    fullDescription: 'Immortalize your crew leader, portrait, or logo inside an iced-out medallion with glass protective lens shader and baguette perimeter.',
    specs: {
      material: '18K Gold Plated Brass or Solid Gold',
      stones: 'Prong-Set Baguettes & Round Cut Pavé',
      compatibility: 'Texture Swappable (.ytd file included)',
      delivery: 'Custom Texture Baking by Yufo within 24h',
    },
    inStock: true,
    featured: true,
  },
  {
    id: 'pendant-syndicate-spinning',
    name: 'Yufo Syndicate Spinning Iced Pendant',
    category: 'pendants',
    collection: 'neo',
    brand: 'Yufo Atelier',
    reference: 'YUF-SYN-03',
    price: 1800,
    priceDisplay: '$1,800',
    image: '/assets/products/filly_necklace_bust.png',
    hoverImage: '/assets/products/category_pendants.png',
    shortDescription: 'Fully Rotational Center Disc · Crew Monogram · Iced Bail',
    fullDescription: 'Kinetic 3D jewelry. Features dual-axis spinning bearing rigged to react dynamically to in-game motion and physical momentum.',
    specs: {
      material: '18K White Gold & Solid Platinum Core',
      stones: 'Full Baguette & Brilliant Pavé Inlay',
      compatibility: 'Custom FiveM Bone Animation Compatible',
      delivery: 'Animation Scripts + Stream Files',
    },
    inStock: true,
  },

  // ==========================================
  // 4. RINGS & BANDS
  // ==========================================
  {
    id: 'ring-emerald-eternity',
    name: 'Emerald Cut Diamond Eternity Band',
    category: 'rings',
    collection: 'essence',
    brand: 'Yufo Atelier',
    reference: 'YUF-RNG-01',
    price: 650,
    priceDisplay: '$650',
    image: '/assets/products/category_rings.png',
    hoverImage: '/assets/products/category_rings.png',
    shortDescription: 'Full Perimeter Step-Cut Emerald Diamonds · Shared Prong',
    fullDescription: 'Subtle elegance. Sized for index, middle or pinky fingers on FiveM character models with zero finger vertex tearing.',
    specs: {
      material: 'Platinum 950 or 18K White Gold',
      stones: 'Seamless Step-Cut Emerald Stones',
      compatibility: 'Left & Right Hand Bone Rigged',
      delivery: 'Instant FiveM Resource Pack',
    },
    inStock: true,
  },
  {
    id: 'ring-sovereign-signet',
    name: 'Pavé Diamond Sovereign Signet Ring',
    category: 'rings',
    collection: 'the-saint-mark',
    brand: 'Yufo Atelier',
    reference: 'YUF-RNG-02',
    price: 750,
    priceDisplay: '$750',
    image: '/assets/products/category_rings.png',
    hoverImage: '/assets/products/category_rings.png',
    shortDescription: 'Heavy Solid Signet · Honeycomb Micro-Pavé Face · Side Fluting',
    fullDescription: 'Bold statement piece engineered for FiveM leaders and bosses. Honeycomb stone setting with engraved internal Yufo hallmark.',
    specs: {
      material: 'Solid 18K Yellow Gold Face',
      stones: 'Honeycomb Brilliant Pavé',
      compatibility: 'Pinky & Ring Finger Attachment Points',
      delivery: 'Instant Resource Pack',
    },
    inStock: true,
    featured: true,
  },

  // ==========================================
  // 5. GRILLZ & STUDS
  // ==========================================
  {
    id: 'studs-flawless-solitaires',
    name: 'Flawless Diamond Solitaire Ear Studs',
    category: 'studs',
    collection: 'essence',
    brand: 'Yufo Atelier',
    reference: 'YUF-STD-01',
    price: 450,
    priceDisplay: '$450',
    image: '/assets/products/category_studs.png',
    hoverImage: '/assets/products/category_studs.png',
    shortDescription: 'Pair of 2-Carat Equivalent Brilliant Solitaires · 4-Prong Setting',
    fullDescription: 'Clean and timeless ear studs attached directly to head bone coordinates. Shimmer shader sparkles under streetlights and headlights.',
    specs: {
      material: '18K White Gold Mountings',
      stones: 'Flawless Round Solitaires',
      compatibility: 'Head Bone Coords (Male & Female)',
      delivery: 'Instant Streaming Pack',
    },
    inStock: true,
  },
  {
    id: 'grillz-8pc-diamond-top-bottom',
    name: 'Top & Bottom 8-Piece Diamond Grillz',
    category: 'studs',
    collection: 'cathedral-of-dreams',
    brand: 'Yufo Atelier',
    reference: 'YUF-GRL-02',
    price: 950,
    priceDisplay: '$950',
    image: '/assets/products/category_studs.png',
    hoverImage: '/assets/products/category_studs.png',
    shortDescription: '16 Teeth Full Pavé Diamond Grillz · Deep Cut Canine Geometry',
    fullDescription: 'Mouth-rigged custom grillz designed to articulate naturally during FiveM voice chat (SaltyChat / pma-voice) without mouth clipping.',
    specs: {
      material: '18K White / Yellow Gold Caps',
      stones: 'Micro-Pavé Invisible Stone Caps',
      compatibility: 'Mouth & Jaw Bones Animated Rig',
      delivery: 'FiveM Stream Folder + Voice Sync Setup',
    },
    inStock: true,
    featured: true,
  },
];
