import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import HomePage from './pages/HomePage';
import TrackingPage from './pages/TrackingPage';
import SharedJourneyPage from './pages/SharedJourneyPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-slate-950 font-sans">
        <Routes>
          {/* Main App Routes with Global Header */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
              </>
            }
          />
          <Route
            path="/track/:trainNumber"
            element={
              <>
                <Header />
                <TrackingPage />
              </>
            }
          />

          {/* Shared Zero-Login Link */}
          <Route path="/l/:token" element={<SharedJourneyPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
