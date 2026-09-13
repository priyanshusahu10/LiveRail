import React, { useState } from 'react';
import { Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Compass, Waypoints } from 'lucide-react';

export default function StationTimeline({ stations = [], currentDistance = 0, onSelectStation }) {
  const [expandedStation, setExpandedStation] = useState(null);
  const [openSubSections, setOpenSubSections] = useState({});
  const [expandAllSubStations, setExpandAllSubStations] = useState(false);

  if (!stations || stations.length === 0) return null;

  // Calculate total intermediate sub-stations across all halts
  const totalSubStations = stations.reduce((acc, s) => acc + (s.subStations?.length || 0), 0);
  const totalPassedSubStations = stations.reduce(
    (acc, s) => acc + (s.subStations?.filter(sub => sub.status === 'departed')?.length || 0),
    0
  );

  const toggleSubSection = (code) => {
    setOpenSubSections(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const toggleAllSubStations = () => {
    const nextState = !expandAllSubStations;
    setExpandAllSubStations(nextState);
    const newOpen = {};
    stations.forEach(st => {
      if (st.subStations && st.subStations.length > 0) {
        newOpen[st.code] = nextState;
      }
    });
    setOpenSubSections(newOpen);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-neutral-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header bar with total halts and sub-stations toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Station Schedule & Timeline</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">
            {stations.length} Scheduled Commercial Halts • {totalSubStations} Intermediate Sub-stations
          </p>
        </div>

        {totalSubStations > 0 && (
          <button
            type="button"
            onClick={toggleAllSubStations}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-neutral-700 dark:text-slate-300 border border-neutral-200 dark:border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Waypoints className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>
              {expandAllSubStations ? 'Hide All Sub-stations' : `Show All ${totalSubStations} Sub-stations`}
            </span>
          </button>
        )}
      </div>

      {/* Vertical Station Timeline */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200 dark:before:bg-slate-800">
        {stations.map((st, idx) => {
          const isPassed = st.status === 'departed';
          const isCurrent = st.status === 'current';
          const isExpanded = expandedStation === st.code;

          const hasSubStations = st.subStations && st.subStations.length > 0;
          const isSubSectionOpen = expandAllSubStations || Boolean(openSubSections[st.code]);
          const passedSubsInHalt = (st.subStations || []).filter(s => s.status === 'departed').length;

          return (
            <React.Fragment key={st.code}>
              {/* Intermediate Sub-Stations Between Previous Halt and this Halt */}
              {hasSubStations && (
                <div className="relative my-3 -ml-1">
                  {/* Connective banner with toggle */}
                  <div
                    onClick={() => toggleSubSection(st.code)}
                    className="cursor-pointer flex items-center justify-between p-2.5 rounded-xl bg-neutral-50/90 dark:bg-slate-800/60 hover:bg-neutral-100 dark:hover:bg-slate-800 border border-neutral-200/80 dark:border-slate-800 text-xs text-neutral-700 dark:text-slate-300 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-mono text-[10px] font-bold">
                        {st.subStations.length}
                      </div>
                      <span className="font-semibold text-neutral-800 dark:text-slate-200">
                        Intermediate Sub-stations
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        ({passedSubsInHalt} of {st.subStations.length} passed)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold text-[11px] group-hover:underline">
                      <span>{isSubSectionOpen ? 'Hide' : 'View'}</span>
                      {isSubSectionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Expanded Sub-Stations List */}
                  {isSubSectionOpen && (
                    <div className="mt-2.5 ml-3 pl-3.5 border-l-2 border-dashed border-cyan-400/50 dark:border-cyan-600/50 space-y-1.5 py-1">
                      {st.subStations.map((sub, sIdx) => {
                        const isSubPassed = sub.status === 'departed';
                        const isSubCurrent = sub.status === 'current';

                        return (
                          <div
                            key={sub.code + '-' + (sub.sequence || sIdx)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStation && onSelectStation(sub);
                            }}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-slate-800 cursor-pointer ${
                              isSubCurrent
                                ? 'bg-cyan-50/90 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-800 font-semibold'
                                : 'bg-white/40 dark:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${
                                isSubCurrent
                                  ? 'bg-cyan-500 ring-4 ring-cyan-400/30 animate-pulse'
                                  : isSubPassed
                                  ? 'bg-emerald-500'
                                  : 'bg-neutral-300 dark:bg-slate-700'
                              }`} />
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400 border border-neutral-200 dark:border-slate-700">
                                {sub.code}
                              </span>
                              <span className="truncate text-neutral-800 dark:text-slate-200">
                                {sub.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-neutral-500 dark:text-slate-400">
                              <span>{sub.distanceKm} km</span>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                isSubCurrent
                                  ? 'bg-cyan-500 text-white'
                                  : isSubPassed
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-neutral-100 dark:bg-slate-800 text-neutral-400'
                              }`}>
                                {isSubCurrent ? 'Passing Now' : isSubPassed ? 'Passed' : 'Upcoming'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Commercial Halt Card */}
              <div
                onClick={() => {
                  setExpandedStation(isExpanded ? null : st.code);
                  onSelectStation && onSelectStation(st);
                }}
                className={`relative group cursor-pointer p-3.5 rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? 'bg-cyan-50/70 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-800 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                    : isPassed
                    ? 'bg-neutral-50/50 dark:bg-slate-800/30 border-neutral-200/80 dark:border-slate-800 hover:border-neutral-300'
                    : 'bg-white dark:bg-slate-900 border-neutral-200 dark:border-slate-800 hover:border-neutral-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Node indicator on vertical line */}
                <div className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-cyan-500 border-white shadow-lg shadow-cyan-500/60 ring-4 ring-cyan-400/20 scale-125'
                    : isPassed
                    ? 'bg-emerald-500 border-white dark:border-slate-900'
                    : 'bg-neutral-200 dark:bg-slate-700 border-white dark:border-slate-900'
                }`}>
                  {isPassed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>

                {/* Station Main Row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 border border-neutral-200 dark:border-slate-700">
                        {st.code}
                      </span>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {st.name}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-500 text-white rounded-full animate-pulse">
                          Current Stop
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-slate-400 mt-1">
                      <span className="font-mono font-medium text-cyan-600 dark:text-cyan-400">
                        PF #{st.platform || '1'}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{st.distanceKm} km from origin</span>
                      {st.haltMinutes > 0 && (
                        <>
                          <span>•</span>
                          <span>{st.haltMinutes}m halt</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Arrival / Departure times & Delay */}
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {st.scheduledArrival !== 'Source' ? st.scheduledArrival : st.scheduledDeparture}
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {st.delayMinutes > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          +{st.delayMinutes}m delay
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          On Time
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs animate-in fade-in">
                    <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase text-neutral-400 block font-medium">Arr / Dep</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-slate-200">
                        {st.scheduledArrival} / {st.scheduledDeparture}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase text-neutral-400 block font-medium">Elevation</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-slate-200">
                        {st.elevationM || '120'} m AMSL
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase text-neutral-400 block font-medium">Halt Time</span>
                      <span className="font-mono font-semibold text-neutral-800 dark:text-slate-200">
                        {st.haltMinutes} minutes
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase text-neutral-400 block font-medium">Status</span>
                      <span className="font-semibold capitalize text-neutral-800 dark:text-slate-200">
                        {st.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
