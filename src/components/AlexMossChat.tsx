'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MessageAttachments } from './MessageAttachments';
import {
  MessageSquare,
  X,
  ArrowRight,
  ArrowUp,
  Clock,
  RefreshCw,
} from 'lucide-react';

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
  project?: { stage: string };
}

export const AlexMossChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<ClientRequest | null>(null);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [pseudo, setPseudo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Follow-up field
  const [replyMessage, setReplyMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing request from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem('yufo_active_request_id');
    if (savedId) {
      fetchRequestStatus(savedId);
    }
  }, []);

  // Poll request status when open
  useEffect(() => {
    if (!isOpen || !activeRequest?.id) return;
    const interval = setInterval(() => {
      fetchRequestStatus(activeRequest.id, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, activeRequest?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRequest?.messages]);

  const fetchRequestStatus = async (id: string, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/chat?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveRequest(data.request);
      } else if (res.status === 404) {
        localStorage.removeItem('yufo_active_request_id');
        setActiveRequest(null);
      }
    } catch (e) {
      console.error('Failed to sync chat request:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim() || !subject.trim() || !message.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo, subject, message }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRequest(data.request);
        localStorage.setItem('yufo_active_request_id', data.request.id);
        setMessage('');
      } else {
        alert('An error occurred while submitting your inquiry. Please try again.');
      }
    } catch (e) {
      console.error('Error submitting chat request:', e);
    } finally {
      setLoading(false);
    }
  };

  // Le client valide la preview 3D envoyée par l'atelier.
  const handleApprovePreview = async () => {
    if (!activeRequest) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeRequest.id }),
      });
      if (res.ok) await fetchRequestStatus(activeRequest.id, true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !replyMessage.trim()) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeRequest.id, message: replyMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRequest(data.request);
        setReplyMessage('');
      }
    } catch (e) {
      console.error('Error sending follow-up:', e);
    }
  };

  const getRemainingHours = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expired';
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m remaining`;
  };

  return (
    <>
      {/* Floating Trigger Button — Minimal Luxury Pill */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 select-none">
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 px-4 py-2.5 bg-zinc-950/95 hover:bg-black text-white border border-white/10 hover:border-white/25 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-200 cursor-pointer"
            aria-label="Open atelier concierge"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
            </div>
            
            <div className="flex items-center">
              <span className="text-xs font-semibold tracking-tight text-white">
                Concierge
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Main Concierge Panel — Clean, Modern, Anti-Look IA */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[580px] max-h-[85vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col justify-between select-none overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="px-5 py-4 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-black shrink-0">
                <Image
                  src="/assets/brand/yufo_icon_black.png"
                  alt="YUFO Concierge"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-white tracking-tight">
                    YUFO Concierge
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Direct desk with our master jeweler
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          {!activeRequest ? (
            /* --- 1. CONVERSATIONAL INTAKE FORM --- */
            <form onSubmit={handleCreateRequest} className="p-5 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                {/* Welcoming jeweler note */}
                <div className="flex items-start gap-2.5">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-black shrink-0 mt-0.5">
                    <Image
                      src="/assets/brand/yufo_icon_black.png"
                      alt="YUFO Jeweler"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-zinc-900/70 border border-white/5 rounded-2xl rounded-tl-sm p-3.5 text-xs text-zinc-300 leading-relaxed max-w-[90%]">
                    Welcome to YUFO. Leave your details below to open a private 72-hour line with our jeweler for custom 3D pieces, pendants, and FiveM character rigging.
                  </div>
                </div>

                {/* Field 1: Discord / FiveM */}
                <div>
                  <label htmlFor="chat-pseudo" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Discord or FiveM tag
                  </label>
                  <input
                    id="chat-pseudo"
                    type="text"
                    required
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    placeholder="e.g. collector#0001 or Steam ID"
                    className="w-full h-10 px-3.5 bg-zinc-900/50 border border-white/5 focus:border-white/20 focus:bg-zinc-900 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none transition-all"
                  />
                </div>

                {/* Field 2: Commission Subject */}
                <div>
                  <label htmlFor="chat-subject" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Commission subject
                  </label>
                  <input
                    id="chat-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. 1-of-1 medallion, timepiece, or chain"
                    className="w-full h-10 px-3.5 bg-zinc-900/50 border border-white/5 focus:border-white/20 focus:bg-zinc-900 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none transition-all"
                  />
                </div>

                {/* Field 3: Project Specifications */}
                <div>
                  <label htmlFor="chat-message" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Project specifications
                  </label>
                  <textarea
                    id="chat-message"
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Dimensions, reference image links, metal preference, server name..."
                    className="w-full p-3.5 bg-zinc-900/50 border border-white/5 focus:border-white/20 focus:bg-zinc-900 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Opening conversation...' : 'Start conversation'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  Your inquiry creates a confidential 72-hour channel directly with our jeweler.
                </p>
              </div>
            </form>
          ) : (
            /* --- 2. ACTIVE 72H CONVERSATION THREAD --- */
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Status Header Sub-bar */}
              <div className="px-5 py-2.5 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px]">{getRemainingHours(activeRequest.expiresAt)}</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('yufo_active_request_id');
                    setActiveRequest(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 text-[11px] cursor-pointer"
                  title="Start a new inquiry"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>New inquiry</span>
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                <div className="text-center pb-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-zinc-900 border border-white/5 text-[11px] text-zinc-300">
                    Subject: {activeRequest.subject}
                  </span>
                </div>

                {activeRequest.messages.map((m) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div key={m.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {isAdmin && (
                          <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-white/15 bg-black shrink-0">
                            <Image
                              src="/assets/brand/yufo_icon_black.png"
                              alt="YUFO Jeweler"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-500">
                          {isAdmin ? 'YUFO Jeweler' : 'You'} ·{' '}
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-4 py-2.5 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-zinc-900 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-sm'
                            : 'bg-white text-zinc-950 font-normal rounded-2xl rounded-tr-sm shadow-sm'
                        }`}
                      >
                        <span className="whitespace-pre-line">{m.text}</span>
                        <MessageAttachments names={m.attachments} />
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {activeRequest.project?.stage === 'preview' && (
                <div className="px-5 py-3 border-t border-white/5 bg-emerald-500/[0.06] flex items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-300">Happy with the 3D preview? Approve it, or reply below with the changes you want.</span>
                  <button
                    onClick={handleApprovePreview}
                    disabled={loading}
                    className="shrink-0 h-8 px-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-semibold disabled:opacity-50"
                  >
                    Approve 3D preview
                  </button>
                </div>
              )}

              {/* Follow-up input bar */}
              <form onSubmit={handleSendFollowUp} className="p-3 bg-zinc-900/30 border-t border-white/5 flex items-center gap-2">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Reply to our jeweler..."
                  className="flex-1 h-9 px-3.5 bg-zinc-900 border border-white/5 focus:border-white/20 rounded-lg text-xs text-white placeholder:text-zinc-500 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!replyMessage.trim()}
                  className="w-9 h-9 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer shrink-0"
                  aria-label="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}
    </>
  );
};
