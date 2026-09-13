import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, Send, ExternalLink, ShieldCheck } from 'lucide-react';
import { createShareLinkApi } from '../../services/api';

export default function ShareModal({ isOpen, onClose, trainNumber, trainName, liveData }) {
  const [shareToken, setShareToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !trainNumber) return;

    let isMounted = true;
    async function getLink() {
      setLoading(true);
      try {
        const res = await createShareLinkApi(trainNumber);
        if (isMounted) {
          setShareToken(res.token);
        }
      } catch (err) {
        console.error('Share link error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getLink();
    return () => { isMounted = false; };
  }, [isOpen, trainNumber]);

  if (!isOpen) return null;

  const fullUrl = `${window.location.origin}/l/${shareToken || 'ABC123'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Track my train live: ${trainName} (${trainNumber}) on LiveRail!\nLive link: ${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            Share Live Journey
          </h3>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
            Share real-time GPS tracking with family or friends. Zero login needed.
          </p>
        </div>

        {/* Journey Quick Summary Card */}
        {liveData && (
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-200 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white font-mono">{liveData.trainNumber} - {liveData.trainName}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{liveData.delayStatus}</span>
            </div>
            <div className="text-neutral-500 text-[11px]">
              Next stop: <strong className="text-neutral-800 dark:text-slate-200">{liveData.nextStation?.name}</strong> (ETA {liveData.nextStation?.eta})
            </div>
          </div>
        )}

        {/* Share Link Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-slate-300 block">
            Direct Shareable URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={fullUrl}
              className="w-full text-xs font-mono px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-700 dark:text-slate-200 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick WhatsApp Action */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Share via WhatsApp</span>
        </button>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          <span>Public link expires automatically after the journey concludes.</span>
        </div>

      </div>
    </div>
  );
}
