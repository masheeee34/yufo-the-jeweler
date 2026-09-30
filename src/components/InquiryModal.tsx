'use client';

import React, { useState, useEffect } from 'react';
import { IconX, IconCheck, IconArrowRight } from '@tabler/icons-react';

interface InquiryModalProps {
  isOpen: boolean;
  initialSubject?: string;
  onClose: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, initialSubject = '', onClose }) => {
  const [reference, setReference] = useState(initialSubject);
  const [name, setName] = useState('');
  const [discord, setDiscord] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialSubject) {
      setReference(initialSubject);
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0a0a0d] border border-white/20 p-6 sm:p-8 z-10 text-white shadow-[0_25px_80px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 border border-white/10 hover:border-white/40 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Inquiry Desk"
        >
          <IconX size={15} />
        </button>

        <div className="space-y-1 mb-6">
          <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
            YUFO PRIVATE CONSULTATION
          </span>
          <h3 className="text-xl font-serif uppercase tracking-wide text-white">
            Direct Atelier Inquiry
          </h3>
          <p className="text-xs text-zinc-400 font-light font-mono">
            1-of-1 Bespoke Commission · Priority evaluation by Yufo master jewelers.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-3 font-mono">
            <div className="w-12 h-12 border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <IconCheck size={20} />
            </div>
            <h4 className="text-base font-bold uppercase tracking-wider text-white">Inquiry Transmitted</h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto font-light leading-relaxed">
              Your dossier has been logged. The atelier will reach out to you directly on Discord.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-medium">
                Piece Object or Asset Reference *
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. 1-of-1 Diamond Medallion or Rolex Ref."
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-medium">
                Client Alias or FiveM In-Game Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your character or collector name"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-medium">
                Discord Handle or CFX ID *
              </label>
              <input
                type="text"
                required
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="username#0000"
                className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.25em] text-zinc-400 mb-1.5 font-medium">
                Project Details &amp; Budget Target *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Desired carats, gold type, 3D references, server destination..."
                className="w-full p-3 bg-black/60 border border-white/15 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-white text-black hover:bg-neutral-200 text-[10px] font-bold uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
            >
              <span>Transmit to Atelier Concierge</span>
              <IconArrowRight size={13} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
