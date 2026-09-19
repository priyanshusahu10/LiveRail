import React, { useState, useEffect } from 'react';
import { X, Calendar, Armchair, ChevronRight, CheckCircle2, AlertCircle, Clock, ArrowRight, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { getSeatAvailabilityApi } from '../../services/api';

const QUOTAS = [
  { code: 'GN', name: 'General' },
  { code: 'TQ', name: 'Tatkal' },
  { code: 'LD', name: 'Ladies' },
  { code: 'SS', name: 'Senior Citizen' }
];

export default function SeatAvailabilityModal({ isOpen, onClose, trainNumber, trainName, origin, destination, stations = [] }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const [fromStation, setFromStation] = useState(origin?.code || 'NDLS');
  const [toStation, setToStation] = useState(destination?.code || 'BSB');
  const [selectedClass, setSelectedClass] = useState('CC');
  const [selectedQuota, setSelectedQuota] = useState('GN');

  // Format date helper: "Wed, 16 Sep"
  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (_) {
      return dateStr;
    }
  };

  const fetchAvailability = async (cls = selectedClass, qta = selectedQuota, frm = fromStation, to = toStation) => {
    if (!trainNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSeatAvailabilityApi(trainNumber, {
        from: frm,
        to: to,
        classCode: cls,
        quota: qta
      });
      setData(res);
      if (res.classCode && res.classCode !== selectedClass) {
        setSelectedClass(res.classCode);
      }
    } catch (err) {
      console.error('Failed to load seat availability:', err);
      setError('Could not retrieve seat availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && trainNumber) {
      const defaultCls = (trainName || '').toLowerCase().includes('vande') ? 'CC' : '3A';
      setSelectedClass(defaultCls);
      setFromStation(origin?.code || 'NDLS');
      setToStation(destination?.code || 'BSB');
      fetchAvailability(defaultCls, selectedQuota, origin?.code || 'NDLS', destination?.code || 'BSB');
    }
  }, [isOpen, trainNumber]);

  if (!isOpen) return null;

  const supportedClasses = data?.supportedClasses || ['CC', 'EC', '3A', '2A', '1A', 'SL'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-neutral-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-slate-800 flex items-center justify-between bg-neutral-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
                  {trainNumber}
                </span>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  {trainName || 'Live Seat Availability'}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
                Real-time Indian Railways seat matrix & confirmation predictions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">

          {/* Controls: Class Selector & Quota */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-slate-500">
                Select Travel Class
              </span>
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-slate-400">
                <span>Quota:</span>
                <select
                  value={selectedQuota}
                  onChange={(e) => {
                    setSelectedQuota(e.target.value);
                    fetchAvailability(selectedClass, e.target.value);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 text-xs font-semibold text-neutral-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {QUOTAS.map(q => (
                    <option key={q.code} value={q.code}>{q.name} ({q.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {supportedClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    fetchAvailability(cls, selectedQuota);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedClass === cls
                      ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-300'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Fare & Telemetry Summary Card */}
          {data && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/60 text-xs">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-slate-300 font-medium">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Source: <strong>{data.dataSource}</strong></span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estimated Fare</span>
                <span className="text-base font-extrabold font-mono text-cyan-700 dark:text-cyan-300">
                  ₹{data.estimatedFare}
                </span>
              </div>
            </div>
          )}

          {/* Calendar Availability Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>Upcoming Departure Availability</span>
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                Class: {selectedClass} • Quota: {selectedQuota}
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-7 h-7 text-cyan-600 dark:text-cyan-400 animate-spin" />
                <span className="text-xs text-neutral-500 font-medium">Checking live seat availability with IRCTC PRS...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {data?.calendar?.map((item) => {
                  const isAvail = item.isAvailable;
                  const isRAC = item.statusCode === 'RAC' || (item.status || '').includes('RAC');

                  return (
                    <div
                      key={item.date}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                        isAvail
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/80 hover:border-emerald-400'
                          : isRAC
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/80 hover:border-amber-400'
                          : 'bg-neutral-50/70 dark:bg-slate-800/40 border-neutral-200 dark:border-slate-800 hover:border-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <span>{formatDateLabel(item.date)}</span>
                        </div>

                        {/* Status Chip */}
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`font-mono text-xs font-black px-2 py-0.5 rounded-md ${
                            isAvail
                              ? 'bg-emerald-500 text-white'
                              : isRAC
                              ? 'bg-amber-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Confirmation Chance & Action */}
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">
                          Confirmation
                        </div>
                        <span className={`text-xs font-bold ${
                          item.confirmationChance?.color === 'emerald'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.confirmationChance?.color === 'cyan'
                            ? 'text-cyan-600 dark:text-cyan-400'
                            : item.confirmationChance?.color === 'amber'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {item.confirmationChance?.percentage}% {item.confirmationChance?.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer with IRCTC Direct Link */}
        <div className="p-4 border-t border-neutral-100 dark:border-slate-800 bg-neutral-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-500 dark:text-slate-400 hidden sm:block">
            Confirmed seats update dynamically via IRCTC PRS.
          </div>

          <a
            href={`https://www.irctc.co.in/nget/train-search`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all ml-auto"
          >
            <span>Book on Official IRCTC</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
}
