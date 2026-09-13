// Database of popular Indian Railways trains with high-precision routes, stations, elevation, and POIs

export const TRAINS_DATABASE = [
  {
    trainNumber: "22436",
    trainName: "Vande Bharat Express",
    type: "Vande Bharat",
    origin: { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", lat: 28.6424, lng: 77.2195 },
    destination: { code: "BSB", name: "Varanasi Junction", city: "Varanasi", state: "Uttar Pradesh", lat: 25.3283, lng: 82.9863 },
    days: ["Sun", "Tue", "Wed", "Fri", "Sat"],
    totalDistance: 759,
    totalDuration: "8h 00m",
    avgSpeed: 95,
    maxSpeed: 130,
    departureTime: "06:00",
    arrivalTime: "14:00",
    stations: [
      {
        code: "NDLS",
        name: "New Delhi",
        platform: "16",
        distanceKm: 0,
        scheduledArrival: "Source",
        scheduledDeparture: "06:00",
        haltMinutes: 0,
        lat: 28.6424,
        lng: 77.2195,
        elevationM: 216
      },
      {
        code: "CNB",
        name: "Kanpur Central",
        platform: "4",
        distanceKm: 440,
        scheduledArrival: "10:08",
        scheduledDeparture: "10:10",
        haltMinutes: 2,
        lat: 26.4547,
        lng: 80.3507,
        elevationM: 126
      },
      {
        code: "PRYJ",
        name: "Prayagraj Junction",
        platform: "6",
        distanceKm: 635,
        scheduledArrival: "12:08",
        scheduledDeparture: "12:10",
        haltMinutes: 2,
        lat: 25.4484,
        lng: 81.8333,
        elevationM: 98
      },
      {
        code: "BSB",
        name: "Varanasi Junction",
        platform: "1",
        distanceKm: 759,
        scheduledArrival: "14:00",
        scheduledDeparture: "Destination",
        haltMinutes: 0,
        lat: 25.3283,
        lng: 82.9863,
        elevationM: 81
      }
    ],
    // High-resolution railway waypoints tracing Delhi -> Kanpur -> Prayagraj -> Varanasi
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2195, 28.6424],
          [77.3112, 28.6582],
          [77.4326, 28.6692], // Ghaziabad
          [77.7214, 28.3541],
          [78.0772, 27.8974], // Aligarh
          [78.2435, 27.5126],
          [78.4321, 27.2456], // Tundla
          [78.7892, 27.0124],
          [79.0234, 26.7789], // Etawah
          [79.4321, 26.6543],
          [79.8923, 26.5412],
          [80.3507, 26.4547], // Kanpur Central
          [80.7541, 26.1235],
          [81.1245, 25.8234], // Fatehpur
          [81.5123, 25.6231],
          [81.8333, 25.4484], // Prayagraj Junction
          [82.2145, 25.3892], // Janghai
          [82.6234, 25.3512],
          [82.9863, 25.3283]  // Varanasi Junction
        ]
      }
    },
    pois: [
      { id: "poi-1", name: "Yamuna River Rail Bridge", category: "Bridge", description: "Iconic railway crossing bridging the historic Yamuna river corridor.", lat: 28.6612, lng: 77.2514 },
      { id: "poi-2", name: "Upper Ganga Canal", category: "Waterway", description: "19th century British-era engineering marvel sustaining western UP.", lat: 27.9124, lng: 78.1124 },
      { id: "poi-3", name: "Chambal Ravines Gateway", category: "Landscape", description: "Rugged badlands and scenic topography near Etawah.", lat: 26.7891, lng: 79.0345 },
      { id: "poi-4", name: "Ganga-Yamuna Sangam", category: "Heritage", description: "Sacred confluence visible from the Prayagraj railway approach.", lat: 25.4285, lng: 81.8791 },
      { id: "poi-5", name: "Malviya Bridge (Dufferin)", category: "Historic Bridge", description: "Double-decked rail & road girder bridge over the Ganges.", lat: 25.3214, lng: 83.0312 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 216, label: "New Delhi" },
      { distance: 130, elevation: 187, label: "Aligarh" },
      { distance: 204, elevation: 168, label: "Tundla" },
      { distance: 296, elevation: 145, label: "Etawah" },
      { distance: 440, elevation: 126, label: "Kanpur Central" },
      { distance: 518, elevation: 114, label: "Fatehpur" },
      { distance: 635, elevation: 98, label: "Prayagraj" },
      { distance: 759, elevation: 81, label: "Varanasi Jn" }
    ]
  },
  {
    trainNumber: "12951",
    trainName: "Mumbai Tejas Rajdhani Express",
    type: "Rajdhani",
    origin: { code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra", lat: 18.9696, lng: 72.8193 },
    destination: { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", lat: 28.6424, lng: 77.2195 },
    days: ["Daily"],
    totalDistance: 1386,
    totalDuration: "15h 32m",
    avgSpeed: 89,
    maxSpeed: 140,
    departureTime: "17:00",
    arrivalTime: "08:32",
    stations: [
      { code: "MMCT", name: "Mumbai Central", platform: "1", distanceKm: 0, scheduledArrival: "Source", scheduledDeparture: "17:00", haltMinutes: 0, lat: 18.9696, lng: 72.8193, elevationM: 8 },
      { code: "BVI", name: "Borivali", platform: "6", distanceKm: 30, scheduledArrival: "17:22", scheduledDeparture: "17:24", haltMinutes: 2, lat: 19.2288, lng: 72.8575, elevationM: 14 },
      { code: "ST", name: "Surat", platform: "1", distanceKm: 263, scheduledArrival: "19:43", scheduledDeparture: "19:48", haltMinutes: 5, lat: 21.2049, lng: 72.8406, elevationM: 18 },
      { code: "BRC", name: "Vadodara Junction", platform: "2", distanceKm: 392, scheduledArrival: "21:06", scheduledDeparture: "21:16", haltMinutes: 10, lat: 22.3107, lng: 73.1812, elevationM: 35 },
      { code: "RTM", name: "Ratlam Junction", platform: "5", distanceKm: 653, scheduledArrival: "00:25", scheduledDeparture: "00:28", haltMinutes: 3, lat: 23.3341, lng: 75.0375, elevationM: 493 },
      { code: "KOTA", name: "Kota Junction", platform: "1", distanceKm: 920, scheduledArrival: "03:15", scheduledDeparture: "03:20", haltMinutes: 5, lat: 25.2138, lng: 75.8648, elevationM: 253 },
      { code: "NDLS", name: "New Delhi", platform: "2", distanceKm: 1386, scheduledArrival: "08:32", scheduledDeparture: "Destination", haltMinutes: 0, lat: 28.6424, lng: 77.2195, elevationM: 216 }
    ],
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [72.8193, 18.9696],
          [72.8575, 19.2288], // Borivali
          [72.8124, 19.6987], // Palghar
          [72.9124, 20.3789], // Vapi
          [72.9324, 20.9456], // Navsari
          [72.8406, 21.2049], // Surat (Tapi River)
          [73.0124, 21.7123], // Bharuch (Narmada River)
          [73.1812, 22.3107], // Vadodara
          [73.6124, 22.7541], // Godhra
          [74.2541, 22.9012], // Dahod
          [75.0375, 23.3341], // Ratlam (Malwa Plateau ascent)
          [75.4214, 24.1235], // Shamgarh
          [75.8648, 25.2138], // Kota (Chambal River gorge)
          [76.3541, 25.8912], // Sawai Madhopur
          [76.9124, 26.6541], // Gangapur City
          [77.4124, 27.1892], // Bharatpur
          [77.6892, 27.4921], // Mathura (Yamuna)
          [77.2195, 28.6424]  // New Delhi
        ]
      }
    },
    pois: [
      { id: "poi-201", name: "Bassein Creek Viaduct", category: "Bridge", description: "Scenic tidal creek viaduct opening into the Arabian Sea inlet.", lat: 19.3312, lng: 72.8412 },
      { id: "poi-202", name: "Tapi River Golden Viaduct", category: "River Crossing", description: "Spanning the sacred Tapi river flowing into the Gulf of Khambhat.", lat: 21.2215, lng: 72.8312 },
      { id: "poi-203", name: "Silver Jubilee Narmada Bridge", category: "Engineering Marvel", description: "Historic 1.4km railway bridge over the mighty Narmada at Bharuch.", lat: 21.7051, lng: 72.9812 },
      { id: "poi-204", name: "Dara Pass / Mukundara Hills", category: "Mountain Pass", description: "Spectacular rocky cutting through the Vindhya & Mukundara Hills before Kota.", lat: 24.8124, lng: 75.7891 },
      { id: "poi-205", name: "Chambal River Gorge", category: "Gorge & Wildlife", description: "Majestic deep canyon of the perennial Chambal river.", lat: 25.1891, lng: 75.8341 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 8, label: "Mumbai Central" },
      { distance: 30, elevation: 14, label: "Borivali" },
      { distance: 263, elevation: 18, label: "Surat" },
      { distance: 392, elevation: 35, label: "Vadodara" },
      { distance: 520, elevation: 180, label: "Dahod (Ghats)" },
      { distance: 653, elevation: 493, label: "Ratlam Plateau (Peak)" },
      { distance: 920, elevation: 253, label: "Kota Valley" },
      { distance: 1100, elevation: 210, label: "Gangapur City" },
      { distance: 1386, elevation: 216, label: "New Delhi" }
    ]
  },
  {
    trainNumber: "12004",
    trainName: "Lucknow Swarna Shatabdi",
    type: "Shatabdi",
    origin: { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", lat: 28.6424, lng: 77.2195 },
    destination: { code: "LJN", name: "Lucknow Junction", city: "Lucknow", state: "Uttar Pradesh", lat: 26.8322, lng: 80.9197 },
    days: ["Daily"],
    totalDistance: 511,
    totalDuration: "6h 40m",
    avgSpeed: 77,
    maxSpeed: 130,
    departureTime: "06:10",
    arrivalTime: "12:50",
    stations: [
      { code: "NDLS", name: "New Delhi", platform: "12", distanceKm: 0, scheduledArrival: "Source", scheduledDeparture: "06:10", haltMinutes: 0, lat: 28.6424, lng: 77.2195, elevationM: 216 },
      { code: "GZB", name: "Ghaziabad Junction", platform: "2", distanceKm: 26, scheduledArrival: "06:48", scheduledDeparture: "06:50", haltMinutes: 2, lat: 28.6692, lng: 77.4326, elevationM: 214 },
      { code: "ALJN", name: "Aligarh Junction", platform: "3", distanceKm: 131, scheduledArrival: "07:47", scheduledDeparture: "07:49", haltMinutes: 2, lat: 27.8974, lng: 78.0772, elevationM: 186 },
      { code: "TDL", name: "Tundla Junction", platform: "3", distanceKm: 209, scheduledArrival: "08:45", scheduledDeparture: "08:47", haltMinutes: 2, lat: 27.2456, lng: 78.4321, elevationM: 167 },
      { code: "ETW", name: "Etawah Junction", platform: "3", distanceKm: 301, scheduledArrival: "09:40", scheduledDeparture: "09:42", haltMinutes: 2, lat: 26.7789, lng: 79.0234, elevationM: 145 },
      { code: "CNB", name: "Kanpur Central", platform: "5", distanceKm: 440, scheduledArrival: "11:20", scheduledDeparture: "11:25", haltMinutes: 5, lat: 26.4547, lng: 80.3507, elevationM: 126 },
      { code: "LJN", name: "Lucknow Junction", platform: "6", distanceKm: 511, scheduledArrival: "12:50", scheduledDeparture: "Destination", haltMinutes: 0, lat: 26.8322, lng: 80.9197, elevationM: 123 }
    ],
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2195, 28.6424],
          [77.4326, 28.6692], // Ghaziabad
          [78.0772, 27.8974], // Aligarh
          [78.4321, 27.2456], // Tundla
          [79.0234, 26.7789], // Etawah
          [80.3507, 26.4547], // Kanpur
          [80.5912, 26.6541], // Unnao
          [80.9197, 26.8322]  // Lucknow Junction
        ]
      }
    },
    pois: [
      { id: "poi-301", name: "Hindon River Crossing", category: "River", description: "Tributary of Yamuna winding past the National Capital Region.", lat: 28.6624, lng: 77.4121 },
      { id: "poi-302", name: "Sai River Viaduct", category: "Scenic", description: "Meandering tributary through the central Awadh plain.", lat: 26.5412, lng: 80.5123 },
      { id: "poi-303", name: "Gomti River Basin", category: "Heritage River", description: "The historic lifeline of the City of Nawabs.", lat: 26.8412, lng: 80.9412 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 216, label: "New Delhi" },
      { distance: 131, elevation: 186, label: "Aligarh" },
      { distance: 209, elevation: 167, label: "Tundla" },
      { distance: 301, elevation: 145, label: "Etawah" },
      { distance: 440, elevation: 126, label: "Kanpur" },
      { distance: 511, elevation: 123, label: "Lucknow" }
    ]
  },
  {
    trainNumber: "12301",
    trainName: "Howrah Rajdhani Express",
    type: "Rajdhani",
    origin: { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal", lat: 22.5840, lng: 88.3426 },
    destination: { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", lat: 28.6424, lng: 77.2195 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    totalDistance: 1451,
    totalDuration: "17h 05m",
    avgSpeed: 85,
    maxSpeed: 130,
    departureTime: "16:50",
    arrivalTime: "09:55",
    stations: [
      { code: "HWH", name: "Howrah Junction", platform: "9", distanceKm: 0, scheduledArrival: "Source", scheduledDeparture: "16:50", haltMinutes: 0, lat: 22.5840, lng: 88.3426, elevationM: 9 },
      { code: "ASN", name: "Asansol Junction", platform: "4", distanceKm: 200, scheduledArrival: "18:57", scheduledDeparture: "19:00", haltMinutes: 3, lat: 23.6889, lng: 86.9661, elevationM: 126 },
      { code: "DHN", name: "Dhanbad Junction", platform: "3", distanceKm: 259, scheduledArrival: "19:55", scheduledDeparture: "20:00", haltMinutes: 5, lat: 23.7957, lng: 86.4304, elevationM: 227 },
      { code: "GAYA", name: "Gaya Junction", platform: "1", distanceKm: 458, scheduledArrival: "22:19", scheduledDeparture: "22:22", haltMinutes: 3, lat: 24.7955, lng: 85.0002, elevationM: 111 },
      { code: "DDU", name: "Pt Deen Dayal Upadhyaya", platform: "7", distanceKm: 663, scheduledArrival: "00:45", scheduledDeparture: "00:55", haltMinutes: 10, lat: 25.2818, lng: 83.1189, elevationM: 82 },
      { code: "PRYJ", name: "Prayagraj Junction", platform: "1", distanceKm: 816, scheduledArrival: "02:33", scheduledDeparture: "02:35", haltMinutes: 2, lat: 25.4484, lng: 81.8333, elevationM: 98 },
      { code: "CNB", name: "Kanpur Central", platform: "1", distanceKm: 1011, scheduledArrival: "04:40", scheduledDeparture: "04:45", haltMinutes: 5, lat: 26.4547, lng: 80.3507, elevationM: 126 },
      { code: "NDLS", name: "New Delhi", platform: "13", distanceKm: 1451, scheduledArrival: "09:55", scheduledDeparture: "Destination", haltMinutes: 0, lat: 28.6424, lng: 77.2195, elevationM: 216 }
    ],
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [88.3426, 22.5840], // Howrah
          [87.8541, 23.2351], // Barddhaman
          [86.9661, 23.6889], // Asansol
          [86.4304, 23.7957], // Dhanbad
          [85.8912, 24.1235], // Parasnath Hills
          [85.0002, 24.7955], // Gaya
          [84.1892, 24.9541], // Sasaram
          [83.1189, 25.2818], // DDU
          [81.8333, 25.4484], // Prayagraj
          [80.3507, 26.4547], // Kanpur
          [78.4321, 27.2456], // Tundla
          [77.2195, 28.6424]  // New Delhi
        ]
      }
    },
    pois: [
      { id: "poi-401", name: "Damodar River Viaduct", category: "River Crossing", description: "Spanning the historic river of the Chota Nagpur plateau.", lat: 23.6541, lng: 86.9124 },
      { id: "poi-402", name: "Parasnath / Shikharji Hills", category: "Mountain Vista", description: "Highest mountain peak in Jharkhand rising to 1365m above the tracks.", lat: 23.9654, lng: 86.1245 },
      { id: "poi-403", name: "Dehri-on-Sone Nehru Setu", category: "Bridge Wonder", description: "One of the longest railway bridges in Asia (3.065 km) over the Son river.", lat: 24.9124, lng: 84.1892 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 9, label: "Howrah" },
      { distance: 200, elevation: 126, label: "Asansol" },
      { distance: 259, elevation: 227, label: "Dhanbad" },
      { distance: 340, elevation: 310, label: "Parasnath Foothills" },
      { distance: 458, elevation: 111, label: "Gaya" },
      { distance: 663, elevation: 82, label: "DDU Junction" },
      { distance: 816, elevation: 98, label: "Prayagraj" },
      { distance: 1011, elevation: 126, label: "Kanpur" },
      { distance: 1451, elevation: 216, label: "New Delhi" }
    ]
  },
  {
    trainNumber: "20901",
    trainName: "Vande Bharat Express",
    type: "Vande Bharat",
    origin: { code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra", lat: 18.9696, lng: 72.8193 },
    destination: { code: "GNC", name: "Gandhinagar Capital", city: "Gandhinagar", state: "Gujarat", lat: 23.2351, lng: 72.6417 },
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    totalDistance: 522,
    totalDuration: "6h 15m",
    avgSpeed: 84,
    maxSpeed: 130,
    departureTime: "06:00",
    arrivalTime: "12:25",
    stations: [
      { code: "MMCT", name: "Mumbai Central", platform: "5", distanceKm: 0, scheduledArrival: "Source", scheduledDeparture: "06:00", haltMinutes: 0, lat: 18.9696, lng: 72.8193, elevationM: 8 },
      { code: "BVI", name: "Borivali", platform: "6", distanceKm: 30, scheduledArrival: "06:23", scheduledDeparture: "06:25", haltMinutes: 2, lat: 19.2288, lng: 72.8575, elevationM: 14 },
      { code: "VAPI", name: "Vapi", platform: "1", distanceKm: 168, scheduledArrival: "07:56", scheduledDeparture: "07:58", haltMinutes: 2, lat: 20.3789, lng: 72.9124, elevationM: 26 },
      { code: "ST", name: "Surat", platform: "1", distanceKm: 263, scheduledArrival: "08:53", scheduledDeparture: "08:58", haltMinutes: 5, lat: 21.2049, lng: 72.8406, elevationM: 18 },
      { code: "BRC", name: "Vadodara Junction", platform: "2", distanceKm: 392, scheduledArrival: "10:13", scheduledDeparture: "10:18", haltMinutes: 5, lat: 22.3107, lng: 73.1812, elevationM: 35 },
      { code: "ADI", name: "Ahmedabad Junction", platform: "1", distanceKm: 491, scheduledArrival: "11:35", scheduledDeparture: "11:40", haltMinutes: 5, lat: 23.0225, lng: 72.5714, elevationM: 53 },
      { code: "GNC", name: "Gandhinagar Capital", platform: "1", distanceKm: 522, scheduledArrival: "12:25", scheduledDeparture: "Destination", haltMinutes: 0, lat: 23.2351, lng: 72.6417, elevationM: 78 }
    ],
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [72.8193, 18.9696],
          [72.8575, 19.2288],
          [72.9124, 20.3789],
          [72.8406, 21.2049],
          [73.0124, 21.7123],
          [73.1812, 22.3107],
          [72.9812, 22.6892],
          [72.5714, 23.0225],
          [72.6417, 23.2351]
        ]
      }
    },
    pois: [
      { id: "poi-501", name: "Daman Ganga River Bridge", category: "Bridge", description: "Coastal river bridge connecting Maharashtra and South Gujarat.", lat: 20.3812, lng: 72.9214 },
      { id: "poi-502", name: "Sabarmati Riverfront Vista", category: "Waterfront", description: "Ahmedabad's landmark urban waterfront development.", lat: 23.0312, lng: 72.5812 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 8, label: "Mumbai Central" },
      { distance: 168, elevation: 26, label: "Vapi" },
      { distance: 263, elevation: 18, label: "Surat" },
      { distance: 392, elevation: 35, label: "Vadodara" },
      { distance: 491, elevation: 53, label: "Ahmedabad" },
      { distance: 522, elevation: 78, label: "Gandhinagar" }
    ]
  },
  {
    trainNumber: "12626",
    trainName: "Kerala Express",
    type: "Superfast",
    origin: { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi", lat: 28.6424, lng: 77.2195 },
    destination: { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala", lat: 8.4875, lng: 76.9525 },
    days: ["Daily"],
    totalDistance: 3031,
    totalDuration: "47h 55m",
    avgSpeed: 64,
    maxSpeed: 110,
    departureTime: "20:10",
    arrivalTime: "20:05",
    stations: [
      { code: "NDLS", name: "New Delhi", platform: "3", distanceKm: 0, scheduledArrival: "Source", scheduledDeparture: "20:10", haltMinutes: 0, lat: 28.6424, lng: 77.2195, elevationM: 216 },
      { code: "AGC", name: "Agra Cantt", platform: "1", distanceKm: 195, scheduledArrival: "22:20", scheduledDeparture: "22:25", haltMinutes: 5, lat: 27.1593, lng: 78.0069, elevationM: 169 },
      { code: "GWL", name: "Gwalior Junction", platform: "1", distanceKm: 313, scheduledArrival: "23:56", scheduledDeparture: "23:58", haltMinutes: 2, lat: 26.2183, lng: 78.1828, elevationM: 212 },
      { code: "VGLJ", name: "VGL Jhansi Junction", platform: "2", distanceKm: 410, scheduledArrival: "01:30", scheduledDeparture: "01:38", haltMinutes: 8, lat: 25.4484, lng: 78.5685, elevationM: 258 },
      { code: "BPL", name: "Bhopal Junction", platform: "1", distanceKm: 702, scheduledArrival: "05:20", scheduledDeparture: "05:25", haltMinutes: 5, lat: 23.2687, lng: 77.4126, elevationM: 505 },
      { code: "NGP", name: "Nagpur Junction", platform: "2", distanceKm: 1092, scheduledArrival: "11:45", scheduledDeparture: "11:50", haltMinutes: 5, lat: 21.1524, lng: 79.0882, elevationM: 312 },
      { code: "BZA", name: "Vijayawada Junction", platform: "6", distanceKm: 1756, scheduledArrival: "21:40", scheduledDeparture: "21:50", haltMinutes: 10, lat: 16.5173, lng: 80.6200, elevationM: 19 },
      { code: "TVC", name: "Thiruvananthapuram", platform: "1", distanceKm: 3031, scheduledArrival: "20:05", scheduledDeparture: "Destination", haltMinutes: 0, lat: 8.4875, lng: 76.9525, elevationM: 10 }
    ],
    routeGeoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2195, 28.6424],
          [78.0069, 27.1593],
          [78.1828, 26.2183],
          [78.5685, 25.4484],
          [77.4126, 23.2687],
          [79.0882, 21.1524],
          [80.6200, 16.5173],
          [76.9525, 8.4875]
        ]
      }
    },
    pois: [
      { id: "poi-601", name: "Taj Mahal Vista & Yamuna", category: "Monuments", description: "Historic Agra corridor with vistas of the Mughal citadel.", lat: 27.1751, lng: 78.0421 },
      { id: "poi-602", name: "Bhimbetka Rocks Vicinity", category: "UNESCO Heritage", description: "Prehistoric rock shelters on the southern edge of central Vindhyan hills.", lat: 22.9372, lng: 77.6124 }
    ],
    elevationProfile: [
      { distance: 0, elevation: 216, label: "New Delhi" },
      { distance: 195, elevation: 169, label: "Agra" },
      { distance: 410, elevation: 258, label: "Jhansi" },
      { distance: 702, elevation: 505, label: "Bhopal (Malwa Peak)" },
      { distance: 1092, elevation: 312, label: "Nagpur" },
      { distance: 1756, elevation: 19, label: "Vijayawada" },
      { distance: 3031, elevation: 10, label: "Thiruvananthapuram" }
    ]
  }
];
