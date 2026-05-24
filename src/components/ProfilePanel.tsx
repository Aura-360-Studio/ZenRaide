// ProfilePanel Component – Rider statistics and recent rides
import React from 'react';
import { Star } from 'lucide-react';

interface ProfilePanelProps {
  rides: any[]; // Ride[] from db
  odometer: number;
  currencySymbol: string;
}

export function ProfilePanel({ rides, odometer, currencySymbol }: ProfilePanelProps) {
  const recentRides = rides.slice(-3).reverse();
  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="panel-title">Rider Profile</span>
        <p className="panel-subtitle">Your riding achievements and stats.</p>
      </div>

      <div className="zen-card" style={{ padding: '12px', gap: '8px' }}>
        <div className="card-title">
          <Star size={14} style={{ color: 'var(--accent-yellow)' }} />
          <span>Odometer</span>
        </div>
        <div className="card-value" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {odometer.toFixed(1)} km
        </div>
      </div>

      <div className="zen-card" style={{ padding: '12px', gap: '8px' }}>
        <div className="card-title">
          <Star size={14} style={{ color: 'var(--accent-green)' }} />
          <span>Recent Rides</span>
        </div>
        {recentRides.map((ride, idx) => (
          <div key={ride.id ?? idx} className="ride-summary" style={{ marginTop: idx ? '8px' : 0 }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {new Date(ride.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {ride.distance.toFixed(2)} km • {Math.round(ride.duration / 60000)} min
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
              Saved {ride.fuelSaved.toFixed(2)} L ({currencySymbol}{ride.costSaved.toFixed(0)})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
