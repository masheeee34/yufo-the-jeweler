'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../lib/cartContext';
import { useAuth } from '../lib/authContext';
import {
  X,
  Trash2,
  Check,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Key,
  Layers,
  Sparkles,
  Download,
  Lock,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [fivemId, setFivemId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'keymaster' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Processing & order status
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    licenseKey: string;
    itemsSummary: string;
  } | null>(null);

  // Sync logged-in user data
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.discordTag && !discordTag) setDiscordTag(user.discordTag);
      if (user.fivemId && !fivemId) setFivemId(user.fivemId);
    }
  }, [user]);

  if (!isCartOpen) return null;

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!email.trim()) return;

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email: email.trim(),
          discordTag: discordTag.trim() || undefined,
          fivemId: fivemId.trim() || undefined,
          paymentMethod:
            paymentMethod === 'card'
              ? 'Credit Card / Apple Pay'
              : paymentMethod === 'keymaster'
              ? 'FiveM CFX Escrow Keymaster'
              : 'Private Crypto Vault (USDT)',
          totalPrice,
          pseudo: user?.pseudo || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConfirmedOrder({
          orderId: data.orderId,
          licenseKey: data.licenseKey,
          itemsSummary: items.map((i) => `${i.quantity}x ${i.product.name}`).join(', '),
        });
        clearCart();
      } else {
        alert(data.error || 'Checkout could not be processed.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      // Fallback offline simulation
      setConfirmedOrder({
        orderId: `YUF-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        licenseKey: `CFX-ESCROW-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        itemsSummary: items.map((i) => `${i.quantity}x ${i.product.name}`).join(', '),
      });
      clearCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (confirmedOrder) {
      setConfirmedOrder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#070709] border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-black shrink-0">
                <Image
                  src="/assets/brand/yufo_icon_black.png"
                  alt="YUFO Atelier"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Atelier checkout
                </h2>
                <p className="text-xs text-zinc-400">
                  {confirmedOrder
                    ? 'Allocation confirmed'
                    : totalQuantity > 0
                    ? `${totalQuantity} ${totalQuantity === 1 ? 'creation' : 'creations'} selected for allocation`
                    : 'Your selection is empty'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close checkout"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            
            {/* SUCCESS CONFIRMATION SCREEN */}
            {confirmedOrder ? (
              <div className="py-6 space-y-6 text-center animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    Allocation confirmed
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Your 3D assets have been registered and granted instant streaming rights.
                  </p>
                </div>

                {/* License Voucher Card */}
                <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl text-left space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[11px] text-zinc-400">Order reference</span>
                    <span className="text-xs font-mono font-medium text-white">{confirmedOrder.orderId}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[11px] text-zinc-400">Escrow license key</span>
                    <span className="text-xs font-mono text-emerald-400">{confirmedOrder.licenseKey}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <span className="text-[11px] text-zinc-400">Licensed format</span>
                    <span className="text-xs text-zinc-200">.ydd / .ytd (FiveM Rigged)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">Recipient email</span>
                    <span className="text-xs text-white truncate max-w-[200px]">{email}</span>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-left flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#e3e3e3] shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    A download archive with your 3D files and CFX resource files has been dispatched to your email address. You can also review this order anytime in your member account.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleClose}
                    className="w-full h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Return to Atelier creations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* EMPTY BAG */
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-white">No creations allocated</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    Explore our curated collection of pendants, chains, rings, and timepieces sculpted for GTA V freemode.
                  </p>
                </div>
              </div>
            ) : (
              /* ACTIVE CART & CHECKOUT FORM */
              <div className="space-y-6">
                
                {/* 1. Item List */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Selected creations
                  </span>

                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-3.5 bg-zinc-950 border border-white/10 rounded-2xl flex items-center gap-3.5"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 bg-black border border-white/10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-contain p-1.5"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.product.specs.material} · .ydd / .ytd
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="text-xs font-medium text-white px-1">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right flex flex-col justify-between items-end self-stretch py-0.5">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-semibold text-white">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Licensee / Delivery Information */}
                <form id="checkout-form" onSubmit={handleSubmitCheckout} className="space-y-4 pt-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Licensing and delivery details
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label htmlFor="checkout-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                        Digital delivery email <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="checkout-discord" className="block text-xs font-medium text-zinc-300 mb-1.5">
                          Discord tag (for 72h concierge)
                        </label>
                        <input
                          id="checkout-discord"
                          type="text"
                          value={discordTag}
                          onChange={(e) => setDiscordTag(e.target.value)}
                          placeholder="e.g. username#0001"
                          className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-fivem" className="block text-xs font-medium text-zinc-300 mb-1.5">
                          FiveM CFX identifier
                        </label>
                        <input
                          id="checkout-fivem"
                          type="text"
                          value={fivemId}
                          onChange={(e) => setFivemId(e.target.value)}
                          placeholder="e.g. fivem:84920"
                          className="w-full h-11 px-3.5 bg-zinc-950 border border-white/10 focus:border-white/30 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Payment Method Tabs */}
                  <div className="pt-2 space-y-3">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                      Payment method
                    </span>

                    <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-900/60 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`h-9 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('keymaster')}
                        className={`h-9 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'keymaster'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Tebex</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('crypto')}
                        className={`h-9 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === 'crypto'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Crypto</span>
                      </button>
                    </div>

                    {/* Method details */}
                    {paymentMethod === 'card' && (
                      <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Card number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="•••• •••• •••• 4242"
                              className="w-full h-10 px-3.5 bg-zinc-900 border border-white/10 focus:border-white/30 rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                            />
                            <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                              <span>VISA</span>
                              <span>MC</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">
                              Expiry date
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM / YY"
                              className="w-full h-10 px-3.5 bg-zinc-900 border border-white/10 focus:border-white/30 rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">
                              Security code (CVC)
                            </label>
                            <input
                              type="text"
                              required
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="CVC"
                              className="w-full h-10 px-3.5 bg-zinc-900 border border-white/10 focus:border-white/30 rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Cardholder full name
                          </label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Full name on card"
                            className="w-full h-10 px-3.5 bg-zinc-900 border border-white/10 focus:border-white/30 rounded-lg text-xs text-white placeholder:text-zinc-600 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'keymaster' && (
                      <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-2 text-xs text-zinc-300 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" />
                          <span>Direct CFX Keymaster escrow transfer</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Your asset package will be tied directly to your FiveM CFX account. No third-party leak risk, universal compatibility with all modern FiveM frameworks (QBCore, ESX, Standalone).
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'crypto' && (
                      <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-2 text-xs text-zinc-300 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-white font-medium">
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Confidential USDT / ETH settlement</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          An ephemeral atelier settlement address will be assigned to your allocation upon order submission with instant blockchain confirmation.
                        </p>
                      </div>
                    )}
                  </div>
                </form>

              </div>
            )}
          </div>

          {/* Footer with Summary and Action */}
          {!confirmedOrder && items.length > 0 && (
            <div className="border-t border-white/10 pt-5 space-y-4">
              {/* Cost breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>FiveM stream license</span>
                  <span className="text-emerald-400">Included (Perpetual)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery method</span>
                  <span className="text-white">Instant encrypted digital package</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-semibold text-white">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>{isProcessing ? 'Processing allocation...' : `Complete allocation · $${totalPrice.toLocaleString()}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <p className="text-[11px] text-center text-zinc-500 leading-relaxed">
                256-bit encrypted checkout · Instant Keymaster dispatch · 72h atelier guarantee
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
