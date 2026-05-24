import { Settings, Play, ShieldAlert, Sliders, Compass, Sparkles, Fuel } from 'lucide-react';

interface SettingsPanelProps {
  alertSpeed: number;
  onAlertSpeedChange: (val: number) => void;
  fuelPrice: number;
  onFuelPriceChange: (val: number) => void;
  odometer: number;
  onOdometerChange: (val: number) => void;
  
  // Custom Fuel Range Calibration Parameters
  tankCapacity: number;
  onTankCapacityChange: (val: number) => void;
  fuelEconomy: number;
  onFuelEconomyChange: (val: number) => void;
  currentFuelLitres: number;
  onFuelLitresChange: (val: number) => void;

  // Simulation Controls
  isSimulated: boolean;
  onToggleSimulation: (val: boolean) => void;
  simSpeed: number;
  onSimSpeedChange: (val: number) => void;
  simHeading: string;
  onSimHeadingChange: (val: string) => void;
  onTriggerDecelEvent: () => void;
  onTriggerAccelEvent: () => void;
}

export function SettingsPanel({
  alertSpeed,
  onAlertSpeedChange,
  fuelPrice,
  onFuelPriceChange,
  odometer,
  onOdometerChange,
  
  tankCapacity,
  onTankCapacityChange,
  fuelEconomy,
  onFuelEconomyChange,
  currentFuelLitres,
  onFuelLitresChange,

  isSimulated,
  onToggleSimulation,
  simSpeed,
  onSimSpeedChange,
  simHeading,
  onSimHeadingChange,
  onTriggerDecelEvent,
  onTriggerAccelEvent
}: SettingsPanelProps) {
  const headings = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const fuelPercentage = Math.round((currentFuelLitres / tankCapacity) * 100);

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="panel-title">System Settings & Calibration</span>
        <p className="panel-subtitle">Custom parameters, economic fuel tracking, and hardware mockups.</p>
      </div>

      {/* Speed & Cost Configuration Card */}
      <div className="zen-card">
        <div className="card-title">
          <Settings size={14} className="speed-eco" />
          <span>Rider Metrics Settings</span>
        </div>

        <div className="settings-group">
          {/* Speed limit warning setting */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Alert Speed Limit</span>
              <span className="setting-desc">Triggers haptic vibrations and visual alarms above this speed (km/h)</span>
            </div>
            <input
              type="number"
              className="setting-input"
              value={alertSpeed}
              onChange={e => onAlertSpeedChange(Number(e.target.value))}
              min={20}
              max={150}
            />
          </div>

          {/* Local fuel price setting */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Fuel Cost per Litre</span>
              <span className="setting-desc">Local currency cost used to calculate fuel savings aggregates</span>
            </div>
            <input
              type="number"
              className="setting-input"
              value={fuelPrice}
              onChange={e => onFuelPriceChange(Number(e.target.value))}
              step={0.1}
              min={1}
            />
          </div>

          {/* Odometer manual input */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Calibrate Odometer</span>
              <span className="setting-desc">Manually adjust accumulated lifetime mileage reading (km)</span>
            </div>
            <input
              type="number"
              className="setting-input"
              value={Math.round(odometer)}
              onChange={e => onOdometerChange(Number(e.target.value))}
              min={0}
            />
          </div>

          {/* Tank Capacity input */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Fuel Tank Capacity</span>
              <span className="setting-desc">Total fuel capacity limit of your motorcycle tank (Litres)</span>
            </div>
            <input
              type="number"
              className="setting-input"
              value={tankCapacity}
              onChange={e => onTankCapacityChange(Number(e.target.value))}
              min={1}
              max={100}
            />
          </div>

          {/* Fuel Economy (Mileage) input */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Fuel Economy (Mileage)</span>
              <span className="setting-desc">Average driving mileage rating of your motorcycle (km per Litre)</span>
            </div>
            <input
              type="number"
              className="setting-input"
              value={fuelEconomy}
              onChange={e => onFuelEconomyChange(Number(e.target.value))}
              min={5}
              max={120}
            />
          </div>
        </div>
      </div>

      {/* Relocated Tactile Petrol Calibration Panel (From main dashboard) */}
      <div className="zen-card">
        <div className="card-title" style={{ color: 'var(--accent-blue)' }}>
          <Fuel size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Petrol & Tank Calibration</span>
        </div>
        
        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Embarking on a ride or fueling up? Calibrate your tank level manually. ZenRide uses these coordinates to calculate your real-time ranges and eco savings.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
            <span>Petrol Level inside Tank:</span>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
              {currentFuelLitres.toFixed(1)} Litres ({fuelPercentage}%)
            </span>
          </div>
          
          {/* Slider */}
          <input
            type="range"
            min="0"
            max={tankCapacity}
            step="0.1"
            value={currentFuelLitres}
            onChange={e => onFuelLitresChange(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-blue)',
              height: '6px',
              borderRadius: '3px',
              background: 'var(--bg-main)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          
          {/* Quick Simulated Add buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '4px' }}>
            <button
              className="sim-btn"
              onClick={() => onFuelLitresChange(Math.min(currentFuelLitres + 2, tankCapacity))}
            >
              +2 Litres (Fuel Up)
            </button>
            <button
              className="sim-btn"
              onClick={() => onFuelLitresChange(Math.min(currentFuelLitres + 5, tankCapacity))}
            >
              +5 Litres (Full Tank)
            </button>
          </div>
        </div>
      </div>

      {/* Local Simulation Mode Controller */}
      <div className="zen-card simulation-panel-card">
        <div className="card-title" style={{ color: 'var(--accent-blue)' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Dashboard Simulation Panel</span>
        </div>
        
        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          No GPS? No problem. Enable simulation mode to slide speedometer dials, select headings, and mock acceleration bursts or sudden stops directly in your browser.
        </p>

        <div className="settings-group" style={{ marginTop: '8px' }}>
          <div className="setting-row" style={{ borderBottom: 'none', padding: '4px 0' }}>
            <div className="setting-info">
              <span className="setting-label" style={{ color: isSimulated ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                {isSimulated ? 'Simulation Mode ACTIVE' : 'Enable Mock Simulation'}
              </span>
              <span className="setting-desc">Inject simulated telemetry instead of live device Geolocation</span>
            </div>
            <label className="rec-switch">
              <input
                type="checkbox"
                checked={isSimulated}
                onChange={e => onToggleSimulation(e.target.checked)}
              />
              <span className="rec-slider" style={{ borderColor: isSimulated ? 'var(--accent-blue)' : 'var(--border-color)' }} />
            </label>
          </div>

          {isSimulated && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px', borderTop: '1px solid rgba(168, 199, 250, 0.15)', paddingTop: '14px' }}>
              
              {/* Dynamic Speed Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sliders size={12} />
                    <span>Mock Speed</span>
                  </span>
                  <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-display)' }}>{simSpeed} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="160"
                  value={simSpeed}
                  onChange={e => onSimSpeedChange(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-blue)',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--bg-card-hover)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* Compass Direction Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Compass size={12} />
                  <span>Mock Heading</span>
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {headings.map(h => (
                    <button
                      key={h}
                      className={`gear-btn ${simHeading === h ? 'active' : ''}`}
                      onClick={() => onSimHeadingChange(h)}
                      style={{
                        flex: 1,
                        minWidth: '38px',
                        background: simHeading === h ? 'var(--accent-blue)' : '',
                        borderColor: simHeading === h ? 'var(--accent-blue)' : ''
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acceleration/Stop Decel Events Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={12} />
                  <span>Trigger Alert Events</span>
                </span>
                <div className="sim-controls-grid">
                  <button className="sim-btn" onClick={onTriggerAccelEvent}>
                    <Play size={12} />
                    Accel Spike
                  </button>
                  <button className="sim-btn" onClick={onTriggerDecelEvent} style={{ color: 'var(--accent-red)' }}>
                    🛑 Sudden Stop
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
