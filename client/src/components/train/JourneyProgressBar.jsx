import React from 'react';
import { Compass, Flag, MapPin } from 'lucide-react';

export default function JourneyProgressBar({ liveData }) {
  if (!liveData) return null;

  const { progressPercent = 0, distanceCovered = 0, distanceRemaining = 0, totalDistance = 0, origin, destination, nextStation } = liveData;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Top metrics summary */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-slate-500 block">
            Journey Progress
          </span>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-baseline gap-2">
            <span>{progressPercent}%</span>
            <span className="text-xs font-medium text-neutral-500 font-mono">
              ({distanceCovered} of {totalDistance} km)
            </span>
          </div>
        </div>

        {/* Center: Motion Status Pill */}
        <div className="flex flex-col items-center">
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
            liveData.isRunning
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${liveData.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span>{liveData.isRunning ? `RUNNING (${liveData.currentLocation?.speedKmh || 0} km/h)` : 'STOPPED'}</span>
          </div>
          {liveData.totalSubStationsCount > 0 && (
            <span className="text-[10px] text-neutral-400 dark:text-slate-500 mt-1 font-mono">
              {liveData.passedSubStationsCount} of {liveData.totalSubStationsCount} sub-stations passed
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-slate-500 block">
            Distance Left
          </span>
          <div className="text-2xl font-bold font-mono tracking-tight text-cyan-600 dark:text-cyan-400">
            {distanceRemaining} <span className="text-xs font-normal text-neutral-500">km</span>
          </div>
        </div>
      </div>

      {/* Modern Progress Track with Pulse Indicator */}
      <div className="relative w-full">
        {/* Track background */}
        <div className="h-3 w-full bg-neutral-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-cyan-500/30"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* Milestone Station Markers on the bar */}
        {liveData.stations && liveData.stations.length > 2 && (
          <div className="relative w-full h-2">
            {liveData.stations.slice(1, -1).map((st) => {
              const leftPct = (st.distanceKm / totalDistance) * 100;
              const passed = distanceCovered >= st.distanceKm;
              return (
                <div
                  key={st.code}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer"
                  style={{ left: `${leftPct}%` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-0.5 border ${
                    passed
                      ? 'bg-emerald-500 border-white dark:border-slate-900'
                      : 'bg-neutral-300 dark:bg-slate-700 border-white dark:border-slate-900'
                  }`} />
                  <span className="text-[9px] font-mono text-neutral-400 dark:text-slate-500 mt-1 opacity-80 group-hover:opacity-100 group-hover:font-bold transition-all">
                    {st.code}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Origin, Next Station & Destination info row */}
      <div className="flex items-center justify-between pt-2 text-xs font-medium text-neutral-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          <span>{origin.code} ({origin.name})</span>
        </div>

        {nextStation && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-50 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-cyan-500" />
            <span>Approaching <strong>{nextStation.name}</strong></span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-right">
          <Flag className="w-3.5 h-3.5 text-neutral-400" />
          <span>{destination.code} ({destination.name})</span>
        </div>
      </div>

    </div>
  );
}
