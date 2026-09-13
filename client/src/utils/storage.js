// Local storage utility for favourites, recents, and user preferences

const FAVOURITES_KEY = 'liverail_favourites';
const RECENTS_KEY = 'liverail_recents';
const SETTINGS_KEY = 'liverail_settings';

export function getFavourites() {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : [
      { trainNumber: "22436", trainName: "Vande Bharat Express", origin: "New Delhi", destination: "Varanasi" },
      { trainNumber: "12951", trainName: "Mumbai Rajdhani", origin: "Mumbai Central", destination: "New Delhi" }
    ];
  } catch {
    return [];
  }
}

export function toggleFavourite(train) {
  const favs = getFavourites();
  const existsIndex = favs.findIndex(f => f.trainNumber === train.trainNumber);
  let updated;
  if (existsIndex >= 0) {
    updated = favs.filter(f => f.trainNumber !== train.trainNumber);
  } else {
    updated = [
      {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        origin: train.origin?.name || train.origin,
        destination: train.destination?.name || train.destination
      },
      ...favs
    ];
  }
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
  return updated;
}

export function isFavourite(trainNumber) {
  const favs = getFavourites();
  return favs.some(f => f.trainNumber === trainNumber);
}

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [
      { trainNumber: "22436", trainName: "Vande Bharat Express", origin: "NDLS", destination: "BSB" },
      { trainNumber: "12951", trainName: "Mumbai Rajdhani", origin: "MMCT", destination: "NDLS" },
      { trainNumber: "12004", trainName: "Lucknow Shatabdi", origin: "NDLS", destination: "LJN" }
    ];
  } catch {
    return [];
  }
}

export function addRecentSearch(train) {
  const recents = getRecentSearches().filter(r => r.trainNumber !== train.trainNumber);
  const updated = [
    {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      origin: train.origin?.code || train.origin?.name || train.origin,
      destination: train.destination?.code || train.destination?.name || train.destination
    },
    ...recents
  ].slice(0, 8);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  return updated;
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { refreshInterval: 30, soundEnabled: true };
  } catch {
    return { refreshInterval: 30, soundEnabled: true };
  }
}

export function updateSettings(newSettings) {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}
