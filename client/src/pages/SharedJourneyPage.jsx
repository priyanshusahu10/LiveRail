import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedJourneyApi } from '../services/api';
import TrainMap from '../components/map/TrainMap';
import JourneyProgressBar from '../components/train/JourneyProgressBar';
import { Train, Clock, MapPin, Gauge, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SharedJourneyPage() {
  const { token } = useParams();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadShare() {
      try {
        const data = await getSharedJourneyApi(token);
        setShareData(data);
      } catch (err) {
        setError('This shared tracking link has expired or is invalid.');
      } finally {
        setLoading(false);
      }
    }
    loadShare();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-3 bg-neutral-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        <p className="text-sm font-semibold text-neutral-600 dark:text-slate-300">Loading shared train journey...</p>
      </div>
    );
  }

  if (error || !shareData?.liveData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-slate-950">
        <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Shared Link Expired</h2>
          <p className="text-xs text-neutral-500">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-xs font-semibold rounded-xl"
          >
            <span>Track another train on LiveRail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const { liveData } = shareData;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-950 text-neutral-900 dark:text-white pb-16">
      
      {/* Top Banner */}
      <div className="bg-cyan-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-sm">
        <ShieldCheck className="w-4 h-4" />
        <span>You are viewing a shared live train tracking session (Link Code: <strong className="font-mono">{token}</strong>)</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        
        {/* Simple Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  {liveData.trainNumber}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {liveData.trainName}
                </h1>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {liveData.origin.name} → {liveData.destination.name} ({liveData.totalDistance} km)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                liveData.delayMinutes > 0
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
              }`}>
                {liveData.delayStatus}
              </span>
              <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-slate-800 text-xs font-mono font-bold">
                {liveData.currentLocation.speedKmh} km/h
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between text-xs text-neutral-500">
            <span>Next stop: <strong className="text-neutral-800 dark:text-slate-200">{liveData.nextStation.name}</strong></span>
            <span>ETA: <strong className="text-cyan-600 font-mono">{liveData.nextStation.eta}</strong> ({liveData.nextStation.etaMinutes}m away)</span>
          </div>
        </div>

        {/* Journey Progress */}
        <JourneyProgressBar liveData={liveData} />

        {/* Live Interactive Map */}
        <div className="h-[460px] w-full">
          <TrainMap liveData={liveData} />
        </div>

        {/* Clean Footer Link */}
        <div className="text-center pt-4">
          <Link
            to={`/track/${liveData.trainNumber}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            <span>Open full journey analytics, elevation & weather</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}
