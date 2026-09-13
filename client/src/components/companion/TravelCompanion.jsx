import React, { useEffect, useState } from 'react';
import { CloudRain, Wind, Droplets, Sun, Compass, Landmark, Mountain, Waves, MapPin, Sparkles } from 'lucide-react';
import { getWeatherApi, getNearbyPlacesApi } from '../../services/api';

export default function TravelCompanion({ liveData }) {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [nextWeather, setNextWeather] = useState(null);
  const [destWeather, setDestWeather] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!liveData) return;

    let isMounted = true;
    async function loadCompanionData() {
      setLoading(true);
      try {
        const currCoord = liveData.currentLocation;
        const nextSt = liveData.nextStation;
        const destSt = liveData.destination;

        // Fetch weather for Current, Next, and Destination
        const [wCurr, wNext, wDest, nearby] = await Promise.all([
          getWeatherApi(currCoord.lat, currCoord.lng, liveData.currentStation?.name || 'Current Position'),
          nextSt ? getWeatherApi(nextSt.lat, nextSt.lng, nextSt.name) : null,
          destSt ? getWeatherApi(destSt.lat, destSt.lng, destSt.name) : null,
          getNearbyPlacesApi(currCoord.lat, currCoord.lng, 80)
        ]);

        if (isMounted) {
          setCurrentWeather(wCurr);
          setNextWeather(wNext);
          setDestWeather(wDest);
          // Combine server nearby places with route-specific POIs
          const combined = [
            ...(liveData.pois || []),
            ...nearby.filter(n => !liveData.pois?.some(p => p.id === n.id))
          ].slice(0, 6);
          setPlaces(combined);
        }
      } catch (err) {
        console.error('Companion load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCompanionData();
    return () => { isMounted = false; };
  }, [liveData?.currentLocation?.lat, liveData?.currentLocation?.lng]);

  const renderWeatherCard = (title, weather, highlight = false) => {
    if (!weather) return null;
    return (
      <div className={`p-4 rounded-2xl border transition-all ${
        highlight 
          ? 'bg-gradient-to-br from-cyan-50 to-blue-50/50 dark:from-cyan-950/30 dark:to-slate-900 border-cyan-200 dark:border-cyan-800 shadow-sm' 
          : 'bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px]">{title}</span>
          <span className="truncate max-w-[120px] font-medium text-neutral-800 dark:text-slate-200">{weather.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-mono text-neutral-900 dark:text-white">
              {weather.temperature}°<span className="text-sm font-sans font-normal text-neutral-400">C</span>
            </span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-xs text-neutral-800 dark:text-slate-200 block">
              {weather.condition}
            </span>
            <span className="text-[11px] text-neutral-400">
              Feels {weather.feelsLike}°C
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-blue-500" />
            {weather.windKmh} km/h
          </span>
          <span className="flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            {weather.rainProbability}% rain
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-5">
      
      {/* Weather Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Route Weather Forecast</span>
          </h3>
          <span className="text-xs text-neutral-400">OpenWeather sync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {renderWeatherCard('Current Location', currentWeather, true)}
          {renderWeatherCard('Next Stop', nextWeather)}
          {renderWeatherCard('Destination', destWeather)}
        </div>
      </div>

      {/* Points of Interest & Geographic Context */}
      <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Smart Travel Companion & Geography</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-slate-400">
              Rivers, mountain ghats, engineering bridges & heritage along this corridor
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300">
            Overpass Geo
          </span>
        </div>

        {/* POI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {places.map((poi) => {
            let badgeColor = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            let IconComponent = Landmark;

            if (poi.category?.toLowerCase().includes('river') || poi.category?.toLowerCase().includes('water')) {
              badgeColor = 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
              IconComponent = Waves;
            } else if (poi.category?.toLowerCase().includes('mountain') || poi.category?.toLowerCase().includes('ghat')) {
              badgeColor = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
              IconComponent = Mountain;
            }

            return (
              <div
                key={poi.id || poi.name}
                className="p-4 rounded-xl border border-neutral-200 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor} flex items-center gap-1`}>
                    <IconComponent className="w-3 h-3" />
                    {poi.category}
                  </span>
                  {poi.distanceAwayKm !== undefined && (
                    <span className="font-mono text-[11px] text-neutral-400">
                      ~{poi.distanceAwayKm} km away
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    {poi.name}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                    {poi.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
