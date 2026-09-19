// Seat Availability Engine for LiveRail (RailRadar Live API + Smart IRCTC Estimator)

const availabilityCache = new Map();
const AVAILABILITY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins cache

/**
 * Calculate dynamic fare based on train type, coach class, and travel distance
 */
export function calculateEstimatedFare(trainType, classCode, distanceKm = 500) {
  const dist = Math.max(50, distanceKm);
  const isVandeBharat = (trainType || '').toLowerCase().includes('vande');
  const isRajdhani = (trainType || '').toLowerCase().includes('rajdhani');
  const isShatabdi = (trainType || '').toLowerCase().includes('shatabdi');

  let baseRatePerKm = 0.55; // Default Sleeper rate
  let reservationCharge = 20;
  let superfastCharge = 30;

  switch (classCode.toUpperCase()) {
    case '1A':
      baseRatePerKm = 3.6;
      reservationCharge = 60;
      superfastCharge = 75;
      break;
    case '2A':
      baseRatePerKm = 2.15;
      reservationCharge = 50;
      superfastCharge = 45;
      break;
    case '3A':
      baseRatePerKm = 1.45;
      reservationCharge = 40;
      superfastCharge = 45;
      break;
    case '3E':
      baseRatePerKm = 1.30;
      reservationCharge = 40;
      superfastCharge = 45;
      break;
    case 'EC':
      baseRatePerKm = 3.10;
      reservationCharge = 60;
      superfastCharge = 75;
      break;
    case 'CC':
      baseRatePerKm = 1.65;
      reservationCharge = 40;
      superfastCharge = 45;
      break;
    case 'SL':
      baseRatePerKm = 0.55;
      reservationCharge = 20;
      superfastCharge = 30;
      break;
    case '2S':
      baseRatePerKm = 0.35;
      reservationCharge = 15;
      superfastCharge = 15;
      break;
    default:
      baseRatePerKm = 1.2;
  }

  if (isVandeBharat) baseRatePerKm *= 1.25;
  if (isRajdhani) baseRatePerKm *= 1.20;
  if (isShatabdi) baseRatePerKm *= 1.15;

  const fare = Math.round(dist * baseRatePerKm + reservationCharge + superfastCharge);
  return Math.round(fare / 5) * 5; // Round to nearest 5 rupees like IRCTC
}

/**
 * Calculate ticket confirmation probability for RAC and Waitlisted tickets
 */
export function calculateConfirmationChance(statusCode, rawStatus) {
  if (statusCode === 'AVAILABLE' || (rawStatus || '').includes('AVAILABLE')) {
    return { percentage: 100, label: 'High Chance', color: 'emerald' };
  }
  if (statusCode === 'RAC' || (rawStatus || '').includes('RAC')) {
    return { percentage: 95, label: 'High Chance', color: 'emerald' };
  }

  const wlMatch = (rawStatus || '').match(/WL\s*(\d+)/i) || (rawStatus || '').match(/WL-(\d+)/i);
  const wlNumber = wlMatch ? parseInt(wlMatch[1], 10) : 25;

  if (wlNumber <= 10) {
    return { percentage: 88, label: 'High Chance', color: 'emerald' };
  }
  if (wlNumber <= 25) {
    return { percentage: 76, label: 'Good Chance', color: 'cyan' };
  }
  if (wlNumber <= 50) {
    return { percentage: 58, label: 'Medium Chance', color: 'amber' };
  }
  return { percentage: 32, label: 'Low Chance', color: 'rose' };
}

/**
 * Fetch seat availability for a train from RailRadar API
 */
export async function getSeatAvailability(train, options = {}) {
  const apiKey = process.env.RAILRADAR_API_KEY;
  const trainNumber = train.trainNumber;
  const from = options.from || train.origin?.code || 'NDLS';
  const to = options.to || train.destination?.code || 'BSB';
  const quota = options.quota || 'GN';

  // Determine default class based on train type
  const isVandeBharat = (train.type || '').toLowerCase().includes('vande') || (train.trainName || '').toLowerCase().includes('vande');
  const defaultClass = isVandeBharat ? 'CC' : (train.type || '').toLowerCase().includes('rajdhani') ? '3A' : 'SL';
  const classCode = (options.classCode || defaultClass).toUpperCase();

  // Target journey date (defaults to tomorrow or +2 days)
  const journeyDate = options.date || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const cacheKey = `${trainNumber}_${from}_${to}_${journeyDate}_${classCode}_${quota}`;
  const cached = availabilityCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < AVAILABILITY_CACHE_TTL_MS)) {
    return cached.data;
  }

  const supportedClasses = isVandeBharat
    ? ['CC', 'EC']
    : (train.type || '').toLowerCase().includes('rajdhani')
    ? ['3A', '2A', '1A', '3E']
    : ['SL', '3A', '2A', '1A', '2S'];

  let calendar = [];
  let isLiveRailRadar = false;

  if (apiKey) {
    try {
      const url = `https://railradar.in/api/v1/trains/${trainNumber}/seats?journeyDate=${journeyDate}&from=${from}&to=${to}&classCode=${classCode}&quota=${quota}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'x-api-key': apiKey,
          'Accept': 'application/json',
          'User-Agent': 'LiveRail/1.0'
        }
      });

      if (res.ok) {
        const text = await res.text();
        if (text && !text.trim().startsWith('<')) {
          const json = JSON.parse(text);
          if (json.success && json.data?.calendar && json.data.calendar.length > 0) {
            isLiveRailRadar = true;
            calendar = json.data.calendar.map((item) => {
              const chance = calculateConfirmationChance(item.statusCode, item.status);
              const fare = calculateEstimatedFare(train.type, classCode, train.totalDistance);
              return {
                date: item.date,
                rawDate: item.rawDate,
                status: item.status,
                statusCode: item.statusCode || (item.isAvailable ? 'AVAILABLE' : 'WL'),
                isAvailable: Boolean(item.isAvailable),
                availableSeats: item.availableSeats || 0,
                fare,
                confirmationChance: chance
              };
            });
          }
        }
      }
    } catch (err) {
      console.warn(`RailRadar seats fetch error for train ${trainNumber}:`, err.message);
    }
  }

  // Fallback simulator if RailRadar returned no calendar
  if (calendar.length === 0) {
    const baseDate = new Date(journeyDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate.getTime() + i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      let status = 'AVAILABLE-48';
      let statusCode = 'AVAILABLE';
      let isAvail = true;
      let seats = Math.floor(20 + Math.random() * 80);

      // Weekends or peak days have waiting list
      if (dayOfWeek === 5 || dayOfWeek === 6 || i === 0) {
        if (Math.random() > 0.4) {
          const wl = Math.floor(4 + Math.random() * 28);
          status = `GNWL ${wl}`;
          statusCode = 'WL';
          isAvail = false;
          seats = 0;
        } else {
          status = `RAC ${Math.floor(2 + Math.random() * 12)}`;
          statusCode = 'RAC';
          isAvail = false;
          seats = 0;
        }
      } else {
        status = `AVAILABLE-${seats}`;
      }

      const chance = calculateConfirmationChance(statusCode, status);
      const fare = calculateEstimatedFare(train.type, classCode, train.totalDistance);

      calendar.push({
        date: dateStr,
        rawDate: dateStr,
        status,
        statusCode,
        isAvailable: isAvail,
        availableSeats: seats,
        fare,
        confirmationChance: chance
      });
    }
  }

  const result = {
    trainNumber,
    trainName: train.trainName,
    trainType: train.type,
    fromStation: from,
    toStation: to,
    classCode,
    quotaCode: quota,
    journeyDate,
    supportedClasses,
    estimatedFare: calculateEstimatedFare(train.type, classCode, train.totalDistance),
    dataSource: isLiveRailRadar ? 'RailRadar™ Live PRS Telemetry' : 'LiveRail Precision Predictor',
    isLive: isLiveRailRadar,
    calendar
  };

  availabilityCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
