import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mountain, Gauge, TrendingUp, Clock, MapPin, CheckCircle, Navigation } from 'lucide-react';

export default function AnalyticsDashboard({ analytics, liveData }) {
  if (!analytics && !liveData) return null;

  const data = analytics || {
    distanceCovered: liveData?.distanceCovered || 0,
    distanceRemaining: liveData?.distanceRemaining || 0,
    progressPercent: liveData?.progressPercent || 0,
    currentSpeed: liveData?.currentLocation?.speedKmh || 0,
    avgSpeed: liveData?.avgSpeed || 85,
    currentDelay: liveData?.delayMinutes || 0,
    averageDelay: Math.round((liveData?.delayMinutes || 0) * 0.7),
    stationsCompleted: liveData?.stations?.filter(s => s.status === 'departed')?.length || 0,
    stationsRemaining: liveData?.stations?.filter(s => s.status !== 'departed')?.length || 0,
    highestElevation: 216,
    lowestElevation: 81,
    currentElevation: 145,
    elevationProfile: liveData?.elevationProfile || []
  };

  const elevationData = data.elevationProfile && data.elevationProfile.length > 0
    ? data.elevationProfile
    : [
        { distance: 0, elevation: 216, label: "New Delhi" },
        { distance: 200, elevation: 168, label: "Tundla" },
        { distance: 440, elevation: 126, label: "Kanpur" },
        { distance: 635, elevation: 98, label: "Prayagraj" },
        { distance: 759, elevation: 81, label: "Varanasi" }
      ];

  return (
    <div className="w-full space-y-5">
      
      {/* 6-Card High Density Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Speed */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Speed</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {data.currentSpeed} <span className="text-xs font-normal text-neutral-400">km/h</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Avg: {data.avgSpeed || 90} km/h</div>
        </div>

        {/* Distance Covered */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <Navigation className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Covered</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {data.distanceCovered} <span className="text-xs font-normal text-neutral-400">km</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{data.distanceRemaining} km left</div>
        </div>

        {/* Progress */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Progress</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {data.progressPercent}%
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Along route line</div>
        </div>

        {/* Delay */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Delay</span>
          </div>
          <div className={`text-xl font-bold font-mono ${data.currentDelay > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {data.currentDelay > 0 ? `+${data.currentDelay}m` : '0m'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Avg delay: {data.averageDelay}m</div>
        </div>

        {/* Stations Done / Left */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-violet-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Stations</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {data.stationsCompleted} <span className="text-xs font-normal text-neutral-400">/ {data.stationsCompleted + data.stationsRemaining}</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{data.stationsRemaining} remaining</div>
        </div>

        {/* Current Elevation */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-neutral-400 dark:text-slate-500 mb-1">
            <Mountain className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Altitude</span>
          </div>
          <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white">
            {data.currentElevation} <span className="text-xs font-normal text-neutral-400">m</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Peak: {data.highestElevation} m</div>
        </div>
      </div>

      {/* Elevation Profile Chart (OpenTopography) */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Mountain className="w-4 h-4 text-violet-500" />
              <span>Route Topography & Elevation Profile</span>
            </h4>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Terrain elevation along track (meters above sea level)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300">
              Lowest: <strong>{data.lowestElevation} m</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              Highest: <strong>{data.highestElevation} m</strong>
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={elevationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="distance" 
                unit=" km" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                unit="m" 
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-xl text-xs font-sans">
                        <div className="font-bold text-violet-300">{item.label || `${item.distance} km`}</div>
                        <div className="font-mono mt-0.5">Elevation: <span className="font-bold text-white">{item.elevation} m</span></div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.distance} km from origin</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#8b5cf6" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#elevationGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
