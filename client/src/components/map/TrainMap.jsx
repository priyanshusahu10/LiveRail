import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Compass, Layers, Maximize2, MapPin, Radio, ShieldAlert } from 'lucide-react';

export default function TrainMap({
  liveData,
  trainRoute,
  onStationSelect,
  className = ''
}) {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const trainMarkerRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const poiMarkersRef = useRef([]);

  const [followTrain, setFollowTrain] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    // Use MapTiler premium dark style if key is set, else free CARTO dark
    const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
    const mapStyle = MAPTILER_KEY
      ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
      : {
          version: 8,
          sources: {
            'carto-dark': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors, © CARTO'
            }
          },
          layers: [{ id: 'carto-dark-tiles', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 19 }]
        };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: liveData?.currentLocation ? [liveData.currentLocation.lng, liveData.currentLocation.lat] : [78.9629, 20.5937],
      zoom: liveData?.currentLocation ? 7 : 5,
      pitch: 0,
      bearing: 0
    });

    mapInstance.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      setMapLoaded(true);

      // Add route layers once loaded
      initRouteLayers(map);
    });

    // Disable follow mode on manual user drag
    map.on('dragstart', () => {
      setFollowTrain(false);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Initialize route layers (completed glow + remaining route)
  const initRouteLayers = (map) => {
    if (!map) return;

    // Completed Route Glow Layer
    if (!map.getSource('completed-route')) {
      map.addSource('completed-route', {
        type: 'geojson',
        data: liveData?.completedRouteGeoJSON || { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
      });

      // Wide blur glow
      map.addLayer({
        id: 'completed-route-glow',
        type: 'line',
        source: 'completed-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 10,
          'line-opacity': 0.4,
          'line-blur': 4
        }
      });

      // Core sharp line
      map.addLayer({
        id: 'completed-route-core',
        type: 'line',
        source: 'completed-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#22d3ee',
          'line-width': 4,
          'line-opacity': 0.95
        }
      });
    }

    // Remaining Route Layer (dashed)
    if (!map.getSource('remaining-route')) {
      map.addSource('remaining-route', {
        type: 'geojson',
        data: liveData?.remainingRouteGeoJSON || { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } }
      });

      map.addLayer({
        id: 'remaining-route-line',
        type: 'line',
        source: 'remaining-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#64748b',
          'line-width': 3,
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      });
    }
  };

  // Update Route Layers when liveData changes
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded || !liveData) return;

    if (map.getSource('completed-route') && liveData.completedRouteGeoJSON) {
      map.getSource('completed-route').setData(liveData.completedRouteGeoJSON);
    }
    if (map.getSource('remaining-route') && liveData.remainingRouteGeoJSON) {
      map.getSource('remaining-route').setData(liveData.remainingRouteGeoJSON);
    }
  }, [liveData, mapLoaded]);

  // Update Station Markers & POIs
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded || !liveData?.stations) return;

    // Clear old station markers
    stationMarkersRef.current.forEach(m => m.remove());
    stationMarkersRef.current = [];

    // Add station markers
    liveData.stations.forEach((st, idx) => {
      const isOrigin = idx === 0;
      const isDestination = idx === liveData.stations.length - 1;
      const isDeparted = st.status === 'departed';
      const isCurrent = st.status === 'current';

      const el = document.createElement('div');
      el.className = 'station-marker group cursor-pointer relative';

      // Inner dot
      const dot = document.createElement('div');
      if (isCurrent) {
        dot.className = 'w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/50 flex items-center justify-center animate-pulse';
      } else if (isOrigin || isDestination) {
        dot.className = 'w-4 h-4 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-md flex items-center justify-center';
      } else if (isDeparted) {
        dot.className = 'w-3 h-3 rounded-full bg-cyan-600 border border-slate-900 shadow-sm';
      } else {
        dot.className = 'w-3 h-3 rounded-full bg-slate-500 border border-slate-900 shadow-sm';
      }
      el.appendChild(dot);

      // Station code badge
      const label = document.createElement('div');
      label.className = 'absolute top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono font-bold text-slate-200 shadow border border-slate-700 pointer-events-none whitespace-nowrap';
      label.innerText = st.code;
      el.appendChild(label);

      // Popup with Apple Maps × Linear design
      const popupHtml = `
        <div class="space-y-1.5 min-w-[160px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1.5">
            <span class="font-bold text-white text-xs">${st.name}</span>
            <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">${st.code}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>
              <span class="text-slate-400 block text-[9px] uppercase">Platform</span>
              <span class="font-mono font-bold text-cyan-400">${st.platform ? `PF #${st.platform}` : 'TBD'}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[9px] uppercase">Distance</span>
              <span class="font-mono font-semibold">${st.distanceKm} km</span>
            </div>
          </div>
          <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800 text-slate-300">
            <span>Sched: <b class="font-mono text-white">${st.scheduledArrival || st.scheduledDeparture}</b></span>
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              isDeparted ? 'bg-slate-800 text-slate-400' : isCurrent ? 'bg-emerald-950 text-emerald-300' : 'bg-cyan-950 text-cyan-300'
            }">${st.status}</span>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 16 }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.lng, st.lat])
        .setPopup(popup)
        .addTo(map);

      stationMarkersRef.current.push(marker);
    });

    // Clear old POI markers
    poiMarkersRef.current.forEach(m => m.remove());
    poiMarkersRef.current = [];

    // Add POI markers (Rivers, Bridges, Ghats, Monuments)
    if (liveData.pois && liveData.pois.length > 0) {
      liveData.pois.forEach((poi) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer group flex items-center justify-center';
        
        let iconEmoji = '🌉';
        let bgClass = 'bg-indigo-600/90';
        if (poi.category?.toLowerCase().includes('river') || poi.category?.toLowerCase().includes('water')) {
          iconEmoji = '🌊';
          bgClass = 'bg-blue-600/90';
        } else if (poi.category?.toLowerCase().includes('mountain') || poi.category?.toLowerCase().includes('ghat')) {
          iconEmoji = '⛰️';
          bgClass = 'bg-emerald-600/90';
        } else if (poi.category?.toLowerCase().includes('monument') || poi.category?.toLowerCase().includes('heritage')) {
          iconEmoji = '🏛️';
          bgClass = 'bg-amber-600/90';
        }

        el.innerHTML = `
          <div class="w-6 h-6 rounded-full ${bgClass} text-white text-xs flex items-center justify-center shadow-lg border border-white/40 hover:scale-125 transition-transform">
            <span>${iconEmoji}</span>
          </div>
        `;

        const poiPopupHtml = `
          <div class="space-y-1 max-w-[200px]">
            <div class="flex items-center gap-1.5">
              <span class="text-xs">${iconEmoji}</span>
              <span class="font-bold text-white text-xs">${poi.name}</span>
            </div>
            <span class="text-[10px] uppercase font-semibold text-cyan-400 block">${poi.category}</span>
            <p class="text-[11px] text-slate-300 leading-snug">${poi.description}</p>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 12 }).setHTML(poiPopupHtml);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([poi.lng, poi.lat])
          .setPopup(popup)
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });
    }

  }, [liveData?.stations, liveData?.pois, mapLoaded]);

  // Train Live Marker & Animation
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded || !liveData?.currentLocation) return;

    const { lng, lat, bearing = 0, speedKmh = 0 } = liveData.currentLocation;

    const isRunning = liveData.isRunning ?? (speedKmh > 0);

    if (!trainMarkerRef.current) {
      // Create custom DOM Train Marker
      const container = document.createElement('div');
      container.className = 'relative flex items-center justify-center cursor-pointer';

      // Animated Radar wave ping ring
      const radar = document.createElement('div');
      radar.id = 'train-radar-pulse';
      radar.className = isRunning
        ? 'absolute w-12 h-12 rounded-full bg-emerald-400/40 train-radar-ring pointer-events-none'
        : 'absolute w-10 h-10 rounded-full bg-rose-400/25 pointer-events-none';
      container.appendChild(radar);

      // Train Puck
      const puck = document.createElement('div');
      puck.className = isRunning
        ? 'relative w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-10'
        : 'relative w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-10';
      puck.id = 'train-puck-icon';

      // Direction Arrow / Train Icon
      puck.innerHTML = isRunning ? `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      ` : `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      `;
      container.appendChild(puck);

      // Speed Tag floating below
      const tag = document.createElement('div');
      tag.id = 'train-speed-tag';
      tag.className = isRunning
        ? 'absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-md whitespace-nowrap'
        : 'absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/40 shadow-md whitespace-nowrap';
      tag.innerText = isRunning ? `${speedKmh} km/h` : 'STOPPED';
      container.appendChild(tag);

      const marker = new maplibregl.Marker({ element: container })
        .setLngLat([lng, lat])
        .addTo(map);

      trainMarkerRef.current = marker;
    } else {
      // Smooth marker interpolation to new position
      trainMarkerRef.current.setLngLat([lng, lat]);

      // Update bearing rotation
      const icon = document.getElementById('train-puck-icon')?.querySelector('svg');
      if (icon) {
        icon.style.transform = `rotate(${bearing}deg)`;
      }

      // Update speed tag
      const tag = document.getElementById('train-speed-tag');
      if (tag) {
        tag.innerText = isRunning ? `${speedKmh} km/h` : 'STOPPED';
        tag.className = isRunning
          ? 'absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/40 shadow-md whitespace-nowrap'
          : 'absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-mono font-bold text-rose-400 border border-rose-500/40 shadow-md whitespace-nowrap';
      }
    }

    // Camera follow train if active
    if (followTrain) {
      map.easeTo({
        center: [lng, lat],
        duration: 1200,
        zoom: Math.max(map.getZoom(), 7.5)
      });
    }
  }, [liveData?.currentLocation, mapLoaded, followTrain]);

  // Fit bounds to whole route on train route change
  const fitWholeRoute = () => {
    const map = mapInstance.current;
    if (!map || !liveData?.stations || liveData.stations.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();
    liveData.stations.forEach(st => bounds.extend([st.lng, st.lat]));
    map.fitBounds(bounds, { padding: 80, duration: 1000 });
    setFollowTrain(false);
  };

  // Toggle 3D Pitch
  const toggle3D = () => {
    const map = mapInstance.current;
    if (!map) return;
    const targetPitch = is3D ? 0 : 50;
    map.easeTo({ pitch: targetPitch, duration: 800 });
    setIs3D(!is3D);
  };

  // Reset Bearing to North
  const resetBearing = () => {
    const map = mapInstance.current;
    if (!map) return;
    map.easeTo({ bearing: 0, duration: 500 });
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] sm:min-h-[480px] rounded-2xl overflow-hidden shadow-xl border border-neutral-200 dark:border-slate-800 ${className}`}>
      
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Map HUD Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        {/* Live Movement Status Pill */}
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border flex items-center gap-2 ${
          liveData?.isRunning
            ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
            : 'bg-rose-950/85 text-rose-300 border-rose-500/50 shadow-rose-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full ${liveData?.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-900'}`}></span>
          <span className="uppercase tracking-wider font-mono">
            {liveData?.isRunning ? `RUNNINGS (${liveData?.currentLocation?.speedKmh || 0} km/h)` : 'STOPPED'}
          </span>
        </div>

        {/* Follow Train Toggle Button */}
        <button
          onClick={() => {
            const nextState = !followTrain;
            setFollowTrain(nextState);
            if (nextState && liveData?.currentLocation && mapInstance.current) {
              mapInstance.current.easeTo({
                center: [liveData.currentLocation.lng, liveData.currentLocation.lat],
                zoom: 8,
                duration: 800
              });
            }
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md border transition-all flex items-center gap-2 ${
            followTrain
              ? 'bg-cyan-500/90 text-white border-cyan-400 shadow-cyan-500/25'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-900'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${followTrain ? 'animate-pulse text-white' : ''}`} />
          <span>{followTrain ? 'Following Train' : 'Follow Train'}</span>
        </button>

        {/* 3D Tilt Control */}
        <button
          onClick={toggle3D}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md border transition-all flex items-center gap-1.5 ${
            is3D
              ? 'bg-indigo-600/90 text-white border-indigo-400'
              : 'bg-slate-900/80 text-slate-300 hover:text-white border-slate-700/80 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3D {is3D ? 'On' : 'Off'}</span>
        </button>

        {/* Reset Bearing */}
        <button
          onClick={resetBearing}
          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md"
          title="Reset North Orientation"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fit Entire Route */}
        <button
          onClick={fitWholeRoute}
          className="p-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md"
          title="Fit Whole Route"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></span>
          <span>Traveled Track</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t border-dashed border-slate-400"></span>
          <span>Upcoming Track</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Station Halts</span>
        </div>
      </div>

    </div>
  );
}
