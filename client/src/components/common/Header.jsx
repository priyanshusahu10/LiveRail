import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Train, Star, Search, Radio, Compass, Moon, Sun, ArrowRight, X } from 'lucide-react';
import { getFavourites } from '../../utils/storage';

export default function Header() {
  const navigate = useNavigate();
  const [showFavs, setShowFavs] = useState(false);
  const favourites = getFavourites();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-neutral-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
            <Train className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-lg text-neutral-900 dark:text-white">Live<span className="text-cyan-600 dark:text-cyan-400">Rail</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded">MVP</span>
            </div>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-slate-400 -mt-0.5">Journey Companion</span>
          </div>
        </Link>

        {/* Center Live Radar Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-xs font-medium text-neutral-700 dark:text-slate-300">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] tracking-wide">IRCTC LIVE RADAR</span>
          <span className="text-neutral-400 dark:text-slate-500">•</span>
          <span className="text-neutral-500 dark:text-slate-400 text-[11px]">30s Sync</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-slate-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Search Trains"
          >
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-neutral-300 dark:border-slate-700 rounded text-neutral-500">⌘K</kbd>
          </Link>

          {/* Favourites Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowFavs(!showFavs)}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
              title="Saved Favourites"
            >
              <Star className={`w-4 h-4 ${favourites.length > 0 ? 'text-amber-500 fill-amber-500' : ''}`} />
              {favourites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center">
                  {favourites.length}
                </span>
              )}
            </button>

            {/* Favourites Dropdown */}
            {showFavs && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-neutral-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Favourite Trains
                  </span>
                  <button onClick={() => setShowFavs(false)} className="text-neutral-400 hover:text-neutral-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {favourites.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4">No favourite trains saved yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {favourites.map(fav => (
                      <div
                        key={fav.trainNumber}
                        onClick={() => {
                          setShowFavs(false);
                          navigate(`/track/${fav.trainNumber}`);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 flex items-center gap-1">
                            <span className="font-mono text-neutral-500 text-[11px]">{fav.trainNumber}</span>
                            <span>{fav.trainName}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {fav.origin} → {fav.destination}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-cyan-600 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explore Rail Guide */}
          <Link
            to="/track/22436"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-lg shadow-sm transition-all"
          >
            <span>Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

      </div>
    </header>
  );
}
