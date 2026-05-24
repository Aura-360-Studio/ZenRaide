// ProfilePanel Component – Redesigned Rider Settings & App Status Hub
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Edit2, 
  Check, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Activity,
  Sliders,
  Compass,
  Sparkles,
  ShieldAlert,
  Play,
  Fuel
} from 'lucide-react';

interface ProfilePanelProps {
  rides: any[]; // Ride[] from db
  odometer: number;
  currencySymbol: string;
  
  // Settings Parameters (centralized in App.tsx)
  alertSpeed: number;
  onAlertSpeedChange: (val: number) => void;
  fuelPrice: number;
  onFuelPriceChange: (val: number) => void;
  onOdometerChange: (val: number) => void;
  tankCapacity: number;
  onTankCapacityChange: (val: number) => void;
  fuelEconomy: number;
  onFuelEconomyChange: (val: number) => void;
  currentFuelLitres: number;
  onFuelLitresChange: (val: number) => void;
  isSimulated: boolean;
  onToggleSimulation: (val: boolean) => void;
  simSpeed: number;
  onSimSpeedChange: (val: number) => void;
  simHeading: string;
  onSimHeadingChange: (val: string) => void;
  onTriggerDecelEvent: () => void;
  onTriggerAccelEvent: () => void;

  // Navigation tab switcher (to jump back to speedometer / cockpit)
  onNavigateTab: (tab: 'speedometer' | 'insights' | 'readiness' | 'more' | 'settings' | 'profile') => void;

  // Custom Rider Profile details
  riderName: string;
  onRiderNameChange: (val: string) => void;
}

export function ProfilePanel({
  rides,
  odometer,
  currencySymbol,
  
  alertSpeed,
  onAlertSpeedChange,
  fuelPrice,
  onFuelPriceChange,
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
  onTriggerAccelEvent,

  onNavigateTab,

  riderName,
  onRiderNameChange
}: ProfilePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(riderName);
  
  // PWA Install States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Network State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Sync temp name when prop changes
  useEffect(() => {
    setTempName(riderName);
  }, [riderName]);

  // Network Status listeners
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // PWA Install handlers
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      onRiderNameChange(tempName.trim());
    }
    setIsEditingName(false);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert("ZenRide is offline-ready. If you're on iOS, tap Share -> Add to Home Screen to install manually!");
    }
  };

  const handleHardRefresh = async () => {
    if (confirm("Are you sure you want to perform a hard reload? This clears offline SW cache and reloads from the server.")) {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      window.location.reload();
    }
  };

  const totalDistance = rides.reduce((acc, r) => acc + r.distance, 0);
  const headings = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const fuelPercentage = Math.round((currentFuelLitres / tankCapacity) * 100);

  return (
    <div className="panel-container" style={{ gap: '16px', maxHeight: '100%', overflowY: 'auto' }}>
      {/* Circle back button top left to return to speedometer */}
      <button 
        className="profile-back-circle" 
        onClick={() => onNavigateTab('speedometer')}
        title="Return to Speedometer"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Header Profile Area */}
      <div className="profile-hub-header">
        <div className="profile-avatar-circle">
          {getInitials(riderName)}
        </div>

        {isEditingName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
            <input
              type="text"
              className="profile-name-input"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              autoFocus
            />
            <button className="profile-name-edit-btn" onClick={handleSaveName}>
              <Check size={16} style={{ color: 'var(--accent-green)' }} />
            </button>
          </div>
        ) : (
          <div className="profile-name-container">
            <span className="profile-name-text">{riderName}</span>
            <button className="profile-name-edit-btn" onClick={() => setIsEditingName(true)}>
              <Edit2 size={15} />
            </button>
          </div>
        )}

        <span className="profile-badge-status">
          Zen Level: {totalDistance > 100 ? 'Highway Yogi' : totalDistance > 20 ? 'Asphalt Seeker' : 'Dashboard Novice'}
        </span>
      </div>

      {/* SETTINGS SECTION (directly rendered on this page as cards) */}
      <span className="explore-section-title">Settings</span>

      <div className="zen-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="card-title">
          <Settings size={14} className="speed-eco" />
          <span>Rider Metrics & Calibration</span>
        </div>

        <div className="settings-group">
          {/* Speed limit warning setting */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-label">Alert Speed Limit</span>
              <span className="setting-desc">Triggers visual alarms above this speed (km/h)</span>
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
              <span className="setting-desc">Fuel cost ({currencySymbol}) used to compute aggregates</span>
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
              <span className="setting-desc">Adjust accumulated lifetime mileage reading (km)</span>
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
              <span className="setting-desc">Motorcycle fuel capacity limit (Litres)</span>
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
              <span className="setting-desc">Motorcycle mileage average (km per Litre)</span>
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

      {/* Tactile Petrol Calibration Panel */}
      <div className="zen-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="card-title" style={{ color: 'var(--accent-blue)' }}>
          <Fuel size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Petrol & Tank Calibration</span>
        </div>
        
        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Embarking on a ride or fueling up? Calibrate your tank level manually. ZenRide uses these values to calculate ranges.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
            <span>Tank Level:</span>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-display)', fontWeight: '700' }}>
              {currentFuelLitres.toFixed(1)} L ({fuelPercentage}%)
            </span>
          </div>
          
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

      {/* Simulation Controls Panel inside settings */}
      <div className="zen-card">
        <div className="card-title" style={{ color: 'var(--accent-blue)' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-blue)' }} />
          <span>Dashboard Simulation Panel</span>
        </div>

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


      {/* APP STATUS SECTION (Adopted exactly from user screenshot) */}
      <span className="app-status-title">App Status</span>
      
      <div className="app-status-card">
        {/* Row 1: Network State */}
        <div className="status-row">
          <div className="status-left">
            <div 
              className="status-icon-badge" 
              style={{ 
                background: isOnline ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 179, 0, 0.1)', 
                color: isOnline ? '#00E5FF' : '#ffb300' 
              }}
            >
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div className="status-info">
              <span className="status-label">Network State</span>
              <span className="status-desc">
                {isOnline ? 'Online & Syncing' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: App Installation */}
        <div className="status-row">
          <div className="status-left">
            <div className="status-icon-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
              <Smartphone size={20} />
            </div>
            <div className="status-info">
              <span className="status-label">App Installation</span>
              <span className="status-desc">
                {isInstalled ? 'Installed on Device' : 'Running in Browser'}
              </span>
            </div>
          </div>
          {!isInstalled && (
            <button className="status-install-btn" onClick={handleInstallClick}>
              Install App
            </button>
          )}
        </div>

        {/* Row 3: Hard Refresh System */}
        <div className="status-row">
          <div className="status-left">
            <div className="status-icon-badge" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d' }}>
              <Activity size={20} />
            </div>
            <div className="status-info">
              <span className="status-label" style={{ color: '#ff4d4d' }}>Hard Refresh System</span>
              <span className="status-desc accent-red">Clear Cache & Reload</span>
            </div>
          </div>
          <button className="status-reload-btn" onClick={handleHardRefresh}>
            Force Reload
          </button>
        </div>
      </div>

      {/* ABOUT SECTION (Redesigned with custom credited links & styling) */}
      <span className="explore-section-title">About</span>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', paddingBottom: '16px' }}>
        <p className="about-section-desc">
          Zen Ride is an experiment from Aura Labs. To explore more procedural interfaces,{' '}
          <a 
            href="https://labs.aura360studio.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="about-link"
          >
            check our lab.
          </a>
        </p>
        
        <p className="about-powered-by">
          POWERED BY{' '}
          <a 
            href="https://aura360studio.com/showcase" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="about-powered-link"
            style={{ borderBottom: '1px dotted rgba(255,255,255,0.2)' }}
          >
            AURA360STUDIO
          </a>
        </p>
      </div>
    </div>
  );
}
