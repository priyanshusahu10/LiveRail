import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchTrains, getTrainByNumber, getLiveTracking, getTrainAnalytics } from './services/trainService.js';
import { getWeatherForLocation } from './services/weatherService.js';
import { getNearbyPlaces } from './services/placesService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

// Load environment variables from root .env and local
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory shared journeys map: token -> { trainNumber, createdAt }
const sharedJourneys = new Map();

// Initialize default demo tokens
sharedJourneys.set('ABC123', {
  token: 'ABC123',
  trainNumber: '22436',
  createdAt: new Date().toISOString()
});
sharedJourneys.set('RAJ951', {
  token: 'RAJ951',
  trainNumber: '12951',
  createdAt: new Date().toISOString()
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', product: 'LiveRail API', time: new Date().toISOString() });
});

// Search trains
app.get('/api/trains/search', async (req, res) => {
  const query = req.query.q || '';
  try {
    const results = await searchTrains(query);
    res.json({ results, total: results.length });
  } catch (err) {
    console.error('Search error:', err);
    res.json({ results: [], total: 0 });
  }
});

// Get train route & station details
app.get('/api/trains/:trainNumber/route', async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const train = await getTrainByNumber(trainNumber);
    if (!train) {
      return res.status(404).json({ error: `Train ${trainNumber} not found.` });
    }
    res.json({
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      type: train.type,
      origin: train.origin,
      destination: train.destination,
      totalDistance: train.totalDistance,
      totalDuration: train.totalDuration,
      stations: train.stations,
      routeGeoJSON: train.routeGeoJSON,
      pois: train.pois,
      elevationProfile: train.elevationProfile
    });
  } catch (err) {
    console.error(`Route error for ${trainNumber}:`, err);
    res.status(500).json({ error: `Failed to load route for train ${trainNumber}` });
  }
});

// Get live train tracking
app.get('/api/trains/:trainNumber/live', async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const live = await getLiveTracking(trainNumber);
    if (!live) {
      return res.status(404).json({ error: `Live tracking for train ${trainNumber} unavailable.` });
    }
    res.json(live);
  } catch (err) {
    console.error('Live tracking error:', err);
    res.status(500).json({ error: 'Live tracking temporarily unavailable.' });
  }
});

// Get train analytics
app.get('/api/trains/:trainNumber/analytics', async (req, res) => {
  const { trainNumber } = req.params;
  try {
    const analytics = await getTrainAnalytics(trainNumber);
    if (!analytics) {
      return res.status(404).json({ error: `Analytics for train ${trainNumber} unavailable.` });
    }
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: 'Analytics temporarily unavailable.' });
  }
});

// Get contextual weather
app.get('/api/weather', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const name = req.query.name || '';

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid lat and lng query params required.' });
  }

  try {
    const weather = await getWeatherForLocation(lat, lng, name);
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
});

// Get nearby geographic places & landmarks
app.get('/api/places/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseFloat(req.query.radius) || 60;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid lat and lng query params required.' });
  }

  try {
    const places = await getNearbyPlaces(lat, lng, radius);
    res.json({ places, count: places.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve nearby places.' });
  }
});

// Create share token
app.post('/api/share', (req, res) => {
  const { trainNumber } = req.body;
  if (!trainNumber) {
    return res.status(400).json({ error: 'trainNumber is required.' });
  }

  // Generate 6-char alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  sharedJourneys.set(token, {
    token,
    trainNumber,
    createdAt: new Date().toISOString()
  });

  res.json({
    token,
    shareUrl: `/l/${token}`,
    trainNumber
  });
});

// Retrieve shared journey
app.get('/api/share/:token', async (req, res) => {
  const { token } = req.params;
  const share = sharedJourneys.get(token.toUpperCase());
  if (!share) {
    return res.status(404).json({ error: 'Shared journey not found or link has expired.' });
  }

  const live = await getLiveTracking(share.trainNumber);
  res.json({
    ...share,
    liveData: live
  });
});

app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not Found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚆 LiveRail Server running at http://localhost:${PORT}`);
});

