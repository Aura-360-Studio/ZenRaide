// TripSummary Component
import { Route, Clock, Gauge, TrendingUp } from 'lucide-react';

interface TripSummaryProps {
  distance: number;      // km
  duration: number;      // ms
  avgSpeed: number;      // km/h
  maxSpeed: number;      // km/h
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (val: number) => String(val).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function TripSummary({ distance, duration, avgSpeed, maxSpeed }: TripSummaryProps) {
  return (
    <div className="zen-card">
      <div className="card-title">
        <Route size={14} className="speed-eco" />
        <span>Trip Summary</span>
      </div>

      <div className="summary-grid">
        {/* Distance Card */}
        <div className="metric-box">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(57, 255, 20, 0.08)' }}>
            <Route size={18} strokeWidth={2.5} className="speed-eco" />
          </div>
          <div className="metric-details">
            <span className="metric-value">{distance.toFixed(2)} <span className="odo-unit">km</span></span>
            <span className="metric-label">Distance</span>
          </div>
        </div>

        {/* Duration Card */}
        <div className="metric-box">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(251, 191, 36, 0.08)' }}>
            <Clock size={18} strokeWidth={2.5} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{formatDuration(duration)}</span>
            <span className="metric-label">Duration</span>
          </div>
        </div>

        {/* Average Speed Card */}
        <div className="metric-box">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.08)' }}>
            <Gauge size={18} strokeWidth={2.5} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{avgSpeed.toFixed(1)} <span className="odo-unit">km/h</span></span>
            <span className="metric-label">Avg Speed</span>
          </div>
        </div>

        {/* Top Speed Card */}
        <div className="metric-box">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
            <TrendingUp size={18} strokeWidth={2.5} style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{maxSpeed.toFixed(1)} <span className="odo-unit">km/h</span></span>
            <span className="metric-label">Top Speed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
