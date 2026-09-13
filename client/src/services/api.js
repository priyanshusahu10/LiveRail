// API Service client for LiveRail

const API_BASE = '/api';

export async function searchTrainsApi(query) {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await fetch(`${API_BASE}/trains/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('searchTrainsApi error:', err);
    return [];
  }
}

export async function getTrainRouteApi(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}/route`);
  if (!res.ok) throw new Error(`Failed to fetch route for train ${trainNumber}`);
  return await res.json();
}

export async function getLiveTrackingApi(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}/live`);
  if (!res.ok) throw new Error(`Failed to fetch live tracking for train ${trainNumber}`);
  return await res.json();
}

export async function getTrainAnalyticsApi(trainNumber) {
  const res = await fetch(`${API_BASE}/trains/${trainNumber}/analytics`);
  if (!res.ok) throw new Error(`Failed to fetch analytics for train ${trainNumber}`);
  return await res.json();
}

export async function getWeatherApi(lat, lng, name = '') {
  try {
    const res = await fetch(`${API_BASE}/weather?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error('Weather fetch failed');
    return await res.json();
  } catch (err) {
    console.error('getWeatherApi error:', err);
    return null;
  }
}

export async function getNearbyPlacesApi(lat, lng, radius = 60) {
  try {
    const res = await fetch(`${API_BASE}/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
    if (!res.ok) throw new Error('Places fetch failed');
    const data = await res.json();
    return data.places || [];
  } catch (err) {
    console.error('getNearbyPlacesApi error:', err);
    return [];
  }
}

export async function createShareLinkApi(trainNumber) {
  const res = await fetch(`${API_BASE}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainNumber })
  });
  if (!res.ok) throw new Error('Failed to create share link');
  return await res.json();
}

export async function getSharedJourneyApi(token) {
  const res = await fetch(`${API_BASE}/share/${token}`);
  if (!res.ok) throw new Error('Shared journey not found or expired');
  return await res.json();
}
