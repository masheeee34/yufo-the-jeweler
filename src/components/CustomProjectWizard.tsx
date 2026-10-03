'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandDiscord,
  IconCheck,
  IconPhotoPlus,
  IconX,
} from '@tabler/icons-react';
import { LoaderOne } from './LoaderOne';

export const DISCORD_INVITE = 'https://discord.gg/yufothejeweler';

const CATEGORIES = [
  { value: 'Custom 3D medallion & pendant (.ydd / .ytd)', label: 'Medallion & pendant', hint: 'Logos, emblems, portraits' },
  { value: 'Heavy cuban link & choker (spine2 rigged)', label: 'Chain & cuban link', hint: 'Heavy links, chokers' },
  { value: 'Haute horlogerie / iced watch (left hand bone)', label: 'Iced watch', hint: 'Timepieces, bezels' },
  { value: 'Bespoke signet & eternity ring (hand bone)', label: 'Ring', hint: 'Signets, eternity bands' },
  { value: 'Diamond grillz & teeth caps (jaw rigged)', label: 'Grillz', hint: 'Teeth caps, fangs' },
  { value: 'Full bust & multi-chain showcase (1-of-1 exclusive)', label: 'Full set', hint: 'Multi-piece 1-of-1' },
];

const PED_TARGETS = ['Universal (male & female)', 'Male freemode', 'Female freemode', 'Custom ped'];

// Tranches affichées sur les curseurs : à ajuster selon les tarifs de l'atelier.
// Valeurs par défaut ; les vraies tranches se règlent dans le back-office (Settings › Custom orders).
const DEFAULT_DURATIONS = ['1 week', '2 weeks', '4 weeks', '6 weeks', '8+ weeks'];
const DEFAULT_BUDGETS = ['$50', '$100', '$250', '$500', '$1K+'];

interface WizardConfig {
  mode: 'open' | 'limited' | 'closed';
  budgets: string[];
  durations: string[];
  note: string;
  startingPrice?: number;
  intro: string;
}

const STEPS = ['Your project', 'Your vision', 'Timeline & budget', 'Review'];

const MAX_IMAGES = 6;

interface RefImage {
  key: string;
  preview: string;
  name?: string;
  status: 'uploading' | 'done' | 'error';
}

// Réduit les grosses photos (max 1600 px, JPEG) avant l'envoi : plus rapide, surtout sur mobile.
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif' || typeof createImageBitmap === 'undefined') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    return blob || file;
  } catch {
    return file;
  }
}

function StepSlider({
  id,
  label,
  valueLabel,
  ticks,
  index,
  onChange,
}: {
  id: string;
  label: string;
  valueLabel: string;
  ticks: string[];
  index: number;
  onChange: (i: number) => void;
}) {
  const pct = (index / (ticks.length - 1)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-xs font-medium text-zinc-400">{label}</label>
        <span key={valueLabel} className="wiz-pop text-base font-semibold text-white">{valueLabel}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={ticks.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={valueLabel}
        className="wiz-range"
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-[11px] text-zinc-500 tabular-nums">
        {ticks.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(i)}
            className={`transition-colors ${i === index ? 'text-white font-semibold' : 'hover:text-zinc-300'}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CustomProjectWizard({
  referencedPiece,
  onClearReference,
}: {
  referencedPiece: string;
  onClearReference: () => void;
}) {
  const { user, loading, startDiscordAuth } = useAuth();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [category, setCategory] = useState('');
  const [pedTarget, setPedTarget] = useState(PED_TARGETS[0]);
  const [vision, setVision] = useState('');
  const [durationIndex, setDurationIndex] = useState(2);
  const [budgetIndex, setBudgetIndex] = useState(2);
  const [cfg, setCfg] = useState<WizardConfig>({ mode: 'open', budgets: DEFAULT_BUDGETS, durations: DEFAULT_DURATIONS, note: '', intro: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const c = d.customOrders;
        if (!c) return;
        const budgets = Array.isArray(c.budgets) && c.budgets.length > 1 ? c.budgets : DEFAULT_BUDGETS;
        const durations = Array.isArray(c.durations) && c.durations.length > 1 ? c.durations : DEFAULT_DURATIONS;
        setCfg({ mode: c.mode || 'open', budgets, durations, note: c.note || '', startingPrice: c.startingPrice, intro: d.general?.customPageIntro || '' });
        setBudgetIndex((i) => Math.min(i, budgets.length - 1));
        setDurationIndex((i) => Math.min(i, durations.length - 1));
      })
      .catch(() => {});
  }, []);

  const DURATIONS = cfg.durations;
  const BUDGETS = cfg.budgets;
  const DURATION_TICKS = DURATIONS.map((d) => d.split(' ')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [images, setImages] = useState<RefImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = images.some((img) => img.status === 'uploading');

  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
    const room = MAX_IMAGES - images.length;
    if (files.length > room) setError(`You can attach up to ${MAX_IMAGES} images.`);
    files.slice(0, Math.max(0, room)).forEach(async (file) => {
      const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { key, preview, status: 'uploading' }]);
      try {
        const fd = new FormData();
        fd.append('file', await shrinkImage(file), file.name);
        const res = await fetch('/api/uploads', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        setImages((prev) => prev.map((img) => (img.key === key ? { ...img, name: data.name, status: 'done' } : img)));
      } catch (e: any) {
        setError(e.message || 'An image could not be uploaded.');
        setImages((prev) => prev.map((img) => (img.key === key ? { ...img, status: 'error' } : img)));
      }
    });
  };

  const removeImage = (key: string) =>
    setImages((prev) => {
      const img = prev.find((i) => i.key === key);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.key !== key);
    });

  const canContinue =
    (step === 0 && !!category) ||
    (step === 1 && vision.trim().length >= 15 && !uploading) ||
    step === 2 ||
    step === 3;

  const go = (next: number) => {
    setError('');
    setDirection(next > step ? 'forward' : 'back');
    setStep(next);
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          pedTarget,
          vision: vision.trim(),
          referencedPiece,
          duration: DURATIONS[durationIndex],
          budget: BUDGETS[budgetIndex],
          attachments: images.filter((img) => img.status === 'done').map((img) => img.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Your request could not be sent.');
      setTicketId(data.inquiryId);
      setDirection('forward');
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const discordButton = (
    <a
      href={DISCORD_INVITE}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#5865F2]/15 text-[#aab1ff] hover:bg-[#5865F2]/25 text-[11px] font-semibold transition-colors"
    >
      <IconBrandDiscord size={14} />
      <span>Join our Discord</span>
    </a>
  );

  // Commandes sur mesure fermées depuis le back-office
  if (cfg.mode === 'closed' && step !== 4) {
    return (
      <div className="wiz-card wiz-in-forward">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Custom project</span>
          {discordButton}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Custom orders are closed for now</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">{cfg.note || 'Our jewelers are fully booked. Join our Discord to be the first to know when new slots open.'}</p>
      </div>
    );
  }

  // Connexion Discord obligatoire avant toute demande
  if (!loading && !user) {
    return (
      <div className="wiz-card wiz-in-forward">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Custom project</span>
          {discordButton}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Sign in with Discord to start</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-7">
          Every custom request is tied to your Discord account, so we can reply to you on the site and on our server.
        </p>
        <button
          type="button"
          onClick={startDiscordAuth}
          className="w-full h-12 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <IconBrandDiscord size={18} />
          <span>Continue with Discord</span>
        </button>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="wiz-card wiz-in-forward text-left">
        <div className="wiz-check mb-5">
          <IconCheck size={22} stroke={2.5} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Request sent</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">
          We will reply to you directly on the site. You can follow the conversation from your account.
        </p>
        <p className="text-[11px] text-zinc-500 mb-1">Reference</p>
        <p className="font-mono text-lg text-white mb-7">{ticketId}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="flex-1 h-11 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center justify-center transition-colors"
          >
            View my requests
          </Link>
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noreferrer"
            className="flex-1 h-11 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <IconBrandDiscord size={15} />
            <span>Join our Discord</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="wiz-card">
      {/* En-tête : progression + accès Discord */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          Step {step + 1} of {STEPS.length}
        </span>
        {discordButton}
      </div>
      {cfg.intro && step === 0 && <p className="mb-2 text-sm text-zinc-300 leading-relaxed">{cfg.intro}</p>}
      {(cfg.mode === 'limited' || cfg.note || cfg.startingPrice) && step === 0 && (
        <p className="mb-4 text-[12px] text-zinc-400">
          {cfg.startingPrice ? <>Custom pieces from <b className="text-white">${cfg.startingPrice}</b>. </> : null}
          {cfg.mode === 'limited' && <span className="text-amber-300">Limited slots available. </span>}
          {cfg.note}
        </p>
      )}
      <div className="grid grid-cols-4 gap-1.5 mb-8" aria-hidden="true">
        {STEPS.map((s, i) => (
          <div key={s} className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className={`wiz-bar h-full rounded-full bg-white ${i <= step ? 'is-on' : ''}`} />
          </div>
        ))}
      </div>

      <div key={step} className={direction === 'forward' ? 'wiz-in-forward' : 'wiz-in-back'}>
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">What would you like us to create?</h2>
            {referencedPiece && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="truncate text-zinc-300">Inspired by <span className="text-white font-semibold">{referencedPiece}</span></span>
                <button type="button" onClick={onClearReference} aria-label="Remove reference" className="text-zinc-400 hover:text-white">
                  <IconX size={14} />
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Type of piece">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={category === c.value}
                  onClick={() => setCategory(c.value)}
                  className={`wiz-option text-left p-3.5 rounded-xl border ${
                    category === c.value ? 'border-white bg-white/10 is-selected' : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                  }`}
                >
                  <span className="block text-sm font-semibold text-white">{c.label}</span>
                  <span className="block text-[11px] text-zinc-500 mt-0.5">{c.hint}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2.5">Who will wear it?</p>
              <div className="flex flex-wrap gap-2">
                {PED_TARGETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPedTarget(p)}
                    className={`h-9 px-4 rounded-full text-xs font-medium border transition-colors ${
                      pedTarget === p ? 'bg-white text-zinc-950 border-white' : 'border-white/15 text-zinc-300 hover:border-white/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">Tell us about your vision</h2>
            <p className="text-sm text-zinc-400">Design, text or engraving, stones, colors, references. The more detail, the better.</p>
            <textarea
              autoFocus
              rows={5}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              onPaste={(e) => {
                const pasted = Array.from(e.clipboardData.files);
                if (pasted.length) {
                  e.preventDefault();
                  addFiles(pasted);
                }
              }}
              placeholder="Example: a gold medallion of my crew logo, iced-out edges, with our name engraved on the back..."
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 focus:border-white/40 focus:outline-none text-sm text-white placeholder-zinc-600 leading-relaxed resize-none transition-colors"
            />
            <p className={`text-[11px] transition-colors ${vision.trim().length >= 15 ? 'text-zinc-600' : 'text-zinc-500'}`}>
              {vision.trim().length < 15 ? 'A few more words to continue' : `${vision.trim().length} characters`}
            </p>

            {/* Images de référence (facultatives) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              className={`rounded-xl border border-dashed p-3 transition-colors ${
                dragOver ? 'border-white/50 bg-white/[0.06]' : 'border-white/15 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-xs font-medium text-zinc-300">Reference images</span>
                <span className="text-[11px] text-zinc-500">Optional · {images.length}/{MAX_IMAGES}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                  <div key={img.key} className="wiz-pop relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className={`w-full h-full object-cover ${img.status === 'done' ? '' : 'opacity-40'}`} />
                    {img.status === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LoaderOne size={6} />
                      </div>
                    )}
                    {img.status === 'error' && (
                      <span className="absolute inset-x-0 bottom-0 text-[9px] text-center bg-rose-600/80 text-white py-0.5">Failed</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.key)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                      aria-label="Remove image"
                    >
                      <IconX size={11} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border border-white/15 hover:border-white/40 hover:bg-white/[0.05] text-zinc-400 hover:text-white flex flex-col items-center justify-center gap-1 transition-colors"
                    aria-label="Add reference images"
                  >
                    <IconPhotoPlus size={18} stroke={1.6} />
                    <span className="text-[9px]">Add</span>
                  </button>
                )}
                {images.length === 0 && (
                  <p className="flex-1 min-w-[140px] self-center text-[11px] text-zinc-500 leading-snug">
                    Drop, paste or pick photos: sketches, logos, inspiration.
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">How long can you wait, and what's your budget?</h2>
            <StepSlider
              id="wiz-duration"
              label="Delivery time:"
              valueLabel={DURATIONS[durationIndex]}
              ticks={DURATION_TICKS}
              index={durationIndex}
              onChange={setDurationIndex}
            />
            <StepSlider
              id="wiz-budget"
              label="Budget:"
              valueLabel={BUDGETS[budgetIndex]}
              ticks={BUDGETS}
              index={budgetIndex}
              onChange={setBudgetIndex}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">Ready to send?</h2>
            <dl className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] text-sm">
              {[
                ['Piece', CATEGORIES.find((c) => c.value === category)?.label || '-'],
                ['Worn by', pedTarget],
                ['Delivery', DURATIONS[durationIndex]],
                ['Budget', BUDGETS[budgetIndex]],
                ['Images', String(images.filter((img) => img.status === 'done').length || 'None')],
                ['Discord', user?.pseudo || '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="text-white font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-zinc-500 line-clamp-3 whitespace-pre-line">{vision.trim()}</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">{error}</p>
      )}

      <div className="flex items-center justify-between mt-9">
        <button
          type="button"
          onClick={() => go(step - 1)}
          className={`h-11 px-4 rounded-full text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors ${step === 0 ? 'invisible' : ''}`}
        >
          <IconArrowLeft size={14} />
          <span>Back</span>
        </button>
        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={() => (step === 3 ? submit() : go(step + 1))}
          className="wiz-next h-11 px-7 rounded-full bg-white text-zinc-950 text-xs font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>{step === 3 ? (submitting ? 'Sending...' : 'Send request') : 'Next'}</span>
          {!submitting && <IconArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
