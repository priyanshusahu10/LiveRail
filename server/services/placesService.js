// Places and Geographic Companion service (Rivers, Bridges, Ghats, Tunnels, Monuments)

const placesCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Pre-compiled high-value railway landmarks and natural wonders across India
const CURATED_LANDMARKS = [
  { id: "geo-1", name: "Yamuna River Rail Viaduct", type: "Bridge", category: "River & Bridge", distanceAwayKm: 1.2, lat: 28.6612, lng: 77.2514, description: "Historical steel truss bridge across the river Yamuna, dating back to early Indian railways development." },
  { id: "geo-2", name: "Ganga River Rail Bridge", type: "Bridge", category: "Sacred River", distanceAwayKm: 0.8, lat: 25.4285, lng: 81.8791, description: "Massive railway bridge spanning the sacred river Ganga approaching Prayagraj junction." },
  { id: "geo-3", name: "Thal Ghat Incline", type: "Mountain Pass", category: "Ghats & Mountains", distanceAwayKm: 4.5, lat: 19.7012, lng: 73.4912, description: "One of the steepest and most picturesque railway mountain ascents in the Western Ghats." },
  { id: "geo-4", name: "Chambal Ravines & Sanctuary", type: "Landscape", category: "Wildlife & Terrain", distanceAwayKm: 2.1, lat: 26.7891, lng: 79.0345, description: "Protected river sanctuary known for gharials, gangetic dolphins, and steep mud ravines." },
  { id: "geo-5", name: "Silver Jubilee Narmada Bridge", type: "Engineering", category: "Engineering Marvel", distanceAwayKm: 0.5, lat: 21.7051, lng: 72.9812, description: "Iconic double-line railway bridge constructed over the tidal mouth of River Narmada." },
  { id: "geo-6", name: "Dara Pass / Mukundara Hills", type: "Gorge", category: "National Park", distanceAwayKm: 3.2, lat: 24.8124, lng: 75.7891, description: "Dramatic rocky mountain cleft cut through by the double electrified track in Rajasthan." },
  { id: "geo-7", name: "Nehru Setu Bridge", type: "Bridge", category: "Engineering Marvel", distanceAwayKm: 0.2, lat: 24.9124, lng: 84.1892, description: "3.06 km long continuous rail girder bridge across the Son river, among the longest in Asia." },
  { id: "geo-8", name: "Taj Mahal Viewpoint", type: "Monument", category: "UNESCO Heritage", distanceAwayKm: 4.1, lat: 27.1751, lng: 78.0421, description: "World Wonder visible from the railway curves as the train enters the historic Agra zone." },
  { id: "geo-9", name: "Vindhyachal Foothills", type: "Mountain Range", category: "Mountains & Forest", distanceAwayKm: 6.0, lat: 25.1245, lng: 82.5124, description: "Ancient sandstone hills forming the geological divide of northern and peninsular India." }
];

/**
 * Calculate distance between two coordinates in km using Haversine formula
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getNearbyPlaces(lat, lng, radiusKm = 60) {
  const cacheKey = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)},${radiusKm}`;
  const cached = placesCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // Find landmarks within search radius or closest features
  const nearby = CURATED_LANDMARKS.map(item => {
    const dist = haversineDistanceKm(lat, lng, item.lat, item.lng);
    return {
      ...item,
      distanceAwayKm: dist
    };
  }).sort((a, b) => a.distanceAwayKm - b.distanceAwayKm).slice(0, 5);

  placesCache.set(cacheKey, { data: nearby, timestamp: Date.now() });
  return nearby;
}
