'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AlexMossHeader } from '../../components/AlexMossHeader';
import { AlexMossChat } from '../../components/AlexMossChat';
import { AccountModal } from '../../components/AccountModal';
import { CartDrawer } from '../../components/CartDrawer';
import { CartProvider, useCart } from '../../lib/cartContext';
import { AuthProvider, useAuth } from '../../lib/authContext';
import {
  IconCheck,
  IconUpload,
  IconBrandDiscord,
  IconX,
  IconArrowRight,
  IconShieldLock,
} from '@tabler/icons-react';

const SHOWCASE_PIECES = [
  {
    image: '/assets/media/campaign_portrait_medallion.jpg',
    title: 'The Sacred Crown Medallion',
    subtitle: '1-of-1 FiveM ped rigging (.ydd / .ytd)',
    category: 'Private atelier commission',
    position: 'object-[center_65%]',
  },
  {
    image: '/assets/media/campaign_solo_medallion.jpg',
    title: 'Solid Gold Saint Cross',
    subtitle: 'Universal male & female freemode rigging',
    category: 'Bespoke atelier commission',
    position: 'object-[center_50%]',
  },
  {
    image: '/assets/media/campaign_crew_simulation.jpg',
    title: 'Atelier Crew Simulation',
    subtitle: 'Zero-tear physics & in-game dynamic shaders',
    category: 'Haute joaillerie atelier',
    position: 'object-[center_50%]',
  },
];

function CustomOrdersForm() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const { user, startDiscordAuth } = useAuth();

  const [referencedPiece, setReferencedPiece] = useState(initialRef);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPiece, setCurrentPiece] = useState(0);

  // Form State
  const [discordHandle, setDiscordHandle] = useState(user?.pseudo || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState(
    initialRef.toLowerCase().includes('watch') || initialRef.toLowerCase().includes('rolex') || initialRef.toLowerCase().includes('royal')
      ? 'Haute horlogerie / iced watch (left hand bone)'
      : initialRef.toLowerCase().includes('cuban') || initialRef.toLowerCase().includes('chain')
      ? 'Heavy cuban link & choker (spine2 rigged)'
      : initialRef.toLowerCase().includes('ring')
      ? 'Bespoke signet & eternity ring (hand bone)'
      : 'Custom 3D medallion & pendant (.ydd / .ytd)'
  );
  const [pedTarget, setPedTarget] = useState('Universal freemode (male & female)');
  const [budget, setBudget] = useState('$1,500 - $3,500 (Standard bespoke commission)');
  const [vision, setVision] = useState(
    initialRef ? `I am interested in commissioning a custom piece inspired by "${initialRef}".\n\nSpecific details:\n- ` : ''
  );
  const [newsletter, setNewsletter] = useState(true);
  const [fileName, setFileName] = useState('');

  // Sync user if logged in
  useEffect(() => {
    if (user) {
      if (!discordHandle) setDiscordHandle(user.pseudo);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  // Subtle rotation of background atelier pieces
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPiece((prev) => (prev + 1) % SHOWCASE_PIECES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Discord authentication required. Please connect your Discord account first to create your private atelier channel.');
      setSubmitting(false);
      startDiscordAuth();
      return;
    }

    if (!discordHandle.trim() || !email.trim() || !vision.trim()) {
      setErrorMessage('Please fill in your Discord handle, email address, and project vision.');
      setSubmitting(false);
      return;
    }

    try {
      const fullVisionMessage = [
        referencedPiece ? `[REFERENCED PIECE: ${referencedPiece}]` : null,
        `TARGET PED: ${pedTarget}`,
        vision.trim(),
        fileName ? `[ATTACHED MEDIA: ${fileName}]` : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      const res = await fetch('/api/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user.pseudo,
          lastName: '',
          email: user.email || email.trim(),
          phone: user.discordId ? `discord:${user.discordId}` : discordHandle.trim(),
          discordId: user.discordId || '',
          category,
          budget,
          message: fullVisionMessage,
          newsletter,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setTicketId(data.inquiryId || `YUF-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
      if (typeof window !== 'undefined' && data.inquiryId) {
        localStorage.setItem('yufo_active_request_id', data.inquiryId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error transmitting inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const activeArt = SHOWCASE_PIECES[currentPiece];

  return (
    <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full">
      {/* Left Column: Form & Commission Intake */}
      <section
        className="w-full lg:w-[540px] xl:w-[600px] 2xl:w-[640px] shrink-0 px-5 sm:px-10 lg:px-14 py-10 lg:py-14 flex flex-col justify-start"
        aria-label="Commission inquiry form"
      >
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-zinc-500 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections/shop-all" className="hover:text-white transition-colors">Creations</Link>
          <span>/</span>
          <span className="text-zinc-300">Custom project</span>
        </nav>

        {/* H1 Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-3">
          Commission a custom piece
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 font-normal">
          Each 1-of-1 project is sculpted in 3D CAD, weighted to prevent jacket clipping, and rigged directly for FiveM ped skeletons (.ydd / .ytd). An exclusive private channel on Discord is opened with our staff upon submission.
        </p>

        {/* Contextual Reference Chip */}
        {referencedPiece && !submitted && (
          <div className="mb-6 p-3 bg-zinc-900/80 border border-white/10 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-zinc-500 font-medium shrink-0">Referenced creation:</span>
              <span className="text-white font-semibold truncate">{referencedPiece}</span>
            </div>
            <button
              type="button"
              onClick={() => setReferencedPiece('')}
              className="text-zinc-400 hover:text-white p-1 rounded transition-colors shrink-0"
              aria-label="Remove referenced piece"
            >
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Discord Auth Required Gate Banner if not logged in */}
        {!user && !submitted && (
          <div className="mb-6 p-4 bg-zinc-900/60 border border-white/10 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <IconShieldLock size={16} className="text-emerald-400" />
              <span>Discord connection required to commission</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              To automatically generate your private atelier channel on the Yufo The Jeweler Discord server, please authenticate with Discord first.
            </p>
            <button
              type="button"
              onClick={startDiscordAuth}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <IconBrandDiscord size={16} />
              <span>Connect with Discord</span>
            </button>
          </div>
        )}

        {submitted ? (
          /* Confirmation State */
          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-10 text-left animate-in fade-in duration-300 space-y-5">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <div className="w-6 h-6 rounded-full bg-emerald-400/10 flex items-center justify-center">
                <IconCheck size={14} stroke={2.5} />
              </div>
              <span className="text-xs font-semibold tracking-wide">
                Project inquiry transmitted & private channel initiated
              </span>
            </div>

            <div>
              <p className="text-[11px] text-zinc-500 font-mono mb-0.5">
                Inquiry reference code
              </p>
              <p className="text-xl text-white font-semibold tracking-tight">
                {ticketId}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Your 3D brief has been received by our master orfèvre. A dedicated private channel has been generated for you on the official <span className="text-white font-medium">Yufo The Jeweler</span> Discord server.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href="https://discord.gg/yufothejeweler"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 h-11 bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <IconBrandDiscord size={15} />
                <span>Open Discord atelier channel</span>
              </a>

              <Link
                href="/collections/shop-all"
                className="w-full sm:w-auto px-6 h-11 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-xs font-medium rounded-full flex items-center justify-center transition-colors"
              >
                Browse creations
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
            {errorMessage && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Contact Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="custom-discord" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Discord username {user ? <span className="text-emerald-400 font-normal">(Certified)</span> : <span className="text-zinc-500">*</span>}
                </label>
                <input
                  id="custom-discord"
                  type="text"
                  required
                  disabled={!!user}
                  value={discordHandle}
                  onChange={(e) => setDiscordHandle(e.target.value)}
                  placeholder="@username or CFX ID"
                  className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-75"
                />
              </div>

              <div>
                <label htmlFor="custom-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email address <span className="text-zinc-500">*</span>
                </label>
                <input
                  id="custom-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Piece Category & Target Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="custom-category" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Creation type
                </label>
                <select
                  id="custom-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white cursor-pointer focus:outline-none focus:border-white/30 transition-colors"
                >
                  <option value="Custom 3D medallion & pendant (.ydd / .ytd)">Custom medallion & pendant</option>
                  <option value="Heavy cuban link & choker (spine2 rigged)">Heavy cuban link & chain</option>
                  <option value="Haute horlogerie / iced watch (left hand bone)">Iced watch / timepiece</option>
                  <option value="Bespoke signet & eternity ring (hand bone)">Signet & eternity ring</option>
                  <option value="Diamond grillz & teeth caps (jaw rigged)">Diamond grillz & caps</option>
                  <option value="Full bust & multi-chain showcase (1-of-1 exclusive)">Full bust & multi-chain set</option>
                </select>
              </div>

              <div>
                <label htmlFor="custom-ped" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Ped skeleton target
                </label>
                <select
                  id="custom-ped"
                  value={pedTarget}
                  onChange={(e) => setPedTarget(e.target.value)}
                  className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white cursor-pointer focus:outline-none focus:border-white/30 transition-colors"
                >
                  <option value="Universal freemode (male & female)">Universal (male & female)</option>
                  <option value="Male freemode only (mp_m_freemode_01)">Male freemode only</option>
                  <option value="Female freemode only (mp_f_freemode_01)">Female freemode only</option>
                  <option value="Custom ped skeleton">Custom ped skeleton</option>
                </select>
              </div>
            </div>

            {/* Target Budget Tier */}
            <div>
              <label htmlFor="custom-budget" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Estimated budget tier
              </label>
              <select
                id="custom-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white cursor-pointer focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="$1,500 - $3,500 (Standard bespoke commission)">$1,500 - $3,500 (Standard bespoke piece)</option>
                <option value="$3,500 - $7,500 (Heavy stones & multi-metal inlay)">$3,500 - $7,500 (High-density stones & custom shaders)</option>
                <option value="$7,500 - $15,000 (Haute joaillerie & full custom rigging)">$7,500 - $15,000 (Haute joaillerie multi-piece set)</option>
                <option value="$15,000+ Confidential 1-of-1 server exclusivity">$15,000+ Full server exclusivity rights</option>
              </select>
            </div>

            {/* Project Vision & Details */}
            <div>
              <label htmlFor="custom-vision" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Project brief & details <span className="text-zinc-500">*</span>
              </label>
              <textarea
                id="custom-vision"
                required
                rows={4}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Describe your design, emblems, text engraving, stone preferences, or clothing compatibility requirements..."
                className="w-full p-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Dropzone for Reference File */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Visual reference (optional)
              </label>
              <label
                htmlFor="custom-dropzone"
                className="w-full p-4 border border-dashed border-white/15 hover:border-white/30 rounded-xl bg-zinc-950/60 flex flex-col items-center justify-center cursor-pointer transition-colors"
              >
                <IconUpload size={20} stroke={1.5} className="text-zinc-400 mb-1.5" />
                <p className="text-xs text-zinc-300 font-medium text-center">
                  {fileName ? fileName : 'Upload sketch, logo, or reference image'}
                </p>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  PNG, JPG, OBJ, or BLEND supported
                </span>
                <input
                  id="custom-dropzone"
                  type="file"
                  accept="image/*,video/*,.obj,.blend"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Newsletter Checkbox */}
            <div className="flex items-center gap-2.5 pt-1 select-none">
              <input
                id="custom-newsletter"
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-zinc-900 border border-white/20 checked:bg-white accent-white cursor-pointer"
              />
              <label htmlFor="custom-newsletter" className="text-xs text-zinc-400 cursor-pointer">
                Receive private notices for future 1-of-1 allocations
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <span>Submitting inquiry...</span>
                ) : (
                  <>
                    <span>Submit project inquiry & open channel</span>
                    <IconArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Right Column: Atelier Visual Showcase */}
      <aside
        className="hidden lg:flex flex-1 relative bg-zinc-950 border-l border-white/10 sticky top-20 h-[calc(100vh-80px)] overflow-hidden"
        aria-label="Atelier visual showcase"
      >
        <div className="w-full h-full relative">
          <Image
            key={activeArt.image}
            src={activeArt.image}
            alt={activeArt.title}
            fill
            priority
            quality={95}
            className={`object-cover ${activeArt.position} opacity-90 transition-all duration-1000`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent pointer-events-none" />

          {/* Caption */}
          <div className="absolute bottom-10 left-10 xl:bottom-12 xl:left-12 max-w-sm pointer-events-none z-10">
            <span className="text-xs text-zinc-400 block mb-1">
              {activeArt.category}
            </span>
            <p className="text-xl xl:text-2xl text-white font-semibold tracking-tight">
              {activeArt.title}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {activeArt.subtitle}
            </p>

            {/* Slide Navigation */}
            <div className="flex items-center gap-3 mt-4 pointer-events-auto">
              {SHOWCASE_PIECES.map((piece, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPiece(idx)}
                  className={`text-xs font-mono tracking-wider transition-all cursor-pointer ${
                    currentPiece === idx
                      ? 'text-white border-b border-white pb-0.5'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  aria-label={`View ${piece.title}`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function CustomOrdersContent() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      {/* Top Header */}
      <AlexMossHeader
        activeRoute="custom"
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Commission Form wrapped in Suspense for useSearchParams */}
      <main className="flex-1 w-full border-b border-white/10" aria-label="Custom order commission">
        <Suspense
          fallback={
            <div className="py-24 text-center text-xs uppercase tracking-widest text-zinc-500">
              Loading custom commission studio...
            </div>
          }
        >
          <CustomOrdersForm />
        </Suspense>
      </main>

      {/* Technical Standards Bar */}
      <section className="border-t border-white/5 bg-zinc-950/60 py-10 select-none" aria-label="Atelier guarantees">
        <div className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Complimentary FiveM rigging
            </p>
            <p className="text-xs text-zinc-400">
              Universal male & female freemode skeletons
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Zero-tear weight painting
            </p>
            <p className="text-xs text-zinc-400">
              Tested across jackets, vests, and driving rigs
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              72-Hour concierge channel
            </p>
            <p className="text-xs text-zinc-400">
              Direct line with our master jeweler
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Confidential 1-of-1 rights
            </p>
            <p className="text-xs text-zinc-400">
              Exclusivity locked to your community
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050507] py-8 px-5 sm:px-10 lg:px-14 text-xs text-zinc-500">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>© 2026 YUFO The Jeweler</span>
            <span>·</span>
            <span>SoHo & Los Santos Private Atelier</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/collections/shop-all" className="hover:text-white transition-colors">Creations</Link>
            <Link href="/custom-orders" className="hover:text-white transition-colors">Custom orders</Link>
            <a href="https://discord.gg/yufothejeweler" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord lounge</a>
          </div>
        </div>
      </footer>

      {/* Concierge Live Chat */}
      <AlexMossChat />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenContact={() => {}}
      />
    </div>
  );
}

export default function CustomOrdersPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <CustomOrdersContent />
      </CartProvider>
    </AuthProvider>
  );
}
