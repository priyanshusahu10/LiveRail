import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, ArrowRight, Star, Clock, MapPin, Gauge, Mountain, Sun, Compass, Radio, ShieldCheck, Sparkles } from 'lucide-react';
import SearchBox from '../components/search/SearchBox';
import { getFavourites, getRecentSearches } from '../utils/storage';

const FEATURED_TRAINS = [
  {
    number: "22436",
    name: "Vande Bharat Express",
    type: "Vande Bharat",
    origin: "New Delhi (NDLS)",
    destination: "Varanasi (BSB)",
    time: "06:00 → 14:00",
    duration: "8h 00m",
    distance: "759 km",
    speed: "130 km/h",
    highlight: "Northern Plains Corridor",
    tag: "High Speed"
  },
  {
    number: "12951",
    name: "Mumbai Tejas Rajdhani",
    type: "Rajdhani",
    origin: "Mumbai Central (MMCT)",
    destination: "New Delhi (NDLS)",
    time: "17:00 → 08:32",
    duration: "15h 32m",
    distance: "1386 km",
    speed: "140 km/h",
    highlight: "Western Ghats & Chambal Gorge",
    tag: "Premier Flagship"
  },
  {
    number: "12004",
    name: "Lucknow Swarna Shatabdi",
    type: "Shatabdi",
    origin: "New Delhi (NDLS)",
    destination: "Lucknow (LJN)",
    time: "06:10 → 12:50",
    duration: "6h 40m",
    distance: "511 km",
    speed: "130 km/h",
    highlight: "Taj Corridor & Awadh Plains",
    tag: "Intercity Express"
  },
  {
    number: "12301",
    name: "Howrah Rajdhani Express",
    type: "Rajdhani",
    origin: "Howrah (HWH)",
    destination: "New Delhi (NDLS)",
    time: "16:50 → 09:55",
    duration: "17h 05m",
    distance: "1451 km",
    speed: "130 km/h",
    highlight: "Parasnath Foothills & Sone River",
    tag: "Trans-India"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    setFavourites(getFavourites());
    setRecents(getRecentSearches());
  }, []);

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-slate-950 text-neutral-900 dark:text-white transition-colors pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-300 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
          <span>Apple Maps × Linear Design Experience</span>
          <span className="text-cyan-400">•</span>
          <span>Live GPS Telemetry</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Track your <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">journey</span>, not just your train.
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-600 dark:text-slate-400 leading-relaxed font-normal">
            Where is your train, where is it going, what lies ahead, and what is happening around your route? Real-time movement, glowing railway maps, elevation profiles, weather, and nearby geographic landmarks.
          </p>
        </div>

        {/* Hero Search Box */}
        <div className="max-w-2xl mx-auto pt-2">
          <SearchBox size="large" autoFocus />
        </div>

        {/* Quick Recent Searches Pills */}
        {recents.length > 0 && (
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-neutral-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Recent:
            </span>
            {recents.slice(0, 4).map((r) => (
              <button
                key={r.trainNumber}
                onClick={() => navigate(`/track/${r.trainNumber}`)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover:border-cyan-500 text-neutral-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{r.trainNumber}</span>
                <span>{r.trainName}</span>
              </button>
            ))}
          </div>
        )}

      </section>

      {/* Featured Trains / Quick Track Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Train className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Featured Trains & Corridors</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              One-click live simulation & tracking across premier Indian Railways lines
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">4 Active Corridors</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURED_TRAINS.map((train) => (
            <div
              key={train.number}
              onClick={() => navigate(`/track/${train.number}`)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {train.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400">
                      {train.tag}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live GPS
                  </span>
                </div>

                {/* Train Name */}
                <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {train.name}
                </h3>

                {/* Route */}
                <div className="text-xs font-medium text-neutral-600 dark:text-slate-300 mt-1">
                  {train.origin} <span className="text-neutral-400">→</span> {train.destination}
                </div>

                {/* Highlights */}
                <p className="text-xs text-neutral-400 dark:text-slate-500 mt-2 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{train.highlight}</span>
                </p>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center gap-3 font-mono">
                  <span>{train.distance}</span>
                  <span>•</span>
                  <span>{train.duration}</span>
                  <span>•</span>
                  <span className="text-neutral-700 dark:text-slate-300 font-semibold">{train.speed}</span>
                </div>
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillar Highlights (Design System Showcase) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-4">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-neutral-400 dark:text-slate-500">
          Why LiveRail is different
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Smooth GPS Interpolation</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              No jumping markers. Smooth movement along actual railway tracks with directional bearing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <Mountain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Elevation Profiles</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              OpenTopography terrain profiles revealing mountain passes, ghat ascents, and river valleys.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Station Weather</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Contextual weather forecasts at current position, upcoming halts, and final destination.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Zero-Login Sharing</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Generate lightweight links for family members to follow your train without installing apps.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
