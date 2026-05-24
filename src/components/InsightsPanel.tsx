// InsightsPanel Component
import { type Ride } from '../db/rideDb';
import { Trash2, Landmark, Flame, Compass, MessageSquare } from 'lucide-react';
import { formatDuration } from './TripSummary';

interface InsightsPanelProps {
  rides: Ride[];
  onDeleteRide: (id: number) => void;
  currencySymbol: string; // e.g. "₹"
}

export function InsightsPanel({ rides, onDeleteRide, currencySymbol }: InsightsPanelProps) {
  // Aggregate stats
  const totalRides = rides.length;
  const totalDistance = rides.reduce((sum, r) => sum + r.distance, 0);
  const totalFuelSaved = rides.reduce((sum, r) => sum + r.fuelSaved, 0);
  const totalCostSaved = rides.reduce((sum, r) => sum + r.costSaved, 0);

  const averageSpeed = totalRides > 0 
    ? rides.reduce((sum, r) => sum + r.avgSpeed, 0) / totalRides 
    : 0;

  // Get most recent ride
  const latestRide = rides.length > 0 ? rides[rides.length - 1] : null;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="panel-title">Rider Intelligence Insights</span>
        <p className="panel-subtitle">Calm metrics. Tracking behavior, fuel savings, and road stories.</p>
      </div>

      {totalRides === 0 ? (
        <div className="zen-card no-logs-view">
          <MessageSquare size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3>No rides recorded yet</h3>
          <p style={{ fontSize: '13px' }}>Start recording your first trip using the toggle switch at the bottom of the Speedometer screen!</p>
        </div>
      ) : (
        <>
          {/* Natural Language Ride Story Card (USP) */}
          {latestRide && (
            <div className="story-summary-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-green)' }}>
                <Compass size={14} className="speed-eco" />
                <span>LATEST RIDE STORY</span>
              </div>
              <div className="story-narrative-text">
                "{latestRide.storySummary}"
              </div>
              <div className="story-highlights">
                <div className="highlight-badge accented">
                  <span>Saved {currencySymbol}{latestRide.costSaved.toFixed(0)}</span>
                </div>
                <div className="highlight-badge">
                  <span>Eco-burn: {latestRide.fuelSaved.toFixed(2)}L saved</span>
                </div>
                <div className="highlight-badge">
                  <span>Max: {latestRide.maxSpeed.toFixed(0)} km/h</span>
                </div>
              </div>
            </div>
          )}

          {/* Aggregate Stats Row */}
          <div className="summary-grid">
            <div className="metric-box">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(57, 255, 20, 0.08)' }}>
                <Flame size={18} className="speed-eco" />
              </div>
              <div className="metric-details">
                <span className="metric-value">{totalFuelSaved.toFixed(2)} <span className="odo-unit">L</span></span>
                <span className="metric-label">Total Fuel Saved</span>
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.08)' }}>
                <Landmark size={18} style={{ color: 'var(--accent-blue)' }} />
              </div>
              <div className="metric-details">
                <span className="metric-value">{currencySymbol}{totalCostSaved.toFixed(0)}</span>
                <span className="metric-label">Money Saved</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div className="history-stat-box" style={{ background: 'var(--bg-card)' }}>
              <div className="history-stat-val">{totalRides}</div>
              <div className="history-stat-lbl">Total Trips</div>
            </div>
            <div className="history-stat-box" style={{ background: 'var(--bg-card)' }}>
              <div className="history-stat-val">{totalDistance.toFixed(1)} km</div>
              <div className="history-stat-lbl">Distance</div>
            </div>
            <div className="history-stat-box" style={{ background: 'var(--bg-card)' }}>
              <div className="history-stat-val">{averageSpeed.toFixed(1)} km/h</div>
              <div className="history-stat-lbl">Avg Pace</div>
            </div>
          </div>

          {/* Ride History Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ride Logs History
            </span>
            <div className="history-logs-list">
              {[...rides].reverse().map(ride => {
                const dateString = new Date(ride.startTime).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={ride.id} className="history-item-card">
                    <div className="history-header">
                      <span className="history-date">{dateString}</span>
                      <button
                        className="history-delete-btn"
                        onClick={() => ride.id !== undefined && onDeleteRide(ride.id)}
                        title="Delete log entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="history-stats-row">
                      <div className="history-stat-box">
                        <div className="history-stat-val">{ride.distance.toFixed(2)} km</div>
                        <div className="history-stat-lbl">Dist</div>
                      </div>
                      <div className="history-stat-box">
                        <div className="history-stat-val">{formatDuration(ride.duration)}</div>
                        <div className="history-stat-lbl">Time</div>
                      </div>
                      <div className="history-stat-box">
                        <div className="history-stat-val">{ride.avgSpeed.toFixed(0)} km/h</div>
                        <div className="history-stat-lbl">Avg</div>
                      </div>
                      <div className="history-stat-box">
                        <div className="history-stat-val" style={{ color: 'var(--accent-green)' }}>
                          {currencySymbol}{ride.costSaved.toFixed(0)}
                        </div>
                        <div className="history-stat-lbl">Saved</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
