'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandDiscord,
  IconCheck,
  IconCurrencyDollar,
  IconFileText,
  IconPencil,
  IconPhoto,
  IconPhotoPlus,
  IconPlus,
  IconSparkles,
  IconTruckDelivery,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { LoaderOne } from './LoaderOne';
import { NumberTicker } from './NumberTicker';
import { TabSelect } from './TabSelect';
import { DEFAULT_WIZARD, fill, WizardSettings, WizardTextKey } from '../lib/wizardDefaults';

export const DISCORD_INVITE = 'https://discord.gg/yufothejeweler';

// Tranches du curseur de délai : valeurs par défaut, réglées dans Management › Settings › Custom orders.
const DEFAULT_DURATIONS = ['1 week', '2 weeks', '4 weeks', '6 weeks', '8+ weeks'];

interface WizardConfig {
  budgetMin: number;
  budgetStep: number;
  mode: 'open' | 'limited' | 'closed';
  durations: string[];
  note: string;
  startingPrice?: number;
  intro: string;
  wizard: WizardSettings;
}

type StepId = 'piece' | 'brief' | 'timing' | 'review';



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

// Budget : compteur animé, du minimum réglé dans Management, par paliers (+5 $ par défaut), sans plafond.
function BudgetPicker({ value, min, step, onChange, label, hint }: { value: number; min: number; step: number; onChange: (v: number) => void; label: string; hint: string }) {
  const hold = useRef<number | null>(null);
  const cur = useRef(value);
  cur.current = value;
  const round = (n: number) => Math.round(n * 100) / 100;
  const bump = (dir: 1 | -1) => {
    cur.current = round(Math.max(min, cur.current + dir * step));
    onChange(cur.current);
  };
  const stop = () => {
    if (hold.current !== null) window.clearTimeout(hold.current);
    hold.current = null;
  };
  // Appui maintenu : le compteur avance de plus en plus vite.
  const start = (dir: 1 | -1) => {
    stop();
    bump(dir);
    let delay = 260;
    const tick = () => {
      bump(dir);
      delay = Math.max(60, delay * 0.85);
      hold.current = window.setTimeout(tick, delay);
    };
    hold.current = window.setTimeout(tick, 420);
  };
  useEffect(() => stop, []);
  const btn = 'w-12 h-12 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/[0.06] text-white text-xl flex items-center justify-center transition-colors select-none disabled:opacity-30';
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
        <button type="button" aria-label="Lower budget" className={btn} disabled={value <= min}
          onPointerDown={() => start(-1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>−</button>
        <NumberTicker value={value} prefix="$" className="text-4xl sm:text-5xl font-semibold text-white" />
        <button type="button" aria-label="Raise budget" className={btn}
          onPointerDown={() => start(1)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}>+</button>
      </div>
      {hint && <p className="text-[11px] text-zinc-500 text-center">{fill(hint, { min: min.toFixed(2), step: step % 1 ? step.toFixed(2) : step })}</p>}
    </div>
  );
}

// Ligne du récapitulatif : icône, libellé, valeur et bouton « Edit » qui ramène à l'étape.
function ReviewItem({ icon, label, children, onEdit, editLabel, delay }: { icon: React.ReactNode; label: string; children: React.ReactNode; onEdit?: () => void; editLabel: string; delay: number }) {
  return (
    <div className="wiz-review-row flex items-start gap-3 min-w-0" style={{ animationDelay: `${delay}ms` }}>
      <span className="mt-0.5 shrink-0 text-zinc-500">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-zinc-500">{label}</p>
        <div className="text-[13px] text-white font-medium mt-0.5 break-words">{children}</div>
      </div>
      {onEdit && <EditButton onClick={onEdit} label={editLabel} />}
    </div>
  );
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 inline-flex items-center gap-1 h-7 px-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] hover:border-white/25 text-[11px] font-medium text-zinc-200 transition-colors"
    >
      <IconPencil size={12} />
      {label}
    </button>
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
  const [sent, setSent] = useState(false);
  const [fromReview, setFromReview] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [category, setCategory] = useState('');
  const [peds, setPeds] = useState<string[]>([DEFAULT_WIZARD.pedOptions[0]]);
  const [vision, setVision] = useState('');
  const [durationIndex, setDurationIndex] = useState(2);
  const [budget, setBudget] = useState(24.99);
  const [discordUrl, setDiscordUrl] = useState(DISCORD_INVITE);
  const [cfg, setCfg] = useState<WizardConfig>({ mode: 'open', durations: DEFAULT_DURATIONS, note: '', intro: '', budgetMin: 24.99, budgetStep: 5, wizard: DEFAULT_WIZARD });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const c = d.customOrders;
        if (!c) return;
        const durations = Array.isArray(c.durations) && c.durations.length > 1 ? c.durations : DEFAULT_DURATIONS;
        const budgetMin = Number(c.budgetMin) >= 0 ? Number(c.budgetMin) : 24.99;
        const wizard: WizardSettings = { ...DEFAULT_WIZARD, ...d.wizard, texts: { ...DEFAULT_WIZARD.texts, ...d.wizard?.texts } };
        setCfg({ mode: c.mode || 'open', durations, note: c.note || '', startingPrice: c.startingPrice, intro: d.general?.customPageIntro || '', budgetMin, budgetStep: Number(c.budgetStep) || 5, wizard });
        if (d.general?.discordInvite) setDiscordUrl(d.general.discordInvite);
        setBudget(budgetMin);
        setPeds((p) => {
          const kept = p.filter((x) => wizard.pedOptions.includes(x));
          return kept.length ? kept : wizard.pedOptions.slice(0, 1);
        });
        setDurationIndex((i) => Math.min(i, durations.length - 1));
      })
      .catch(() => {});
  }, []);

  const W = cfg.wizard;
  // Texte réglable dans Management ; texte d'origine si le champ est laissé vide.
  const t = (k: WizardTextKey) => W.texts[k] || DEFAULT_WIZARD.texts[k];
  const STEPS: StepId[] = ['piece', 'brief', ...(W.askDuration || W.askBudget ? (['timing'] as StepId[]) : []), 'review'];
  const at = Math.min(step, STEPS.length - 1);
  const current = STEPS[at];
  const indexOf = (id: StepId) => STEPS.indexOf(id);

  const DURATIONS = cfg.durations;
  const DURATION_TICKS = DURATIONS.map((d) => d.split(' ')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [images, setImages] = useState<RefImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = W.maxImages;
  const uploading = images.some((img) => img.status === 'uploading');
  const doneImages = images.filter((img) => img.status === 'done');
  const pieceLabel = W.pieces.find((p) => p.label === category)?.label || category;

  const addFiles = (list: FileList | File[]) => {
    if (!W.askImages) return;
    const files = Array.from(list).filter((f) => f.type.startsWith('image/'));
    const room = maxImages - images.length;
    if (files.length > room) setError(`You can attach up to ${maxImages} images.`);
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

  const briefOk = vision.trim().length >= W.minBriefLength;
  const canContinue =
    (current === 'piece' && !!category && (!W.askPed || peds.length > 0)) ||
    (current === 'brief' && briefOk && !uploading) ||
    current === 'timing' ||
    current === 'review';

  const go = (next: number) => {
    setError('');
    setDirection(next > at ? 'forward' : 'back');
    setStep(next);
  };
  // Depuis le récapitulatif : on modifie une réponse puis on y revient directement.
  const edit = (id: StepId) => {
    setFromReview(true);
    go(indexOf(id));
  };
  const next = () => {
    if (current === 'review') return submit();
    if (fromReview) {
      setFromReview(false);
      return go(indexOf('review'));
    }
    go(at + 1);
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
          pedTarget: W.askPed ? peds : [],
          vision: vision.trim(),
          referencedPiece,
          duration: W.askDuration ? DURATIONS[durationIndex] : '',
          budget: W.askBudget ? `$${budget.toFixed(2)}` : '',
          attachments: W.askImages ? doneImages.map((img) => img.name) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Your request could not be sent.');
      setTicketId(data.inquiryId);
      setDirection('forward');
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const discordButton = W.showDiscordButton ? (
    <a
      href={discordUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#5865F2]/15 text-[#aab1ff] hover:bg-[#5865F2]/25 text-[11px] font-semibold transition-colors"
    >
      <IconBrandDiscord size={14} />
      <span>{t('discordButton')}</span>
    </a>
  ) : null;

  // Commandes sur mesure fermées depuis le back-office
  if (cfg.mode === 'closed' && !sent) {
    return (
      <div className="wiz-card wiz-in-forward">
        {discordButton && <div className="flex justify-end mb-6">{discordButton}</div>}
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">{t('closedTitle')}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">{cfg.note || t('closedText')}</p>
      </div>
    );
  }

  // Connexion Discord obligatoire avant toute demande
  if (!loading && !user) {
    return (
      <div className="wiz-card wiz-in-forward">
        {discordButton && <div className="flex justify-end mb-6">{discordButton}</div>}
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">{t('signInTitle')}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-7">{t('signInText')}</p>
        <button
          type="button"
          onClick={startDiscordAuth}
          className="w-full h-12 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <IconBrandDiscord size={18} />
          <span>{t('signInButton')}</span>
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="wiz-card wiz-in-forward text-left">
        <div className="wiz-check mb-5">
          <IconCheck size={22} stroke={2.5} />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">{t('sentTitle')}</h2>
        <p className="text-sm text-zinc-400 leading-relaxed mb-5">{t('sentText')}</p>
        <p className="text-[11px] text-zinc-500 mb-1">Reference</p>
        <p className="font-mono text-lg text-white mb-7">{ticketId}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/account"
            className="flex-1 h-11 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold flex items-center justify-center transition-colors"
          >
            {t('sentButton')}
          </Link>
          {W.showDiscordButton && (
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 h-11 rounded-full bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <IconBrandDiscord size={15} />
              <span>{t('discordButton')}</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // « 1 image » au singulier pour le texte anglais d'origine.
  const imagesText = !doneImages.length
    ? t('noImages')
    : fill(doneImages.length === 1 ? t('imagesCount').replace(/images/, 'image') : t('imagesCount'), { n: doneImages.length });
  const editLabel = t('editButton');

  return (
    <div className="wiz-card">
      {/* En-tête : progression + accès Discord */}
      <div className="flex items-center justify-between gap-3 mb-4 min-h-8">
        <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          {fill(t('stepLabel'), { n: at + 1, total: STEPS.length })}
        </span>
        {discordButton}
      </div>
      {cfg.intro && current === 'piece' && <p className="mb-2 text-sm text-zinc-300 leading-relaxed">{cfg.intro}</p>}
      {(cfg.mode === 'limited' || cfg.note || cfg.startingPrice) && current === 'piece' && (
        <p className="mb-4 text-[12px] text-zinc-400">
          {cfg.startingPrice ? <>Custom pieces from <b className="text-white">${cfg.startingPrice}</b>. </> : null}
          {cfg.mode === 'limited' && <span className="text-amber-300">Limited slots available. </span>}
          {cfg.note}
        </p>
      )}
      <div className="grid gap-1.5 mb-8" style={{ gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {STEPS.map((s, i) => (
          <div key={s} className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div className={`wiz-bar h-full rounded-full bg-white ${i <= at ? 'is-on' : ''}`} />
          </div>
        ))}
      </div>

      <div key={current} className={direction === 'forward' ? 'wiz-in-forward' : 'wiz-in-back'}>
        {current === 'piece' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{t('pieceTitle')}</h2>
            {referencedPiece && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="truncate text-zinc-300">Inspired by <span className="text-white font-semibold">{referencedPiece}</span></span>
                <button type="button" onClick={onClearReference} aria-label="Remove reference" className="text-zinc-400 hover:text-white">
                  <IconX size={14} />
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label={t('pieceTitle')}>
              {W.pieces.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  role="radio"
                  aria-checked={category === c.label}
                  onClick={() => setCategory(c.label)}
                  className={`wiz-option text-left p-3.5 rounded-xl border ${
                    category === c.label ? 'border-white bg-white/10 is-selected' : 'border-white/10 bg-white/[0.03] hover:border-white/30'
                  }`}
                >
                  <span className="block text-sm font-semibold text-white">{c.label}</span>
                  {c.hint && <span className="block text-[11px] text-zinc-500 mt-0.5">{c.hint}</span>}
                </button>
              ))}
            </div>
            {W.askPed && (
              <div>
                <p className="text-xs font-medium text-zinc-400 mb-2.5">{t('pedLabel')}</p>
                <TabSelect options={W.pedOptions} value={peds} onChange={setPeds} multiple={W.pedMultiple} label={t('pedLabel')} />
                {W.pedMultiple && t('pedMultiNote') && (
                  <p className={`mt-2.5 text-[11px] leading-snug transition-colors duration-300 ${peds.length > 1 ? 'text-amber-200/90' : 'text-zinc-500'}`}>
                    {t('pedMultiNote')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {current === 'brief' && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{t('briefTitle')}</h2>
            {t('briefText') && <p className="text-sm text-zinc-400">{t('briefText')}</p>}
            <textarea
              autoFocus
              rows={5}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              onPaste={(e) => {
                const pasted = Array.from(e.clipboardData.files);
                if (pasted.length && W.askImages) {
                  e.preventDefault();
                  addFiles(pasted);
                }
              }}
              placeholder={t('briefPlaceholder')}
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 focus:border-white/40 focus:outline-none text-sm text-white placeholder-zinc-600 leading-relaxed resize-none transition-colors"
            />
            {W.minBriefLength > 0 && (
              <p className={`text-[11px] transition-colors ${briefOk ? 'text-zinc-600' : 'text-zinc-500'}`}>
                {briefOk ? `${vision.trim().length} characters` : t('briefTooShort')}
              </p>
            )}

            {/* Images de référence (facultatives) */}
            {W.askImages && (
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
                  <span className="text-xs font-medium text-zinc-300">{t('imagesLabel')}</span>
                  <span className="text-[11px] text-zinc-500">Optional · {images.length}/{maxImages}</span>
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
                  {images.length < maxImages && (
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
                  {images.length === 0 && t('imagesHint') && (
                    <p className="flex-1 min-w-[140px] self-center text-[11px] text-zinc-500 leading-snug">{t('imagesHint')}</p>
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
            )}
          </div>
        )}

        {current === 'timing' && (
          <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{t('timingTitle')}</h2>
            {W.askDuration && (
              <StepSlider
                id="wiz-duration"
                label={t('durationLabel')}
                valueLabel={DURATIONS[durationIndex]}
                ticks={DURATION_TICKS}
                index={durationIndex}
                onChange={setDurationIndex}
              />
            )}
            {W.askBudget && (
              <BudgetPicker value={budget} min={cfg.budgetMin} step={cfg.budgetStep} onChange={setBudget} label={t('budgetLabel')} hint={t('budgetHint')} />
            )}
          </div>
        )}

        {current === 'review' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{t('reviewTitle')}</h2>
              {t('reviewText') && <p className="text-sm text-zinc-400 mt-1">{t('reviewText')}</p>}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/[0.07]">
              {/* Pièce */}
              <div className="wiz-review-row flex items-start gap-4 p-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center text-zinc-500">
                  {doneImages[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doneImages[0].preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <IconSparkles size={22} stroke={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{t('reviewEyebrow')}</p>
                  <p className="text-base sm:text-lg font-semibold text-white mt-1 truncate">
                    {user?.pseudo ? `${user.pseudo} — ` : ''}{pieceLabel}
                  </p>
                  {vision.trim() && <p className="text-[12px] text-zinc-400 mt-1 line-clamp-2">{vision.trim()}</p>}
                </div>
                <EditButton onClick={() => edit('piece')} label={editLabel} />
              </div>

              {/* Ped, délai, budget, nombre d'images */}
              {(W.askPed || W.askDuration || W.askBudget || W.askImages) && (
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 p-4">
                  {W.askPed && (
                    <ReviewItem icon={<IconUser size={16} />} label={t('madeForLabel')} onEdit={() => edit('piece')} editLabel={editLabel} delay={60}>
                      {peds.join(', ')}
                    </ReviewItem>
                  )}
                  {W.askDuration && (
                    <ReviewItem icon={<IconTruckDelivery size={16} />} label={t('durationReviewLabel')} onEdit={() => edit('timing')} editLabel={editLabel} delay={100}>
                      {DURATIONS[durationIndex]}
                    </ReviewItem>
                  )}
                  {W.askBudget && (
                    <ReviewItem icon={<IconCurrencyDollar size={16} />} label={t('budgetReviewLabel')} onEdit={() => edit('timing')} editLabel={editLabel} delay={140}>
                      ${budget.toFixed(2)}
                    </ReviewItem>
                  )}
                  {W.askImages && (
                    <ReviewItem icon={<IconPhoto size={16} />} label={t('referencesLabel')} onEdit={() => edit('brief')} editLabel={editLabel} delay={180}>
                      {imagesText}
                    </ReviewItem>
                  )}
                </div>
              )}

              {/* Brief */}
              <div className="p-4">
                <ReviewItem icon={<IconFileText size={16} />} label={t('yourBriefLabel')} onEdit={() => edit('brief')} editLabel={editLabel} delay={220}>
                  <span className="block font-normal text-zinc-200 whitespace-pre-line line-clamp-4">{vision.trim() || '-'}</span>
                </ReviewItem>
              </div>

              {/* Images de référence */}
              {W.askImages && (
                <div className="p-4">
                  <ReviewItem icon={<IconPhoto size={16} />} label={t('referenceImagesLabel')} onEdit={() => edit('brief')} editLabel={editLabel} delay={260}>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {doneImages.slice(0, 3).map((img) => (
                        <div key={img.key} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => edit('brief')}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-white flex flex-col items-center justify-center gap-1 transition-colors"
                      >
                        <IconPlus size={16} />
                        <span className="text-[10px] font-normal">{imagesText}</span>
                      </button>
                    </div>
                  </ReviewItem>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">{error}</p>
      )}

      <div className="flex items-center justify-between mt-9">
        <button
          type="button"
          onClick={() => {
            setFromReview(false);
            go(at - 1);
          }}
          className={`h-11 px-4 rounded-full text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors ${at === 0 ? 'invisible' : ''}`}
        >
          <IconArrowLeft size={14} />
          <span>{t('backButton')}</span>
        </button>
        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={next}
          className="wiz-next h-11 px-7 rounded-full bg-white text-zinc-950 text-xs font-semibold flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>{current === 'review' ? (submitting ? t('sendingButton') : t('sendButton')) : fromReview ? t('backToReview') : t('nextButton')}</span>
          {!submitting && <IconArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
