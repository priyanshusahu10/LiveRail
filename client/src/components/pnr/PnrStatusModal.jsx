import React, { useState } from 'react';
import { X, Ticket, Search, CheckCircle2, Clock, AlertCircle, Sparkles, User, ArrowRight, Loader2 } from 'lucide-react';
import { getPnrStatusApi } from '../../services/api';

const SAMPLE_PNRS = ['2345678901', '1295100000', '8901234567'];

export default function PnrStatusModal({ isOpen, onClose, initialPnr = '' }) {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pnrData, setPnrData] = useState(null);

  const handleSearch = async (targetPnr = pnrInput) => {
    const clean = String(targetPnr).trim().replace(/\D/g, '');
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit PNR number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getPnrStatusApi(clean);
      setPnrData(res);
    } catch (err) {
      console.error('PNR inquiry failed:', err);
      setError(err.message || 'Unable to retrieve PNR status. Please verify the 10-digit number.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between bg-neutral-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Check Live PNR Status
              </h3>
              <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                Real-time Indian Railways passenger reservation status & coach/berth details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* PNR Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-slate-500 block">
              Enter 10-Digit PNR Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 2345678901"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-slate-800/80 border border-neutral-200 dark:border-slate-700 text-sm font-mono font-bold tracking-wider text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={loading || pnrInput.length !== 10}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Check</span>
              </button>
            </div>

            {/* Quick Sample PNR buttons */}
            <div className="flex items-center gap-1.5 pt-1 text-xs text-neutral-500">
              <span>Try Demo PNR:</span>
              {SAMPLE_PNRS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setPnrInput(sample);
                    handleSearch(sample);
                  }}
                  className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-cyan-950 text-neutral-600 dark:text-slate-300 transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PNR Ticket Result View */}
          {pnrData && (
            <div className="space-y-4 animate-in fade-in">
              {/* Ticket Card Container */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-neutral-50 to-cyan-50/30 dark:from-slate-800/80 dark:to-slate-900 border border-neutral-200 dark:border-slate-700 space-y-4 shadow-sm">
                
                {/* Train details header */}
                <div className="flex items-start justify-between gap-3 border-b border-neutral-200/80 dark:border-slate-700/80 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                        #{pnrData.trainNumber}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                        {pnrData.trainName}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-slate-400 mt-1.5">
                      <span>{pnrData.fromStation.name} ({pnrData.fromStation.code})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{pnrData.toStation.name} ({pnrData.toStation.code})</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                      pnrData.isChartPrepared
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {pnrData.chartStatus}
                    </span>
                    <div className="text-[11px] text-neutral-400 font-mono mt-1">
                      DOJ: {pnrData.dateOfJourney}
                    </div>
                  </div>
                </div>

                {/* Passenger Breakdown List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-slate-500 block">
                    Passenger Booking Status
                  </span>

                  <div className="space-y-2">
                    {pnrData.passengers.map((p) => (
                      <div
                        key={p.passengerIndex}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200/90 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-600 dark:text-slate-300 font-bold text-xs">
                            P{p.passengerIndex}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              <span>Passenger {p.passengerIndex}</span>
                              <span className="text-[10px] text-neutral-400 font-normal">
                                ({p.berthType || 'Seat'})
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              Booking: <span className="font-semibold">{p.bookingStatus}</span>
                            </div>
                          </div>
                        </div>

                        {/* Current Confirmed Status Pill */}
                        <div className="text-right">
                          <div className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg inline-block ${
                            p.isConfirmed
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {p.currentStatus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata row */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-neutral-500 dark:text-slate-400">
                  <span>Class: <strong>{pnrData.classCode}</strong> • Quota: <strong>{pnrData.quota}</strong></span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-500" />
                    <span>{pnrData.dataSource}</span>
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
