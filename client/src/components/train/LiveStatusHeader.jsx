import React, { useState, useEffect } from 'react';
import { RefreshCw, Star, Share2, Gauge, AlertCircle, CheckCircle2, Clock, MapPin, ArrowRight, Armchair, Ticket } from 'lucide-react';
import { isFavourite, toggleFavourite } from '../../utils/storage';

export default function LiveStatusHeader({
  liveData,
  onRefresh,
  isRefreshing,
  onOpenShare,
  onOpenSeats,
  onOpenPnr
}) {
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [favourited, setFavourited] = useState(false);

  useEffect(() => {
    if (liveData?.trainNumber) {
      setFavourited(isFavourite(liveData.trainNumber));
    }
  }, [liveData?.trainNumber]);

  // Reset seconds ago when liveData changes
  useEffect(() => {
    setSecondsAgo(0);
    const interval = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveData?.lastUpdated]);

  const handleToggleFav = () => {
    if (!liveData) return;
    toggleFavourite(liveData);
    setFavourited(!favourited);
  };

  if (!liveData) return null;

  const isDelayed = liveData.delayMinutes > 0;
  const isMajorDelay = liveData.delayMinutes > 15;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Train Title & Badges */}
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-2.5">
            <span className="font-mono text-sm sm:text-base font-bold px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              {liveData.trainNumber}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {liveData.trainName}
            </h1>
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400">
              {liveData.type}
            </span>
            {liveData.isLive && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                RailRadar GPS
              </span>
            )}
          </div>

          {/* Route Source -> Destination */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-600 dark:text-slate-300">
            <span className="font-semibold text-neutral-800 dark:text-slate-200">{liveData.origin.name} ({liveData.origin.code})</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-800 dark:text-slate-200">{liveData.destination.name} ({liveData.destination.code})</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500 font-mono">{liveData.totalDistance} km</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500">{liveData.totalDuration}</span>
          </div>
        </div>

        {/* Right: Telemetry Badges & Quick Actions */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Motion Status Badge: RUNNING vs STOPPED */}
          <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all ${
            liveData.isRunning
              ? 'bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm shadow-emerald-500/10'
              : 'bg-rose-500/10 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-sm shadow-rose-500/10'
          }`}>
            <div className="relative flex items-center justify-center">
              {liveData.isRunning ? (
                <>
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              )}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-75 leading-none">Train Status</div>
              <div className="text-xs font-black tracking-tight leading-tight uppercase flex items-center gap-1 mt-0.5">
                <span>{liveData.isRunning ? 'RUNNING' : 'STOPPED'}</span>
                {liveData.isRunning && (
                  <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    ({liveData.currentLocation.speedKmh} km/h)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Speed Badge */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-slate-800/70 border border-neutral-200 dark:border-slate-700">
            <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400 leading-none">Speed</div>
              <div className="text-sm font-mono font-bold text-neutral-900 dark:text-white leading-tight">
                {liveData.currentLocation.speedKmh} <span className="text-[10px] font-normal text-neutral-400">km/h</span>
              </div>
            </div>
          </div>

          {/* Delay Status Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-semibold text-xs transition-colors ${
            !isDelayed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : isMajorDelay
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
          }`}>
            {!isDelayed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider opacity-80">Delay</span>
              <span>{liveData.delayStatus}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
            {/* Check Seats Button */}
            <button
              onClick={onOpenSeats}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition-all shadow-sm"
              title="Check Live Seat Availability"
            >
              <Armchair className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Seats</span>
            </button>

            {/* Check PNR Button */}
            <button
              onClick={onOpenPnr}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-sm"
              title="Check Live PNR Status"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PNR</span>
            </button>

            {/* Favourite Star */}
            <button
              onClick={handleToggleFav}
              className={`p-2 rounded-xl border transition-all ${
                favourited
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-500'
                  : 'bg-white dark:bg-slate-800 border-neutral-200 dark:border-slate-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title={favourited ? 'Saved in Favourites' : 'Add to Favourites'}
            >
              <Star className={`w-4 h-4 ${favourited ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Share Journey */}
            <button
              onClick={onOpenShare}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-neutral-600 hover:text-neutral-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              title="Share Journey"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Manual Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-all"
              title="Refresh Live Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

        </div>

      </div>

      {/* Footer ticker: Last updated & next station highlight */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-neutral-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${liveData.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          <span>
            <strong className={liveData.isRunning ? 'text-emerald-600 dark:text-emerald-400 uppercase font-black mr-1' : 'text-rose-600 dark:text-rose-400 uppercase font-black mr-1'}>
              [{liveData.isRunning ? 'RUNNING' : 'STOPPED'}]
            </strong>
            {liveData.motionReason || liveData.currentLocation.approximateLocation}
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Next stop: <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{liveData.nextStation.name}</strong> (in {liveData.nextStation.etaMinutes}m at {liveData.nextStation.eta})</span>
          <span>•</span>
          <span>Updated {secondsAgo}s ago</span>
        </div>
      </div>
    </div>
  );
}
