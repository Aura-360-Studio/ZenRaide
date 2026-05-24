import { Bike, Fuel, ShieldCheck, ChevronRight, Edit2 } from 'lucide-react';

interface SecondaryStatsProps {
  odometer: number;
  fuelLevel: number;        // Percentage 0 to 100
  tankCapacity: number;     // e.g. 10 Litres
  fuelEconomy: number;      // e.g. 45 km/L
  onOdometerClick: () => void;
  onReadinessClick: () => void;
  isChecklistComplete: boolean;
}

export function SecondaryStats({
  odometer,
  fuelLevel,
  tankCapacity,
  fuelEconomy,
  onOdometerClick,
  onReadinessClick,
  isChecklistComplete
}: SecondaryStatsProps) {
  // Format odometer with commas (e.g. 12,458)
  const formattedOdo = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(odometer);

  // Dynamic Fuel Math Logic
  const fuelPercentage = Math.min(Math.max(fuelLevel, 0), 100);
  const currentFuelLitres = (fuelPercentage / 100) * tankCapacity;
  const rangeKm = currentFuelLitres * fuelEconomy;
  const activeSegments = Math.round((fuelPercentage / 100) * 4);

  const getFuelColorClass = () => {
    if (fuelPercentage <= 20) return 'active-danger';
    if (fuelPercentage <= 40) return 'active-warn';
    return 'active-eco';
  };

  return (
    <div className="secondary-stats-panel">
      
      {/* Segmented Fuel Gauge & Estimated Driving Range - Full Width in Landscape */}
      <div className="zen-card fuel-analytics-card">
        <div className="card-title">
          <Fuel size={14} className={fuelPercentage <= 20 ? 'speed-danger' : 'speed-eco'} />
          <span>Fuel Analytics</span>
        </div>
        
        {/* Custom Segmented horizontal layout */}
        <div className="fuel-level-bars">
          {[1, 2, 3, 4].map(seg => {
            const isActive = seg <= activeSegments;
            return (
              <div
                key={seg}
                className={`fuel-bar ${isActive ? getFuelColorClass() : ''}`}
              />
            );
          })}
        </div>

        {/* Dynamic driving range computed math displays */}
        <div className="range-display-row">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Estimated Range</span>
            <span className="range-km-val">{Math.round(rangeKm)} km</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Capacity</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {currentFuelLitres.toFixed(1)}L / {tankCapacity}L
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.02)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
          <span>Avg Efficiency: {fuelEconomy.toFixed(1)} km/L</span>
          <span style={{ fontWeight: '600', color: fuelPercentage <= 20 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {fuelPercentage}% Left
          </span>
        </div>
      </div>

      {/* Clickable Odometer Card (Calibratable Manual Input) - Left Half in Landscape */}
      <div 
        className="zen-card odo-interactive-card" 
        onClick={onOdometerClick}
        title="Click to calibrate Odometer reading manually"
      >
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bike size={14} className="speed-eco" />
            <span>Odometer</span>
          </div>
          <Edit2 size={12} style={{ color: 'var(--text-muted)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="odo-reading">
            {formattedOdo} <span className="odo-unit">km</span>
          </div>
          <Bike size={32} strokeWidth={1} style={{ opacity: 0.1, marginLeft: 'auto' }} className="odo-decor-icon" />
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-4px' }}>
          Tap card to override manually
        </p>
      </div>

      {/* Pre-ride Readiness trigger shortcut - Right Half in Landscape */}
      <button className="safety-readiness-btn" onClick={onReadinessClick}>
        <div className="safety-btn-title">
          <ShieldCheck 
            size={18} 
            className={isChecklistComplete ? 'speed-eco' : ''} 
            style={{ color: isChecklistComplete ? 'var(--accent-green)' : 'var(--text-secondary)' }}
          />
          <span>Readiness</span>
        </div>
        <div className="safety-btn-status">
          {isChecklistComplete ? (
            <span className="speed-eco" style={{ fontSize: '11px', fontWeight: '600' }}>Ready</span>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Check</span>
          )}
          <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>
      </button>

    </div>
  );
}
