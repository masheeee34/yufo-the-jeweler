'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  IconLock,
  IconSend,
  IconClock,
  IconCheck,
  IconSearch,
  IconMessageCircle,
  IconAlertCircle,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconPlus,
  IconSparkles,
  IconShoppingBag,
  IconEdit,
  IconX,
  IconChecklist,
  IconEye,
  IconExternalLink,
  IconMenu2,
} from '@tabler/icons-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { MessageAttachments } from '@/components/MessageAttachments';
import { ReviewItem } from '@/lib/reviewsDb';
import { Product, ProductCategory, ProductCollection, CATEGORIES_NAV, COLLECTIONS_NAV, YUFO_PRODUCTS } from '@/lib/products';

// SVG Officiel Avis Vérifié Tabler (#05b4ff)
function VerifiedCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#05b4ff"
      className="inline-block flex-shrink-0"
      aria-label="Verified review"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
    </svg>
  );
}

// Logo Discord Vectoriel
function DiscordBadge() {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/25 text-[#9ba9eb]"
      title="Verified Discord review"
    >
      <svg className="w-3.5 h-3.5 fill-[#5865F2]" viewBox="0 0 127.14 96.36">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
      </svg>
      <span className="text-[10px] font-semibold tracking-wide text-white/80">Discord</span>
    </div>
  );
}

// Etoiles dorées
function StarRating({ rating = 5 }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-zinc-700 fill-zinc-700'
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  createdAt: string;
  attachments?: string[];
}

interface ClientRequest {
  id: string;
  pseudo: string;
  subject: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'answered' | 'closed';
  messages: ChatMessage[];
}

const PRESET_IMAGES = [
  { label: 'Rolex Datejust 41', url: '/assets/products/rolex_datejust_41.png' },
  { label: 'Rolex Day-Date Everose', url: '/assets/products/rolex_daydate_everose.png' },
  { label: 'Rolex Day-Date Yellow', url: '/assets/products/rolex_daydate_yellow.png' },
  { label: 'Rolex GMT Bruce Wayne', url: '/assets/products/rolex_gmt_bruce_wayne.png' },
  { label: 'AP Royal Oak Chrono', url: '/assets/products/ap_royal_oak_chrono.png' },
  { label: 'AP Royal Oak Rose Gold', url: '/assets/products/ap_royal_oak_rosegold.png' },
  { label: 'Patek Aquanaut', url: '/assets/products/patek_aquanaut_5167a.png' },
  { label: 'Patek Nautilus', url: '/assets/products/patek_nautilus_5980.png' },
  { label: 'Pendants Category', url: '/assets/products/category_pendants.png' },
  { label: 'Chains Category', url: '/assets/products/category_chains.png' },
  { label: 'Rings Category', url: '/assets/products/category_rings.png' },
  { label: 'Studs Category', url: '/assets/products/category_studs.png' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Onglet Actif : 'products' | 'requests' | 'reviews'
  const [activeTab, setActiveTab] = useState<'products' | 'requests' | 'reviews'>('products');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // --- CATALOGUE & ARTICLES ---
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<ProductCategory>('all');
  const [productColFilter, setProductColFilter] = useState<ProductCollection>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productActionMsg, setProductActionMsg] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Formulaire Produit
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState<number | string>(750);
  const [prodCategory, setProdCategory] = useState<ProductCategory>('pendants');
  const [prodCollection, setProdCollection] = useState<ProductCollection>('essence');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodFullDesc, setProdFullDesc] = useState('');
  const [prodImage, setProdImage] = useState('/assets/products/category_pendants.png');
  const [prodBrand, setProdBrand] = useState('YUFO The Jeweler');
  const [prodReference, setProdReference] = useState('');
  const [prodMaterial, setProdMaterial] = useState('Solid 18K Precious Alloy');
  const [prodStones, setProdStones] = useState('Hand-Set VVS Lab Diamond Pavé');
  const [prodCompatibility, setProdCompatibility] = useState('Universal FiveM MP Male & Female Ped Skeletons');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodFeatured, setProdFeatured] = useState(false);

  // --- REQUÊTES CLIENTS ---
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // --- AVIS CLIENTS DISCORD ---
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newPseudo, setNewPseudo] = useState('');
  const [newDate, setNewDate] = useState('1 day ago');
  const [newRating, setNewRating] = useState<number>(5);
  const [newIsVerified, setNewIsVerified] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewActionMsg, setReviewActionMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vérifier la session au chargement
  useEffect(() => {
    const savedKey = sessionStorage.getItem('yufo_admin_token');
    if (savedKey === 'yufo2026') {
      setIsAuthenticated(true);
      fetchProducts(savedKey);
      fetchRequests(savedKey);
      fetchReviews(savedKey);
    }
  }, []);

  // Polling automatique des requêtes si sur l'onglet requests
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const key = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
      if (activeTab === 'requests') {
        fetchRequests(key, false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRequest?.messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'yufo2026') {
      sessionStorage.setItem('yufo_admin_token', 'yufo2026');
      setIsAuthenticated(true);
      setAuthError('');
      fetchProducts('yufo2026');
      fetchRequests('yufo2026');
      fetchReviews('yufo2026');
    } else {
      setAuthError('Mot de passe administrateur invalide.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yufo_admin_token');
    setIsAuthenticated(false);
    setSelectedRequest(null);
    setProducts([]);
    setRequests([]);
    setReviews([]);
  };

  // --- API PRODUITS ---
  const fetchProducts = async (key: string) => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setProductsLoading(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice(750);
    setProdCategory('pendants');
    setProdCollection('essence');
    setProdShortDesc('');
    setProdFullDesc('');
    setProdImage('/assets/products/category_pendants.png');
    setProdBrand('YUFO The Jeweler');
    setProdReference('');
    setProdMaterial('Solid 18K Precious Alloy');
    setProdStones('Hand-Set VVS Lab Diamond Pavé');
    setProdCompatibility('Universal FiveM MP Male & Female Ped Skeletons');
    setProdInStock(true);
    setProdFeatured(false);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdCollection(product.collection || 'essence');
    setProdShortDesc(product.shortDescription);
    setProdFullDesc(product.fullDescription);
    setProdImage(product.image);
    setProdBrand(product.brand || 'YUFO The Jeweler');
    setProdReference(product.reference || '');
    setProdMaterial(product.specs?.material || 'Solid 18K Precious Alloy');
    setProdStones(product.specs?.stones || 'Hand-Set VVS Lab Diamond Pavé');
    setProdCompatibility(product.specs?.compatibility || 'Universal FiveM MP Male & Female Ped Skeletons');
    setProdInStock(product.inStock !== false);
    setProdFeatured(Boolean(product.featured));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || prodPrice === '' || !prodFullDesc.trim()) {
      alert('Veuillez renseigner au minimum le titre, le prix et la description.');
      return;
    }

    setSubmittingProduct(true);
    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';

    const payload = {
      id: editingProduct?.id,
      name: prodName.trim(),
      price: Number(prodPrice),
      category: prodCategory,
      collection: prodCollection,
      shortDescription: prodShortDesc.trim() || `${prodName.trim()} · FiveM Stream Ready`,
      fullDescription: prodFullDesc.trim(),
      image: prodImage.trim() || '/assets/products/category_pendants.png',
      brand: prodBrand.trim() || 'YUFO The Jeweler',
      reference: prodReference.trim(),
      specs: {
        material: prodMaterial.trim(),
        stones: prodStones.trim(),
        compatibility: prodCompatibility.trim(),
        delivery: 'Instant Streaming Asset (.ydd / .ytd ready)',
      },
      inStock: prodInStock,
      featured: prodFeatured,
    };

    try {
      const url = '/api/admin/products';
      const method = editingProduct ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.product) {
        if (editingProduct) {
          setProducts((prev) => prev.map((p) => (p.id === data.product.id ? data.product : p)));
          setProductActionMsg(`Article "${data.product.name}" mis à jour avec succès !`);
        } else {
          setProducts((prev) => [data.product, ...prev]);
          setProductActionMsg(`Nouvel article "${data.product.name}" ajouté aux collections !`);
        }
        setIsProductModalOpen(false);
        setTimeout(() => setProductActionMsg(''), 4500);
      } else {
        alert(data.error || 'Erreur lors de l enregistrement');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Erreur réseau lors de l enregistrement.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Supprimer définitivement "${product.name}" du catalogue ?`)) return;

    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': token },
      });
      if (res.ok) {
        setProductActionMsg(`Article "${product.name}" supprimé.`);
        setTimeout(() => setProductActionMsg(''), 4000);
      } else {
        fetchProducts(token);
      }
    } catch (e) {
      console.error(e);
      fetchProducts(token);
    }
  };

  // Filtrage des articles
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productColFilter !== 'all' && p.collection !== productColFilter) return false;
      if (productCatFilter !== 'all' && p.category !== productCatFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.fullDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productColFilter, productCatFilter, productSearch]);

  // --- API REQUÊTES CLIENTS ---
  const fetchRequests = async (key: string, showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/admin/requests', {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (selectedRequest) {
          const updated = (data.requests || []).find((r: ClientRequest) => r.id === selectedRequest.id);
          if (updated) setSelectedRequest(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !replyText.trim()) return;

    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
    const text = replyText.trim();
    setReplyText('');

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({ requestId: selectedRequest.id, replyText: text }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setSelectedRequest(data.request);
        setRequests((prev) => prev.map((r) => (r.id === data.request.id ? data.request : r)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (status: 'pending' | 'answered' | 'closed') => {
    if (!selectedRequest) return;
    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({ requestId: selectedRequest.id, status }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        setSelectedRequest(data.request);
        setRequests((prev) => prev.map((r) => (r.id === data.request.id ? data.request : r)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- API AVIS CLIENTS ---
  const fetchReviews = async (key: string) => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'x-admin-key': key },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPseudo.trim() || !newMessage.trim()) return;

    setSubmittingReview(true);
    setReviewActionMsg('');
    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({
          pseudo: newPseudo.trim(),
          date: newDate.trim() || 'Today',
          message: newMessage.trim(),
          rating: newRating,
          isVerified: newIsVerified,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setNewPseudo('');
        setNewMessage('');
        setNewDate('Today');
        setNewRating(5);
        setNewIsVerified(true);
        setReviewActionMsg('Avis client ajouté avec succès !');
        setTimeout(() => setReviewActionMsg(''), 4000);
      }
    } catch (err) {
      console.error('Erreur ajout avis:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Supprimer cet avis de manière définitive ?')) return;

    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
    setReviews((prev) => prev.filter((r) => r.id !== id));

    try {
      await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': token },
      });
    } catch (err) {
      console.error('Erreur suppression avis:', err);
      fetchReviews(token);
    }
  };

  const handleToggleVerified = async (review: ReviewItem) => {
    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
    const nextState = !review.isVerified;

    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, isVerified: nextState } : r))
    );

    try {
      await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': token,
        },
        body: JSON.stringify({ id: review.id, isVerified: nextState }),
      });
    } catch (err) {
      console.error('Erreur toggle verifie:', err);
      fetchReviews(token);
    }
  };

  const getRemainingHours = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - new Date().getTime();
    if (diffMs <= 0) return 'Expiré';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'pending' && r.status !== 'pending') return false;
    if (filter === 'answered' && r.status !== 'answered') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.pseudo.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  // ==========================================
  // 1. ÉCRAN DE CONNEXION (DESIGN LUXE YUFO)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen w-full bg-[#070709] flex items-center justify-center p-6 text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-950/90 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl relative z-10">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-medium block">
              YUFO THE JEWELER
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-3">
              Atelier Management
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Portail sécurisé · Collections, commandes sur-mesure & avis vérifiés
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                Mot de passe administrateur
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Code d'accès atelier"
                  className="w-full h-12 px-4 bg-black/60 border border-white/10 focus:border-white/30 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
                />
                <IconLock size={17} className="absolute right-4 top-3.5 text-zinc-500" />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                <IconAlertCircle size={14} />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-lg hover:scale-[1.01] mt-2 flex items-center justify-center gap-2"
            >
              <span>Accéder au panel atelier</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 tracking-wider uppercase">
            <span>2026 Haute Joaillerie</span>
            <span>FiveM Stream Ready</span>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // 2. DASHBOARD ADMIN COMPLET
  // ==========================================
  const refreshAll = () => {
    const token = sessionStorage.getItem('yufo_admin_token') || 'yufo2026';
    fetchProducts(token);
    fetchRequests(token);
    fetchReviews(token);
  };

  return (
    <div className="h-dvh w-full bg-[#0c0c0d] text-white flex lg:gap-3 lg:p-3 selection:bg-white selection:text-black font-sans">
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        productCount={products.length}
        pendingCount={pendingCount}
        reviewCount={reviews.length}
        onAddProduct={openAddProductModal}
        onRefresh={refreshAll}
        refreshing={productsLoading || loading || reviewsLoading}
        onLogout={handleLogout}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <section className="flex-1 min-w-0 flex flex-col bg-[#141414] lg:rounded-[20px] lg:border border-white/[0.05] overflow-hidden">
        {/* Barre du haut (mobile) */}
        <div className="lg:hidden h-16 shrink-0 px-4 flex items-center gap-3 border-b border-white/[0.06]">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="w-10 h-10 rounded-[10px] hover:bg-white/10 flex items-center justify-center text-zinc-300"
            aria-label="Ouvrir le menu"
          >
            <IconMenu2 size={20} />
          </button>
          <span className="w-8 h-8 rounded-[8px] bg-black border border-white/15 flex items-center justify-center"><Image src="/assets/brand/yufo_clean_white.png" alt="YUFO" width={22} height={23} className="object-contain" /></span>
          <span className="text-[16px] font-semibold flex-1">YUFO Atelier</span>
          {pendingCount > 0 && (
            <button onClick={() => setActiveTab('requests')} className="h-7 px-2.5 rounded-full bg-amber-400 text-black text-[11px] font-bold">
              {pendingCount} en attente
            </button>
          )}
        </div>

      {/* Message de succès d'action temporaire */}
      {(productActionMsg || reviewActionMsg) && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2 animate-in fade-in">
          <IconCheck size={16} />
          <span>{productActionMsg || reviewActionMsg}</span>
        </div>
      )}

      {/* Contenu Principal */}
      <main className="flex-1 overflow-y-auto w-full px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
        {/* ================================================================= */}
        {/* ONGLET 1 : COLLECTIONS & ARTICLES DU CATALOGUE                     */}
        {/* ================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header de section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium block mb-1">
                  Catalogue Atelier
                </span>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Gestion des collections & pièces
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                  Ajoutez de nouvelles créations, définissez les prix, descriptions et collections. Tout élément ajouté apparaît directement dans le shop.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={openAddProductModal}
                  className="px-6 h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02]"
                >
                  <IconPlus size={16} stroke={2.5} />
                  <span>Ajouter un article</span>
                </button>
              </div>
            </div>

            {/* Barre de Recherche et Filtres */}
            <div className="space-y-4 bg-zinc-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              {/* Barre de recherche */}
              <div className="relative">
                <IconSearch size={16} className="absolute left-4 top-3 text-zinc-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Rechercher par titre, description, marque, référence..."
                  className="w-full h-10 pl-11 pr-4 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3.5 top-3 text-zinc-500 hover:text-white"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>

              {/* Filtres par Collection */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 mr-2 font-medium">
                  Collection :
                </span>
                {COLLECTIONS_NAV.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setProductColFilter(col.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      productColFilter === col.id
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>

              {/* Filtres par Catégorie */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 mr-2 font-medium">
                  Catégorie :
                </span>
                {CATEGORIES_NAV.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setProductCatFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer ${
                      productCatFilter === cat.id
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grille des Articles */}
            {productsLoading ? (
              <div className="py-20 text-center text-zinc-500 text-xs">
                Chargement du catalogue atelier...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center border border-white/5 rounded-2xl bg-zinc-950/40">
                <IconShoppingBag size={32} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-sm text-zinc-400 font-medium">Aucun article ne correspond aux filtres.</p>
                <p className="text-xs text-zinc-600 mt-1">Modifiez vos critères de recherche ou ajoutez une pièce.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <article
                    key={prod.id}
                    className="group bg-zinc-950 border border-white/10 hover:border-white/25 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-xl relative"
                  >
                    {/* Visual */}
                    <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-4">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10 backdrop-blur-md">
                          .ydd / .ytd
                        </span>
                        {prod.collection && prod.collection !== 'all' && (
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-medium border border-amber-400/20 backdrop-blur-md">
                            {prod.collection}
                          </span>
                        )}
                      </div>

                      {prod.featured && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-zinc-950 font-bold shadow-md">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span>{prod.reference}</span>
                        <span className="capitalize">{prod.category}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {prod.shortDescription || prod.fullDescription}
                      </p>
                    </div>

                    {/* Prix & Actions */}
                    <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">
                        {prod.priceDisplay || `$${prod.price}`}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Modifier cet article"
                        >
                          <IconEdit size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(prod)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                          title="Supprimer du catalogue"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 2 : DEMANDES CONCIERGE (72H)                               */}
        {/* ================================================================= */}
        {activeTab === 'requests' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  Demandes Atelier Concierge (72h)
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Direct line privée avec les acheteurs et créateurs 1-of-1.
                </p>
              </div>

              {/* Filtre de statut */}
              <div className="flex items-center gap-2">
                {(['all', 'pending', 'answered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilter(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                      filter === st
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'Toutes' : st === 'pending' ? 'En attente' : 'Répondues'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
              {/* Colonne Gauche : Liste des conversations */}
              <div className="lg:col-span-4 bg-zinc-950 border border-white/10 rounded-2xl p-4 flex flex-col">
                <div className="relative mb-3">
                  <IconSearch size={15} className="absolute left-3.5 top-3 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par pseudo ou sujet..."
                    className="w-full h-9 pl-9 pr-3 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredRequests.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-500">
                      Aucune requête trouvée.
                    </div>
                  ) : (
                    filteredRequests.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selectedRequest?.id === req.id
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-black/30 border-white/5 hover:border-white/15 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-white truncate">
                            {req.pseudo}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              req.status === 'pending'
                                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                                : 'bg-emerald-400/10 text-emerald-300 border border-emerald-400/20'
                            }`}
                          >
                            {req.status === 'pending' ? 'En attente' : 'Répondu'}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 truncate mb-2">{req.subject}</p>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span className="flex items-center gap-1">
                            <IconClock size={12} />
                            {getRemainingHours(req.expiresAt)}
                          </span>
                          <span>{req.messages.length} msg</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Colonne Droite : Chat et Réponse */}
              <div className="lg:col-span-8 bg-zinc-950 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                {selectedRequest ? (
                  <>
                    <div>
                      {/* Header de la discussion */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold text-white">
                              {selectedRequest.pseudo}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                              ID: {selectedRequest.id}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{selectedRequest.subject}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus('answered')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-colors"
                          >
                            Marquer répondu
                          </button>
                          <button
                            onClick={() => handleUpdateStatus('pending')}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-colors"
                          >
                            En attente
                          </button>
                        </div>
                      </div>

                      {/* Messages de discussion */}
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                        {selectedRequest.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`flex flex-col ${
                              m.sender === 'admin' ? 'items-end' : 'items-start'
                            }`}
                          >
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 px-1">
                              {m.sender === 'admin' ? 'YUFO Master Orfèvre' : selectedRequest.pseudo}
                            </span>
                            <div
                              className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                                m.sender === 'admin'
                                  ? 'bg-white text-zinc-950 font-medium'
                                  : 'bg-zinc-900 border border-white/10 text-zinc-200'
                              }`}
                            >
                              <span className="whitespace-pre-line">{m.text}</span>
                              <MessageAttachments names={m.attachments} />
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* Zone de saisie */}
                    <form onSubmit={handleSendReply} className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Répondre directement au client via le concierge..."
                          className="flex-1 h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                        />
                        <button
                          type="submit"
                          className="h-11 px-6 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <IconSend size={14} />
                          <span>Envoyer</span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-500 text-xs">
                    <IconMessageCircle size={36} className="text-zinc-600 mb-2" />
                    <span>Sélectionnez une demande à gauche pour lire l'historique et répondre.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 3 : AVIS CLIENTS DISCORD                                   */}
        {/* ================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="pb-4 border-b border-white/5">
              <h2 className="text-2xl font-semibold text-white tracking-tight">
                Avis Clients & Témoignages Discord
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Gérez les témoignages affichés dans le carrousel infini de la page d'accueil.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Formulaire d'ajout d'avis */}
              <div className="lg:col-span-5 bg-zinc-950 border border-white/10 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-white mb-1">Ajouter un avis vérifié</h3>
                <p className="text-xs text-zinc-400 mb-5">
                  Publiez un retour Discord ou client officiel.
                </p>

                <form onSubmit={handleAddReview} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-medium">Pseudo Client</label>
                    <input
                      type="text"
                      required
                      value={newPseudo}
                      onChange={(e) => setNewPseudo(e.target.value)}
                      placeholder="Ex: Ghost_RP ou Kevz#0001"
                      className="w-full h-10 px-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-medium">Date affichée</label>
                      <input
                        type="text"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        placeholder="Ex: 2 days ago"
                        className="w-full h-10 px-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-medium">Note étoiles</label>
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="w-full h-10 px-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                      >
                        <option value={5}>5 / 5 (Parfait)</option>
                        <option value={4}>4 / 5 (Très bon)</option>
                        <option value={3}>3 / 5 (Moyen)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1.5 font-medium">Message de l'avis</label>
                    <textarea
                      required
                      rows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Texte du témoignage..."
                      className="w-full p-3.5 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="verifiedCheck"
                      checked={newIsVerified}
                      onChange={(e) => setNewIsVerified(e.target.checked)}
                      className="w-4 h-4 rounded bg-black border-white/20 text-white accent-white cursor-pointer"
                    />
                    <label htmlFor="verifiedCheck" className="text-zinc-300 cursor-pointer">
                      Avis vérifié (Badge officiel bleu Tabler)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
                  >
                    <span>{submittingReview ? 'Publication...' : 'Publier le témoignage'}</span>
                  </button>
                </form>
              </div>

              {/* Liste des avis existants */}
              <div className="lg:col-span-7 bg-zinc-950 border border-white/10 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                  <h3 className="text-base font-semibold text-white">
                    Avis publiés ({reviews.length})
                  </h3>
                  <span className="text-xs text-zinc-400">Marquee infini accueil</span>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{rev.pseudo}</span>
                          {rev.isVerified && <VerifiedCheckIcon size={16} />}
                          <span className="text-[10px] text-zinc-500">· {rev.date}</span>
                        </div>
                        <DiscordBadge />
                      </div>

                      <div className="mb-2">
                        <StarRating rating={rev.rating} />
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-normal mb-3">
                        &ldquo;{rev.message}&rdquo;
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleToggleVerified(rev)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                        >
                          {rev.isVerified ? 'Désactiver badge' : 'Activer badge'}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                          title="Supprimer l'avis"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </section>

      {/* ================================================================= */}
      {/* MODAL : AJOUTER OU MODIFIER UN ARTICLE DE COLLECTION               */}
      {/* ================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            {/* Bouton Fermer */}
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <IconX size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-medium block mb-1">
                Atelier Collection Builder
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {editingProduct ? `Modifier "${editingProduct.name}"` : 'Ajouter un article aux collections'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Renseignez le titre, le prix, la description et la collection pour publier la pièce dans le catalogue.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Ligne 1 : Titre et Prix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Titre de la création <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ex: Solid Gold Saint Cross Pendant"
                    className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Prix ($ USD) <span className="text-white">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Ex: 850"
                    className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Ligne 2 : Collection et Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Collection YUFO <span className="text-white">*</span>
                  </label>
                  <select
                    value={prodCollection}
                    onChange={(e) => setProdCollection(e.target.value as ProductCollection)}
                    className="w-full h-11 px-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="cathedral-of-dreams">Cathedral of Dreams</option>
                    <option value="neo">NEO</option>
                    <option value="the-saint-mark">The Saint Mark</option>
                    <option value="essence">Essence</option>
                    <option value="all">Archive Générale (Shop All)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Catégorie de bijou <span className="text-white">*</span>
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                    className="w-full h-11 px-3 bg-black/60 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="pendants">Pendants & Medallions</option>
                    <option value="chains">Chains & Necklaces</option>
                    <option value="watches">Timepieces (Montres)</option>
                    <option value="rings">Rings & Bands (Bagues)</option>
                    <option value="studs">Grillz & Studs</option>
                  </select>
                </div>
              </div>

              {/* Ligne 3 : Descriptions */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Description courte (Affichée sur les cartes)
                </label>
                <input
                  type="text"
                  value={prodShortDesc}
                  onChange={(e) => setProdShortDesc(e.target.value)}
                  placeholder="Ex: 18K Yellow Gold · VVS Diamond Pavé · Heavy Link"
                  className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Description détaillée (Affichée dans l'inspecteur) <span className="text-white">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={prodFullDesc}
                  onChange={(e) => setProdFullDesc(e.target.value)}
                  placeholder="Détails de la création, finitions, shader FiveM..."
                  className="w-full p-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 leading-relaxed"
                />
              </div>

              {/* Ligne 4 : Image de la création */}
              <div>
                <label className="block text-zinc-400 mb-1.5 font-medium">
                  Image du produit (URL ou Asset Atelier)
                </label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="Ex: /assets/products/rolex_datejust_41.png ou URL externe"
                  className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 mb-2 font-mono text-[11px]"
                />

                {/* Sélecteur rapide d'assets existants */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  <span className="text-[10px] text-zinc-500 shrink-0">Préréglages :</span>
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProdImage(img.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap transition-colors cursor-pointer ${
                        prodImage === img.url
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ligne 5 : Référence et Marque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Marque / Atelier
                  </label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    placeholder="Ex: YUFO The Jeweler"
                    className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1.5 font-medium">
                    Référence (Optionnelle)
                  </label>
                  <input
                    type="text"
                    value={prodReference}
                    onChange={(e) => setProdReference(e.target.value)}
                    placeholder="Laisser vide pour auto-générer"
                    className="w-full h-11 px-4 bg-black/60 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono"
                  />
                </div>
              </div>

              {/* Ligne 6 : Spécifications FiveM */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                  Spécifications 3D FiveM
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Métal / Matériau</label>
                    <input
                      type="text"
                      value={prodMaterial}
                      onChange={(e) => setProdMaterial(e.target.value)}
                      placeholder="18K Gold"
                      className="w-full h-9 px-3 bg-black border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Sertissage pierres</label>
                    <input
                      type="text"
                      value={prodStones}
                      onChange={(e) => setProdStones(e.target.value)}
                      placeholder="VVS Diamonds"
                      className="w-full h-9 px-3 bg-black border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Compatibilité skeleton</label>
                    <input
                      type="text"
                      value={prodCompatibility}
                      onChange={(e) => setProdCompatibility(e.target.value)}
                      placeholder="MP Male & Female"
                      className="w-full h-9 px-3 bg-black border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes : En stock & Featured */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                    className="w-4 h-4 rounded bg-black border-white/20 text-white accent-white cursor-pointer"
                  />
                  <span>En stock (Stream disponible)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-black border-white/20 text-white accent-white cursor-pointer"
                  />
                  <span>Mettre en avant sur la page d'accueil</span>
                </label>
              </div>

              {/* Boutons d'action */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-7 h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-full transition-all shadow-lg hover:scale-[1.02] flex items-center gap-2"
                >
                  <IconCheck size={16} />
                  <span>
                    {submittingProduct
                      ? 'Enregistrement...'
                      : editingProduct
                      ? 'Enregistrer les modifications'
                      : 'Créer et publier la création'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
