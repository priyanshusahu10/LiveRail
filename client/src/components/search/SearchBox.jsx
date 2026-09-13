import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Train, ArrowRight, Clock, MapPin, Sparkles, X, ChevronRight } from 'lucide-react';
import { searchTrainsApi } from '../../services/api';
import { getRecentSearches, addRecentSearch } from '../../utils/storage';

export default function SearchBox({ autoFocus = false, size = 'large' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recents, setRecents] = useState([]);
  const [validationError, setValidationError] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setValidationError('');
      try {
        const results = await searchTrainsApi(query);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrain = (train) => {
    addRecentSearch(train);
    setShowDropdown(false);
    navigate(`/track/${train.trainNumber}`);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) {
      setValidationError('Please enter a train number or name');
      return;
    }

    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectTrain(suggestions[selectedIndex]);
      return;
    }

    if (suggestions.length > 0) {
      handleSelectTrain(suggestions[0]);
    } else {
      setValidationError(`No train found matching "${query}". Try 22436, 12951, or "Rajdhani"`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={`relative flex items-center w-full transition-all duration-200 ${
          size === 'large' 
            ? 'h-14 sm:h-16 px-4 sm:px-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-neutral-200 dark:border-slate-700 shadow-lg shadow-neutral-100 dark:shadow-none focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10'
            : 'h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-700 focus-within:border-cyan-500'
        }`}>
          <Search className={`text-neutral-400 dark:text-slate-500 ${size === 'large' ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-4 h-4'}`} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              if (validationError) setValidationError('');
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search by train number (e.g. 22436, 12951) or name..."
            className={`w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-slate-500 ml-3 ${
              size === 'large' ? 'text-base sm:text-lg font-medium' : 'text-sm'
            }`}
          />

          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent mr-2"></div>
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-slate-300 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className={`hidden sm:flex items-center h-14 justify-end font-semibold rounded-xl transition-all  ${
              size === 'large'
                ? 'px-5 py-2.5 bg-teal-600 hover:bg-neutral-800 text-white text-sm shadow-md'
                : 'px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs'
            }`}
          >
            Track Live
          </button>
        </div>
      </form>

      {/* Validation Message */}
      {validationError && (
        <p className="mt-2 text-xs font-medium text-rose-500 flex items-center gap-1.5 animate-in fade-in">
          <span>⚠️</span> {validationError}
        </p>
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && (suggestions.length > 0 || (query.length === 0 && recents.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Recent searches header when query is empty */}
          {query.trim().length === 0 && recents.length > 0 && (
            <div className="p-3 bg-neutral-50 dark:bg-slate-800/60 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" /> Recent Searches
              </span>
            </div>
          )}

          {/* Autocomplete results */}
          {suggestions.length > 0 ? (
            <div className="p-2 divide-y divide-neutral-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
              {suggestions.map((train, idx) => (
                <div
                  key={train.trainNumber}
                  onClick={() => handleSelectTrain(train)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                    selectedIndex === idx
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-mono font-bold text-xs">
                      {train.type === 'Vande Bharat' ? 'VB' : train.type === 'Rajdhani' ? 'RAJ' : 'EXP'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">{train.trainNumber}</span>
                        <span className="font-medium text-sm text-neutral-800 dark:text-slate-200">{train.trainName}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400">
                          {train.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium">{train.origin.name} ({train.origin.code})</span>
                        <span>→</span>
                        <span className="font-medium">{train.destination.name} ({train.destination.code})</span>
                        <span>•</span>
                        <span>{train.totalDistance} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-3 text-right">
                    <div className="text-xs">
                      <div className="font-mono font-semibold text-neutral-900 dark:text-white">{train.departureTime} → {train.arrivalTime}</div>
                      <div className="text-[11px] text-neutral-400">{train.totalDuration}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length === 0 && recents.length > 0 ? (
            /* Recents List */
            <div className="p-2 space-y-1">
              {recents.map((item) => (
                <div
                  key={item.trainNumber}
                  onClick={() => handleSelectTrain(item)}
                  className="p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">{item.trainNumber}</span>
                    <span className="text-xs text-neutral-700 dark:text-slate-300 font-medium">{item.trainName}</span>
                    <span className="text-[11px] text-neutral-400">({item.origin} → {item.destination})</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-6 text-center text-sm text-neutral-400 dark:text-slate-500">
              <Train className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No trains found matching "{query}"</p>
              <p className="text-xs text-neutral-400 mt-1">Try searching for 22436, 12951, or 12004</p>
            </div>
          ) : null}

        </div>
      )}
    </div>
  );
}
