import { TRAINS_DATABASE } from '../data/trains.js';

// In-memory simulation states per train to give continuous real-time movement
const activeSimulations = new Map();
const railRadarLiveCache = new Map();
const dynamicTrainsCache = new Map();

const RAILRADAR_LIVE_CACHE_TTL_MS = 25 * 1000; // 25s cache for live telemetry
const RAILRADAR_TRAIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h cache for static train routes

/**
 * Safe fetch helper for RailRadar API with timeout and HTML error protection
 */
async function callRailRadarApi(path) {
  const apiKey = process.env.RAILRADAR_API_KEY;
  if (!apiKey) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`https://railradar.in${path}`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'LiveRail/1.0'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`RailRadar ${path} returned status ${res.status}`);
      return null;
    }

    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      console.warn(`RailRadar ${path} returned HTML or non-JSON body`);
      return null;
    }

    return JSON.parse(text);
  } catch (err) {
    console.warn(`RailRadar call failed for ${path}:`, err.message);
    return null;
  }
}

/**
 * Fetch live telemetry from RailRadar API
 */
async function fetchRailRadarLive(trainNumber) {
  const num = String(trainNumber).trim();
  const cached = railRadarLiveCache.get(num);
  if (cached && (Date.now() - cached.timestamp < RAILRADAR_LIVE_CACHE_TTL_MS)) {
    return cached.data;
  }

  const json = await callRailRadarApi(`/api/v1/trains/${num}/live`);
  if (json && json.success && json.data) {
    railRadarLiveCache.set(num, { data: json.data, timestamp: Date.now() });
    return json.data;
  }
  return null;
}

/**
 * Fetch full train route, schedule, halts, and intermediate sub-stations from RailRadar API
 */
async function fetchRailRadarTrain(trainNumber) {
  const num = String(trainNumber).trim();
  const cached = dynamicTrainsCache.get(num);
  if (cached && (Date.now() - cached.timestamp < RAILRADAR_TRAIN_CACHE_TTL_MS)) {
    return cached.data;
  }

  const json = await callRailRadarApi(`/api/v1/trains/${num}`);
  if (!json || !json.success || !json.data || !json.data.train) {
    return null;
  }

  const t = json.data.train;
  const rawStops = Object.values(json.data.route || {}).sort((a, b) => a.sequence - b.sequence);

  // Extract valid GPS coordinates for GeoJSON map route line
  const validCoords = rawStops
    .filter(s => s.station && typeof s.station.lat === 'number' && typeof s.station.lng === 'number')
    .map(s => [s.station.lng, s.station.lat]);

  // Group intermediate sub-stations between scheduled passenger halts
  const halts = [];
  let pendingSubStations = [];

  for (const s of rawStops) {
    const isHalt = Boolean(s.isHalt);
    const stationData = {
      sequence: s.sequence,
      code: s.station?.code || s.stationCode || 'STN',
      name: s.station?.name || s.stationName || 'Station',
      isHalt,
      platform: s.platform ? String(s.platform) : null,
      distanceKm: s.distance || 0,
      scheduledArrival: s.arrival || (s.departure ? s.departure : '--:--'),
      scheduledDeparture: s.departure || (s.arrival ? s.arrival : '--:--'),
      haltMinutes: s.haltDuration || (isHalt ? 2 : 0),
      speedToNextStationKmph: s.speedToNextStationKmph || null,
      lat: s.station?.lat || 0,
      lng: s.station?.lng || 0,
      elevationM: Math.round(50 + ((s.distance || 0) % 250))
    };

    if (isHalt) {
      halts.push({
        ...stationData,
        scheduledArrival: s.arrival || (halts.length === 0 ? 'Source' : '--:--'),
        scheduledDeparture: s.departure || '--:--',
        subStations: [...pendingSubStations]
      });
      pendingSubStations = [];
    } else {
      pendingSubStations.push(stationData);
    }
  }

  // Ensure last halt has proper destination tag
  if (halts.length > 0) {
    halts[halts.length - 1].scheduledDeparture = 'Destination';
    if (pendingSubStations.length > 0) {
      halts[halts.length - 1].subStations.push(...pendingSubStations);
    }
  }

  const elevationProfile = halts.map(h => ({
    distance: h.distanceKm,
    elevation: h.elevationM,
    station: h.name
  }));

  const trainObj = {
    trainNumber: String(t.number || num),
    trainName: t.name || `Express ${num}`,
    type: t.type || t.category || 'Express',
    origin: {
      code: t.source?.code || 'SRC',
      name: t.source?.name || 'Source Station',
      city: t.source?.name || 'Source',
      lat: t.source?.lat || (validCoords[0] ? validCoords[0][1] : 28.6139),
      lng: t.source?.lng || (validCoords[0] ? validCoords[0][0] : 77.2090)
    },
    destination: {
      code: t.destination?.code || 'DST',
      name: t.destination?.name || 'Destination Station',
      city: t.destination?.name || 'Destination',
      lat: t.destination?.lat || (validCoords.length ? validCoords[validCoords.length - 1][1] : 19.0760),
      lng: t.destination?.lng || (validCoords.length ? validCoords[validCoords.length - 1][0] : 72.8777)
    },
    days: t.runDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    totalDistance: t.distance || (halts.length ? halts[halts.length - 1].distanceKm : 500),
    totalDuration: t.duration ? `${Math.floor(t.duration / 60)}h ${t.duration % 60}m` : '8h 00m',
    avgSpeed: t.avgSpeed || 75,
    maxSpeed: t.maxSpeed || 110,
    departureTime: halts[0]?.scheduledDeparture || '06:00',
    arrivalTime: halts[halts.length - 1]?.scheduledArrival || '18:00',
    stations: halts.length > 0 ? halts : [
      { code: 'SRC', name: t.source?.name || 'Source', platform: '1', distanceKm: 0, scheduledArrival: 'Source', scheduledDeparture: '06:00', lat: validCoords[0]?.[1] || 28.6, lng: validCoords[0]?.[0] || 77.2, elevationM: 100, subStations: [] },
      { code: 'DST', name: t.destination?.name || 'Destination', platform: '1', distanceKm: t.distance || 500, scheduledArrival: '18:00', scheduledDeparture: 'Destination', lat: validCoords[validCoords.length-1]?.[1] || 19.0, lng: validCoords[validCoords.length-1]?.[0] || 72.8, elevationM: 150, subStations: [] }
    ],
    routeGeoJSON: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: validCoords.length >= 2 ? validCoords : [
          [t.source?.lng || 77.2, t.source?.lat || 28.6],
          [t.destination?.lng || 72.8, t.destination?.lat || 19.0]
        ]
      }
    },
    elevationProfile,
    pois: []
  };

  dynamicTrainsCache.set(num, { data: trainObj, timestamp: Date.now() });
  return trainObj;
}

/**
 * Search trains by number, name, or station code
 */
export async function searchTrains(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }
  const cleanQ = query.trim().toLowerCase();

  // Search local built-in database first
  const localResults = TRAINS_DATABASE.filter(t => 
    t.trainNumber.toLowerCase().includes(cleanQ) ||
    t.trainName.toLowerCase().includes(cleanQ) ||
    t.origin.name.toLowerCase().includes(cleanQ) ||
    t.origin.code.toLowerCase().includes(cleanQ) ||
    t.destination.name.toLowerCase().includes(cleanQ) ||
    t.destination.code.toLowerCase().includes(cleanQ)
  ).map(t => ({
    trainNumber: t.trainNumber,
    trainName: t.trainName,
    type: t.type,
    origin: t.origin,
    destination: t.destination,
    totalDistance: t.totalDistance,
    totalDuration: t.totalDuration,
    departureTime: t.departureTime,
    arrivalTime: t.arrivalTime,
    days: t.days
  }));

  // If query is a 5-digit number and not found in local results, look it up in RailRadar!
  if (/^\d{5}$/.test(cleanQ) && !localResults.some(t => t.trainNumber === cleanQ)) {
    try {
      const rrTrain = await getTrainByNumber(cleanQ);
      if (rrTrain) {
        localResults.push({
          trainNumber: rrTrain.trainNumber,
          trainName: rrTrain.trainName,
          type: rrTrain.type,
          origin: rrTrain.origin,
          destination: rrTrain.destination,
          totalDistance: rrTrain.totalDistance,
          totalDuration: rrTrain.totalDuration,
          departureTime: rrTrain.departureTime,
          arrivalTime: rrTrain.arrivalTime,
          days: rrTrain.days
        });
      }
    } catch (_) {}
  }

  return localResults;
}

/**
 * Get train details by number (Dynamic Cache -> RailRadar API with full sub-stations -> Local DB)
 */
export async function getTrainByNumber(trainNumber) {
  if (!trainNumber) return null;
  const num = String(trainNumber).trim();

  // 1. Dynamic cache
  const cached = dynamicTrainsCache.get(num);
  if (cached && (Date.now() - cached.timestamp < RAILRADAR_TRAIN_CACHE_TTL_MS)) {
    return cached.data;
  }

  // 2. Query RailRadar API for comprehensive halts & 100+ sub-stations
  const rrTrain = await fetchRailRadarTrain(num);
  if (rrTrain) return rrTrain;

  // 3. Fallback to local curated database
  const local = TRAINS_DATABASE.find(t => t.trainNumber === num);
  if (local) return local;

  return null;
}

/**
 * Calculate bearing between two coordinates [lng1, lat1] and [lng2, lat2]
 */
function calculateBearing(coord1, coord2) {
  const lon1 = (coord1[0] * Math.PI) / 180;
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lon2 = (coord2[0] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;

  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

  const initialBearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (initialBearing + 360) % 360;
}

/**
 * Linear interpolation between two coordinates
 */
function interpolateCoord(coord1, coord2, ratio) {
  return [
    coord1[0] + (coord2[0] - coord1[0]) * ratio,
    coord1[1] + (coord2[1] - coord1[1]) * ratio
  ];
}

/**
 * Get live tracking telemetry for a train.
 * Blends real RailRadar GPS & delay telemetry with high-fidelity interpolation.
 * Computes explicit RUNNING vs STOPPED status and evaluates all intermediate sub-stations.
 */
export async function getLiveTracking(trainNumber) {
  const train = await getTrainByNumber(trainNumber);
  if (!train) return null;

  const routeCoords = train.routeGeoJSON.geometry.coordinates;
  const totalSegments = Math.max(1, routeCoords.length - 1);
  const now = Date.now();

  let sim = activeSimulations.get(trainNumber);
  if (!sim) {
    sim = {
      progressRatio: 0.42,
      lastTick: now,
      delayMinutes: train.type === 'Vande Bharat' ? 0 : 8,
      currentSpeed: Math.floor(train.avgSpeed || 75),
      isStationary: false,
      haltCountdown: 0
    };
    activeSimulations.set(trainNumber, sim);
  }

  // Fetch real RailRadar live telemetry
  let rrLive = null;
  try {
    rrLive = await fetchRailRadarLive(trainNumber);
  } catch (_) {}

  let isRealRailRadar = false;
  let approximateLocation = null;
  let delayStatus = 'On Time';
  let delayColor = 'emerald';

  if (rrLive) {
    isRealRailRadar = true;

    // 1. Sync real delay
    if (typeof rrLive.delayMinutes === 'number') {
      sim.delayMinutes = rrLive.delayMinutes;
    }

    // 2. Sync real speed
    if (rrLive.currentLocation?.speedKmh !== undefined && rrLive.currentLocation.speedKmh !== null) {
      sim.currentSpeed = Math.round(rrLive.currentLocation.speedKmh);
      sim.isStationary = sim.currentSpeed === 0;
    } else if (rrLive.status === 'not-started' || rrLive.status === 'completed') {
      sim.currentSpeed = 0;
      sim.isStationary = true;
    }

    // 3. Sync real journey progress and status
    if (rrLive.status === 'not-started') {
      sim.progressRatio = 0.0;
      sim.currentSpeed = 0;
      sim.isStationary = true;
      approximateLocation = `At Origin: ${train.origin.name} (Scheduled: ${train.departureTime})`;
      delayStatus = 'Scheduled';
      delayColor = 'blue';
    } else if (rrLive.status === 'completed') {
      sim.progressRatio = 1.0;
      sim.currentSpeed = 0;
      sim.isStationary = true;
      approximateLocation = `Journey Completed at ${train.destination.name}`;
      delayStatus = 'Completed';
      delayColor = 'emerald';
    } else {
      // Running / en-route: calculate exact position from distanceFromOriginKm
      if (rrLive.currentLocation && typeof rrLive.currentLocation.distanceFromOriginKm === 'number') {
        const totalDist = train.totalDistance || 1;
        const realKm = rrLive.currentLocation.distanceFromOriginKm;
        sim.progressRatio = Math.min(0.995, Math.max(0, realKm / totalDist));
      } else if (rrLive.previousHalt && typeof rrLive.previousHalt.distance === 'number') {
        const totalDist = train.totalDistance || 1;
        sim.progressRatio = Math.min(0.995, Math.max(0, rrLive.previousHalt.distance / totalDist));
      }

      if (rrLive.currentLocation?.stationName) {
        const isAtStation = rrLive.currentLocation.status === 'at-station';
        if (isAtStation) {
          sim.currentSpeed = 0;
          sim.isStationary = true;
        }
        approximateLocation = `${isAtStation ? 'Currently at' : 'Departed'} ${rrLive.currentLocation.stationName}`;
      }

      if (sim.delayMinutes > 15) {
        delayStatus = `Delayed by ${sim.delayMinutes}m`;
        delayColor = 'rose';
      } else if (sim.delayMinutes > 0) {
        delayStatus = `Late by ${sim.delayMinutes}m`;
        delayColor = 'amber';
      } else {
        delayStatus = 'On Time';
        delayColor = 'emerald';
      }
    }
  } else {
    // Pure simulation advance
    const deltaSeconds = Math.max(1, (now - sim.lastTick) / 1000);
    sim.progressRatio = (sim.progressRatio + (deltaSeconds * 0.00018)) % 0.98;
    sim.currentSpeed = Math.floor(train.avgSpeed * (0.9 + Math.sin(now / 20000) * 0.22));
    sim.isStationary = sim.currentSpeed <= 5;
    if (sim.delayMinutes > 15) {
      delayStatus = `Delayed by ${sim.delayMinutes}m`;
      delayColor = 'rose';
    } else if (sim.delayMinutes > 0) {
      delayStatus = `Late by ${sim.delayMinutes}m`;
      delayColor = 'amber';
    }
  }
  sim.lastTick = now;

  // Determine current position on the line segment
  const exactSegment = sim.progressRatio * totalSegments;
  const segmentIndex = Math.min(totalSegments - 1, Math.floor(exactSegment));
  const segmentRatio = exactSegment - segmentIndex;

  const p1 = routeCoords[segmentIndex] || routeCoords[0];
  const p2 = routeCoords[segmentIndex + 1] || p1;
  const currentCoords = interpolateCoord(p1, p2, segmentRatio);
  const bearing = Math.round(calculateBearing(p1, p2));

  // Distance calculations
  const distanceCovered = Math.round(train.totalDistance * sim.progressRatio);
  const distanceRemaining = Math.max(0, train.totalDistance - distanceCovered);
  const progressPercent = Math.round(sim.progressRatio * 100);

  // Identify passed stations, current / next station, and evaluate intermediate sub-stations
  let totalSubStationsCount = 0;
  let passedSubStationsCount = 0;

  const stations = train.stations.map((st, idx) => {
    const isPassed = distanceCovered >= st.distanceKm;
    let status = 'upcoming';
    if (Math.abs(distanceCovered - st.distanceKm) < 15) {
      status = 'current';
    } else if (isPassed) {
      status = 'departed';
    }

    // Process all sub-stations between previous stop and this stop
    const subStations = (st.subStations || []).map((sub) => {
      totalSubStationsCount++;
      const subPassed = distanceCovered >= (sub.distanceKm || 0);
      let subStatus = 'upcoming';
      if (Math.abs(distanceCovered - (sub.distanceKm || 0)) < 4) {
        subStatus = 'current';
      } else if (subPassed) {
        subStatus = 'departed';
        passedSubStationsCount++;
      }
      return {
        ...sub,
        status: subStatus,
        delayMinutes: subPassed ? Math.max(0, sim.delayMinutes) : sim.delayMinutes
      };
    });

    return {
      ...st,
      status,
      delayMinutes: isPassed ? Math.max(0, sim.delayMinutes - (idx === 0 ? 0 : 2)) : sim.delayMinutes,
      subStations
    };
  });

  const nextStationObj = stations.find(s => s.distanceKm > distanceCovered) || stations[stations.length - 1];
  const lastDepartedStation = [...stations].reverse().find(s => s.distanceKm <= distanceCovered) || stations[0];

  if (!approximateLocation) {
    approximateLocation = `Near ${lastDepartedStation.name}`;
  }

  // Estimate next station ETA
  const distToNext = Math.max(1, nextStationObj.distanceKm - distanceCovered);
  const hoursToNext = distToNext / (sim.currentSpeed || train.avgSpeed || 60);
  const minutesToNext = Math.round(hoursToNext * 60);

  const etaDate = new Date(now + minutesToNext * 60 * 1000);
  const nextStationETA = `${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')}`;

  // Explicit RUNNING vs STOPPED Movement Status Logic
  const isMoving = sim.currentSpeed > 0 && !sim.isStationary && (rrLive ? (rrLive.status !== 'not-started' && rrLive.status !== 'completed') : true);
  const motionStatus = isMoving ? 'RUNNING' : 'STOPPED';

  let motionReason = '';
  if (isMoving) {
    motionReason = `Running at ${sim.currentSpeed} km/h towards ${nextStationObj.name}`;
  } else {
    if (rrLive?.status === 'not-started' || sim.progressRatio <= 0.005) {
      motionReason = `Stopped at Origin (${train.origin.name}) • Scheduled departure ${train.departureTime}`;
    } else if (rrLive?.status === 'completed' || sim.progressRatio >= 0.99) {
      motionReason = `Stopped • Journey Completed at ${train.destination.name}`;
    } else if (Math.abs(distanceCovered - lastDepartedStation.distanceKm) < 10) {
      motionReason = `Stopped at ${lastDepartedStation.name} Station (Halt)`;
    } else {
      motionReason = `Stopped en route near ${lastDepartedStation.name} (Signal / Track wait)`;
    }
  }

  // Completed track slice for MapLibre glow layer
  const completedCoords = routeCoords.slice(0, segmentIndex + 1);
  completedCoords.push(currentCoords);
  const remainingCoords = [currentCoords, ...routeCoords.slice(segmentIndex + 1)];

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    type: train.type,
    origin: train.origin,
    destination: train.destination,
    totalDistance: train.totalDistance,
    totalDuration: train.totalDuration,
    motionStatus, // 'RUNNING' | 'STOPPED'
    isRunning: isMoving,
    isStopped: !isMoving,
    motionReason,
    totalSubStationsCount,
    passedSubStationsCount,
    currentLocation: {
      lng: currentCoords[0],
      lat: currentCoords[1],
      bearing: bearing,
      speedKmh: sim.currentSpeed,
      approximateLocation
    },
    currentStation: lastDepartedStation,
    nextStation: {
      ...nextStationObj,
      distanceAwayKm: distToNext,
      eta: nextStationETA,
      etaMinutes: minutesToNext
    },
    delayMinutes: sim.delayMinutes,
    delayStatus,
    delayColor,
    distanceCovered,
    distanceRemaining,
    progressPercent,
    stations,
    completedRouteGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: completedCoords
      }
    },
    remainingRouteGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: remainingCoords
      }
    },
    elevationProfile: train.elevationProfile || [],
    pois: train.pois || [],
    isLive: isRealRailRadar,
    trackingMode: isRealRailRadar ? (rrLive?.trackingMode || 'GPS Live') : 'Simulated Telemetry',
    railRadarStatus: isRealRailRadar ? rrLive?.status : null,
    dataSource: isRealRailRadar ? 'RailRadar™ Real-Time IRCTC Telemetry' : 'LiveRail Precision Simulator',
    lastUpdated: rrLive?.lastUpdatedAt || new Date().toISOString()
  };
}

/**
 * Get analytics for a train
 */
export async function getTrainAnalytics(trainNumber) {
  const train = await getTrainByNumber(trainNumber);
  if (!train) return null;

  const live = await getLiveTracking(trainNumber);
  if (!live) return null;

  // Calculate highest & lowest elevation points
  const elevations = (train.elevationProfile && train.elevationProfile.length > 0)
    ? train.elevationProfile.map(e => e.elevation)
    : [100, 200];
  const highestElevation = Math.max(...elevations);
  const lowestElevation = Math.min(...elevations);
  
  // Find current elevation based on progress
  let currentElevationObj = { distance: live.distanceCovered, elevation: 150 };
  if (train.elevationProfile && train.elevationProfile.length > 0) {
    currentElevationObj = train.elevationProfile.reduce((prev, curr) => {
      return (Math.abs(curr.distance - live.distanceCovered) < Math.abs(prev.distance - live.distanceCovered) ? curr : prev);
    });
  }

  return {
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    totalDistance: train.totalDistance,
    distanceCovered: live.distanceCovered,
    distanceRemaining: live.distanceRemaining,
    progressPercent: live.progressPercent,
    currentSpeed: live.currentLocation.speedKmh,
    motionStatus: live.motionStatus,
    avgSpeed: train.avgSpeed,
    maxSpeed: train.maxSpeed,
    currentDelay: live.delayMinutes,
    averageDelay: Math.round(live.delayMinutes * 0.7),
    stationsCompleted: live.stations.filter(s => s.status === 'departed').length,
    stationsRemaining: live.stations.filter(s => s.status !== 'departed').length,
    highestElevation,
    lowestElevation,
    currentElevation: currentElevationObj.elevation,
    elevationProfile: train.elevationProfile || [],
    speedHistory: [
      { time: "06:00", speed: 0, delay: 0 },
      { time: "07:00", speed: Math.round(train.avgSpeed * 0.9), delay: 2 },
      { time: "08:00", speed: Math.round(train.avgSpeed * 1.1), delay: 4 },
      { time: "09:00", speed: Math.round(train.avgSpeed * 0.95), delay: 3 },
      { time: "10:00", speed: Math.round(train.avgSpeed * 1.05), delay: 2 },
      { time: "Now", speed: live.currentLocation.speedKmh, delay: live.delayMinutes }
    ]
  };
}
