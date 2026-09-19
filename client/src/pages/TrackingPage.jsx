import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLiveTrackingApi, getTrainRouteApi, getTrainAnalyticsApi } from '../services/api';
import LiveStatusHeader from '../components/train/LiveStatusHeader';
import TrainMap from '../components/map/TrainMap';
import JourneyProgressBar from '../components/train/JourneyProgressBar';
import StationTimeline from '../components/train/StationTimeline';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import TravelCompanion from '../components/companion/TravelCompanion';
import ShareModal from '../components/share/ShareModal';
import SeatAvailabilityModal from '../components/seat/SeatAvailabilityModal';
import PnrStatusModal from '../components/pnr/PnrStatusModal';
import { Loader2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export default function TrackingPage() {
  const { trainNumber } = useParams();
  const navigate = useNavigate();

  const [liveData, setLiveData] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSeatsOpen, setIsSeatsOpen] = useState(false);
  const [isPnrOpen, setIsPnrOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'map', 'timeline', 'analytics', 'companion'

  const refreshIntervalRef = useRef(null);

  // Fetch initial train telemetry
  const fetchTelemetry = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [liveResult, routeResult, analResult] = await Promise.allSettled([
        getLiveTrackingApi(trainNumber),
        getTrainRouteApi(trainNumber),
        getTrainAnalyticsApi(trainNumber)
      ]);
      if (liveResult.status === 'fulfilled') setLiveData(liveResult.value);
      else if (!liveData) throw new Error(liveResult.reason?.message || 'Live tracking unavailable');
      if (routeResult.status === 'fulfilled') setRouteData(routeResult.value);
      if (analResult.status === 'fulfilled') setAnalytics(analResult.value);
      setError(null);
    } catch (err) {
      console.error('Failed to load tracking data:', err);
      if (!liveData) {
        setError(`Train ${trainNumber} not found or live tracking is unavailable.`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTelemetry();

    // Auto-refresh interval (every 30 seconds as specified in PRD Section 3.2)
    refreshIntervalRef.current = setInterval(() => {
      fetchTelemetry(false);
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [trainNumber]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-neutral-800 dark:text-white">Connecting to IRCTC Live Telemetry...</p>
          <p className="text-xs text-neutral-400 font-mono">Querying train #{trainNumber} GPS coordinates</p>
        </div>
      </div>
    );
  }

  if (error || !liveData) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Train Not Found</h3>
        <p className="text-xs text-neutral-500">{error || 'Unable to retrieve train status.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-neutral-900 dark:bg-cyan-600 text-white rounded-xl text-xs font-semibold shadow"
        >
          Return to Search
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-slate-950 transition-colors pb-16">
      
      {/* Top Bar with Back button & Quick Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        {/* Mobile Navigation Tabs */}
        <div className="flex sm:hidden items-center gap-1 p-1 bg-neutral-200 dark:bg-slate-800 rounded-xl text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-white shadow' : 'text-neutral-600 dark:text-slate-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'map' ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-white shadow' : 'text-neutral-600 dark:text-slate-400'}`}
          >
            Map
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === 'timeline' ? 'bg-white dark:bg-slate-900 text-neutral-900 dark:text-white shadow' : 'text-neutral-600 dark:text-slate-400'}`}
          >
            Timeline
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        
        {/* Live Train Status Header */}
        <LiveStatusHeader
          liveData={liveData}
          onRefresh={() => fetchTelemetry(true)}
          isRefreshing={refreshing}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenSeats={() => setIsSeatsOpen(true)}
          onOpenPnr={() => setIsPnrOpen(true)}
        />

        {/* Journey Progress Bar */}
        <JourneyProgressBar liveData={liveData} />

        {/* Desktop Split Layout: 60% Map & Companion / 40% Live Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Interactive Map & Travel Companion */}
          <div className={`lg:col-span-7 space-y-5 ${activeTab === 'timeline' ? 'hidden sm:block' : ''}`}>
            
            {/* Interactive Map */}
            <div className="h-[420px] sm:h-[520px] w-full">
              <TrainMap
                liveData={liveData}
                trainRoute={routeData}
              />
            </div>

            {/* Travel Companion: Weather & POIs */}
            <div className={activeTab === 'map' ? 'hidden sm:block' : ''}>
              <TravelCompanion liveData={liveData} />
            </div>

          </div>

          {/* Right Column: Station Schedule & Journey Analytics */}
          <div className={`lg:col-span-5 space-y-5 ${activeTab === 'map' ? 'hidden sm:block' : ''}`}>
            
            {/* Station Timeline */}
            <StationTimeline
              stations={liveData.stations}
              currentDistance={liveData.distanceCovered}
            />

            {/* Journey Analytics & Elevation Profile */}
            <AnalyticsDashboard
              analytics={analytics}
              liveData={liveData}
            />

          </div>

        </div>

      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trainNumber={liveData.trainNumber}
        trainName={liveData.trainName}
        liveData={liveData}
      />

      {/* Seat Availability Modal */}
      <SeatAvailabilityModal
        isOpen={isSeatsOpen}
        onClose={() => setIsSeatsOpen(false)}
        trainNumber={liveData.trainNumber}
        trainName={liveData.trainName}
        origin={liveData.origin}
        destination={liveData.destination}
        stations={liveData.stations}
      />

      {/* PNR Status Modal */}
      <PnrStatusModal
        isOpen={isPnrOpen}
        onClose={() => setIsPnrOpen(false)}
      />

    </div>
  );
}
