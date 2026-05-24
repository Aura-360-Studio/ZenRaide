import { useState, useEffect, useRef } from 'react';
import { AppLayout } from './components/AppLayout';
import { Speedometer } from './components/Speedometer';
import { SecondaryStats } from './components/SecondaryStats';
import { ReadinessChecklist, type ChecklistItem } from './components/ReadinessChecklist';
import { InsightsPanel } from './components/InsightsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { MorePanel } from './components/MorePanel';

import { useGeolocation } from './hooks/useGeolocation';
import { useWakeLock } from './hooks/useWakeLock';
import { useVibration } from './hooks/useVibration';

import { db, getSetting, setSetting, deleteRide, initializeDefaultSettings, type Ride } from './db/rideDb';
import { 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
  Gauge, 
  TrendingUp, 
  ShieldCheck, 
  MoreHorizontal,
  User,
  ArrowRight,
  Edit2,
  RotateCw
} from 'lucide-react';
import { formatDuration } from './components/TripSummary';

export default function App() {
  // Navigation & Shell states
  type TabId = 'speedometer' | 'insights' | 'readiness' | 'more' | 'settings' | 'profile';
  const [activeTab, setActiveTab] = useState<TabId>('speedometer');
  const [nightMode, setNightMode] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  // Helper to get current physical device orientation mode
  const getPhysicalOrientation = () => {
    if (typeof window !== 'undefined' && window.screen?.orientation?.type) {
      return window.screen.orientation.type.includes('landscape');
    }
    return typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false;
  };

  // Orientation tracking for split screen cockpit locking with auto-detection & manual toggle overrides
  const [isLandscape, setIsLandscape] = useState(getPhysicalOrientation);
  const lastPhysicalLandscape = useRef(getPhysicalOrientation());

  useEffect(() => {
    const handleOrientation = () => {
      const currentPhysical = getPhysicalOrientation();
      // Only override manually toggled state if physical device orientation actually changes
      if (currentPhysical !== lastPhysicalLandscape.current) {
        lastPhysicalLandscape.current = currentPhysical;
        setIsLandscape(currentPhysical);
      }
    };

    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientation);
    }

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientation);
      }
    };
  }, []);
  
  // Custom quick-edit ODO calibration modal states
  const [showOdoModal, setShowOdoModal] = useState(false);
  const [tempOdoValue, setTempOdoValue] = useState<string>('');

  // App settings parameters
  const [alertSpeed, setAlertSpeed] = useState(80);
  const [fuelPrice, setFuelPrice] = useState(104.5);
  const [storedOdometer, setStoredOdometer] = useState(12458.0);
  const [viewMode, setViewMode] = useState<'analog' | 'digital'>('analog');
  
  // Custom fuel maths variables (Indian average tank calibrations)
  const [tankCapacity, setTankCapacity] = useState(10); // Standard 10 Litres capacity
  const [fuelEconomy, setFuelEconomy] = useState(45);   // Average fuel economy 45 km/L
  const [currentFuelLitres, setCurrentFuelLitres] = useState(7.5); // 7.5L in tank by default (75% full)

  // Simulation mode states
  const [isSimulated, setIsSimulated] = useState(true); // True by default for browser-based testing
  const [simSpeed, setSimSpeed] = useState(0);
  const [simHeading, setSimHeading] = useState('NE');
  const [accelCount, setAccelCount] = useState(0);
  const [stopCount, setStopCount] = useState(0);

  // Active recording states
  const [isRecording, setIsRecording] = useState(false);
  const [tripTimer, setTripTimer] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);

  // Database listings
  const [ridesList, setRidesList] = useState<Ride[]>([]);
  const [readinessItems, setReadinessItems] = useState<ChecklistItem[]>([
    { id: 'helmet', title: 'Helmet Strapped', desc: 'Secure full-face helmet with double-D ring lock.', checked: false },
    { id: 'tires', title: 'Tire Pressure', desc: 'Inspect tires for visual punctures or optimal cold pressure.', checked: false },
    { id: 'brakes', title: 'Brake Lever Play', desc: 'Verify firm front and rear lever feedback.', checked: false },
    { id: 'lights', title: 'Indicators & Headlamp', desc: 'Verify high beam and turn indicators operate.', checked: false },
    { id: 'stand', title: 'Side Stand Retracted', desc: 'Ensure spring-action side stand is fully upright.', checked: false },
  ]);

  // Hook initializations
  const geolocation = useGeolocation(isRecording, isSimulated, simSpeed, simHeading);
  useWakeLock(isRecording || activeTab === 'speedometer');
  const haptics = useVibration();

  // Load configuration and bootstrap DB on mount
  useEffect(() => {
    const bootstrap = async () => {
      await initializeDefaultSettings();
      
      const speed = await getSetting('alertSpeed', 80);
      const price = await getSetting('fuelPrice', 104.5);
      const odo = await getSetting('odometer', 12458.0);
      const capacity = await getSetting('tankCapacity', 10);
      const economy = await getSetting('fuelEconomy', 45);
      const fuelLitres = await getSetting('currentFuelLitres', 7.5);
      const mode = await getSetting('viewMode', 'analog') as 'analog' | 'digital';
      
      setAlertSpeed(speed);
      setFuelPrice(price);
      setStoredOdometer(odo);
      setTankCapacity(capacity);
      setFuelEconomy(economy);
      setCurrentFuelLitres(fuelLitres);
      setViewMode(mode);

      const savedRides = await db.rides.toArray();
      setRidesList(savedRides);
    };
    bootstrap();
  }, []);

  // Update body tag dark/night style overrides
  useEffect(() => {
    if (nightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }
  }, [nightMode]);

  // Timer Tick Interval for elapsed duration logging
  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now() - tripTimer;
      timerIntervalRef.current = setInterval(() => {
        setTripTimer(Date.now() - startTime);
      }, 100);
    } else {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  // Real-time speed warning triggers
  useEffect(() => {
    if (geolocation.speed >= alertSpeed && !isSimulated) {
      haptics.alertOverspeed();
    }
  }, [geolocation.speed, alertSpeed, isSimulated]);

  // Live Fuel Depletion math: decrease current fuel Litres as the odometer increments
  useEffect(() => {
    if (isRecording && geolocation.distance > 0) {
      // Calculate active consumption: Litres consumed = distance / economy
      const fuelConsumed = geolocation.distance / fuelEconomy;
      if (fuelConsumed > 0.005) {
        setCurrentFuelLitres(prev => {
          const next = Math.max(prev - fuelConsumed, 0.2); // Cap minimum at 0.2L
          setSetting('currentFuelLitres', next);
          return next;
        });
      }
    }
  }, [isRecording, geolocation.distance, fuelEconomy]);


  // Handle pre-ride checklist toggles
  const handleToggleReadinessItem = (id: string) => {
    setReadinessItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      );
      return updated;
    });
  };

  const isChecklistComplete = readinessItems.every(i => i.checked);

  // Trigger active simulation alerts
  const handleSimAccelSpike = () => {
    setSimSpeed(95);
    setAccelCount(prev => prev + 1);
    haptics.alertOverspeed();
  };

  const handleSimSuddenStop = () => {
    setSimSpeed(0);
    setStopCount(prev => prev + 1);
    haptics.alertSuddenStop();
  };

  // Fuel manual sliders or clicks calibration updates
  const handleFuelLitresChange = async (litres: number) => {
    const rounded = Math.round(litres * 10) / 10;
    setCurrentFuelLitres(rounded);
    await setSetting('currentFuelLitres', rounded);
  };

  // Start & Stop recording logs
  const handleToggleRecording = async () => {
    haptics.confirmToggle();

    if (!isRecording) {
      setIsRecording(true);
      setTripTimer(0);
      setAccelCount(0);
      setStopCount(0);
    } else {
      setIsRecording(false);

      const finalDistance = geolocation.distance;
      const finalDuration = tripTimer;
      const finalAvg = geolocation.avgSpeed || (finalDistance > 0 ? (finalDistance / (finalDuration / 3600000)) : 0);
      const finalMax = geolocation.maxSpeed;

      // Only save if some telemetry was recorded
      if (finalDistance > 0.03) {
        const fuelSaved = finalDistance * 0.022; // ~0.022L saved per km compared to harsh riding
        const costSaved = fuelSaved * fuelPrice;

        const totalMinutes = Math.round(finalDuration / 60000);
        let rideStyle = 'smoothly';
        if (accelCount > 1 || finalMax > 90) rideStyle = 'spiritedly';
        if (stopCount > 1) rideStyle = 'dynamically with active stops';

        let story = `You completed a ${finalDistance.toFixed(2)} km trip in ${totalMinutes} minutes, riding ${rideStyle}. `;
        if (accelCount > 0 || stopCount > 0) {
          story += `Telemetry logged ${accelCount} sudden acceleration burst${accelCount > 1 ? 's' : ''} and ${stopCount} hard deceleration event${stopCount > 1 ? 's' : ''}. `;
        } else {
          story += `You maintained an exceptionally steady, zen pacing. `;
        }
        story += `Your smooth driving saved approximately ${fuelSaved.toFixed(2)}L of fuel, putting ₹${costSaved.toFixed(0)} back in your wallet!`;

        const newRide: Ride = {
          startTime: Date.now() - finalDuration,
          endTime: Date.now(),
          distance: finalDistance,
          duration: finalDuration,
          avgSpeed: finalAvg,
          maxSpeed: finalMax,
          fuelSaved,
          costSaved,
          storySummary: story,
          pathPoints: geolocation.pathPoints
        };

        // Add to IndexedDB
        await db.rides.add(newRide);

        // Update Odometer in memory and DB
        const nextOdo = storedOdometer + finalDistance;
        setStoredOdometer(nextOdo);
        await setSetting('odometer', nextOdo);

        // Decrease actual stored fuel litres
        const fuelConsumed = finalDistance / fuelEconomy;
        const nextFuelLitres = Math.max(currentFuelLitres - fuelConsumed, 0.2);
        setCurrentFuelLitres(nextFuelLitres);
        await setSetting('currentFuelLitres', nextFuelLitres);

        // Reload rides list
        const savedRides = await db.rides.toArray();
        setRidesList(savedRides);
      }
      
      setTripTimer(0);
      setSimSpeed(0);
    }
  };

  // Delete ride log entry
  const handleDeleteRide = async (id: number) => {
    await deleteRide(id);
    const savedRides = await db.rides.toArray();
    setRidesList(savedRides);
  };

  // System Settings Calibrations Saving hooks
  const handleAlertSpeedChange = async (val: number) => {
    setAlertSpeed(val);
    await setSetting('alertSpeed', val);
  };

  const handleFuelPriceChange = async (val: number) => {
    setFuelPrice(val);
    await setSetting('fuelPrice', val);
  };

  const handleOdometerChange = async (val: number) => {
    setStoredOdometer(val);
    await setSetting('odometer', val);
  };

  const handleTankCapacityChange = async (val: number) => {
    setTankCapacity(val);
    await setSetting('tankCapacity', val);
  };

  const handleFuelEconomyChange = async (val: number) => {
    setFuelEconomy(val);
    await setSetting('fuelEconomy', val);
  };

  // Manual Odometer Quick Edit save trigger
  const handleOpenOdoModal = () => {
    setTempOdoValue(Math.round(storedOdometer).toString());
    setShowOdoModal(true);
  };

  const handleSaveOdometer = async () => {
    const value = parseFloat(tempOdoValue);
    if (!isNaN(value) && value >= 0) {
      setStoredOdometer(value);
      await setSetting('odometer', value);
    }
    setShowOdoModal(false);
  };

  const handleViewModeChange = async (mode: 'analog' | 'digital') => {
    setViewMode(mode);
    await setSetting('viewMode', mode);
  };

  // Math conversions: percentage of fuel left in tank
  const fuelPercentage = Math.round((currentFuelLitres / tankCapacity) * 100);

  // Cumulative Live Odometer reading
  const currentOdometer = storedOdometer + (isRecording ? geolocation.distance : 0);

  return (
    <>
      {/* Top Header Bar */}
      <header className="top-header">
        <div className="logo-group" onClick={() => setActiveTab('speedometer')}>
          <Gauge size={22} className="speed-eco" style={{ display: 'block' }} />
          <span className="logo-text">ZenRide</span>
        </div>

        <div className="header-actions">
          {/* Moonlight brightness/dim toggler */}
          <button 
            className={`icon-btn ${nightMode ? 'active' : ''}`}
            onClick={() => setNightMode(prev => !prev)}
            title="Toggle Night Dim mode"
          >
            {nightMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            className="icon-btn" 
            onClick={() => setIsLandscape(prev => !prev)}
            title="Toggle Landscape/Portrait Layout"
          >
            <RotateCw 
              size={18} 
              style={{ 
                transform: isLandscape ? 'rotate(90deg)' : 'none', 
                transition: 'transform 0.3s ease',
                color: isLandscape ? 'var(--accent-blue)' : 'var(--text-secondary)'
              }} 
            />
          </button>

          <button 
            className={`icon-btn ${activeTab === 'more' ? 'active' : ''}`}
            onClick={() => setActiveTab('more')}
            title="System Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {/* Main Container Orchestrator */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {isLandscape ? (
          /* Landscape Split Cockpit: Speedometer permanently left, tabs toggle right accessories */
          <AppLayout
            leftColumn={
              /* 1. Compact Recording Pill Card */
              <div 
                className="zen-card recording-compact-pill" 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px 18px', 
                  display: 'flex',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`rec-dot ${isRecording ? 'active' : ''}`} />
                  {isRecording ? (
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>
                      {formatDuration(tripTimer)} <span style={{ color: 'var(--accent-blue)', marginLeft: '6px', fontSize: '12px', fontWeight: '500' }}>{geolocation.distance.toFixed(1)} km</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Recorder Ready</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    className="icon-btn" 
                    onClick={() => setActiveTab('insights')} 
                    style={{ width: '28px', height: '28px', margin: 0, padding: 0 }}
                    title="Jump to details view inside Insights"
                  >
                    <ArrowRight size={14} style={{ color: 'var(--accent-blue)' }} />
                  </button>
                  <label className="rec-switch" style={{ scale: '0.85', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={isRecording}
                      onChange={handleToggleRecording}
                    />
                    <span className="rec-slider" />
                  </label>
                </div>
              </div>
            }
            centerColumn={
              <div className="zen-card center-speed-card">
                <Speedometer
                  speed={geolocation.speed}
                  heading={geolocation.heading}
                  gpsStatus={geolocation.gpsStatus}
                  alertSpeed={alertSpeed}
                  odometer={currentOdometer}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                  fuelLevel={fuelPercentage}
                />
              </div>
            }
            rightColumn={
              <>
                {activeTab === 'speedometer' && (
                  <SecondaryStats
                    odometer={currentOdometer}
                    fuelLevel={fuelPercentage}
                    tankCapacity={tankCapacity}
                    fuelEconomy={fuelEconomy}
                    onOdometerClick={handleOpenOdoModal}
                    onReadinessClick={() => setShowReadinessModal(true)}
                    isChecklistComplete={isChecklistComplete}
                  />
                )}
                {activeTab === 'insights' && (
                  <InsightsPanel
                    rides={ridesList}
                    onDeleteRide={handleDeleteRide}
                    currencySymbol="₹"
                  />
                )}
                {activeTab === 'readiness' && (
                  <ReadinessChecklist
                    items={readinessItems}
                    onToggleItem={handleToggleReadinessItem}
                  />
                )}
                {activeTab === 'profile' && (
                  <ProfilePanel
                    rides={ridesList}
                    odometer={currentOdometer}
                    currencySymbol="₹"
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsPanel
                    alertSpeed={alertSpeed}
                    onAlertSpeedChange={handleAlertSpeedChange}
                    fuelPrice={fuelPrice}
                    onFuelPriceChange={handleFuelPriceChange}
                    odometer={storedOdometer}
                    onOdometerChange={handleOdometerChange}
                    tankCapacity={tankCapacity}
                    onTankCapacityChange={handleTankCapacityChange}
                    fuelEconomy={fuelEconomy}
                    onFuelEconomyChange={handleFuelEconomyChange}
                    currentFuelLitres={currentFuelLitres}
                    onFuelLitresChange={handleFuelLitresChange}
                    isSimulated={isSimulated}
                    onToggleSimulation={setIsSimulated}
                    simSpeed={simSpeed}
                    onSimSpeedChange={setSimSpeed}
                    simHeading={simHeading}
                    onSimHeadingChange={setSimHeading}
                    onTriggerDecelEvent={handleSimSuddenStop}
                    onTriggerAccelEvent={handleSimAccelSpike}
                  />
                )}
                {activeTab === 'more' && (
                  <MorePanel onNavigate={(tab) => setActiveTab(tab)} />
                )}
              </>
            }
          />
        ) : (
          /* Portrait Layout: Standard full-screen tab switching */
          <>
            {activeTab === 'speedometer' && (
              <AppLayout
                leftColumn={
                  <div 
                    className="zen-card recording-compact-pill" 
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 18px', 
                      display: 'flex',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`rec-dot ${isRecording ? 'active' : ''}`} />
                      {isRecording ? (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>
                          {formatDuration(tripTimer)} <span style={{ color: 'var(--accent-blue)', marginLeft: '6px', fontSize: '12px', fontWeight: '500' }}>{geolocation.distance.toFixed(1)} km</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '13.5px', fontWeight: '600' }}>Recorder Ready</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        className="icon-btn" 
                        onClick={() => setActiveTab('insights')} 
                        style={{ width: '28px', height: '28px', margin: 0, padding: 0 }}
                        title="Jump to details view inside Insights"
                      >
                        <ArrowRight size={14} style={{ color: 'var(--accent-blue)' }} />
                      </button>
                      <label className="rec-switch" style={{ scale: '0.85', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={isRecording}
                          onChange={handleToggleRecording}
                        />
                        <span className="rec-slider" />
                      </label>
                    </div>
                  </div>
                }
                centerColumn={
                  <div className="zen-card center-speed-card">
                    <Speedometer
                      speed={geolocation.speed}
                      heading={geolocation.heading}
                      gpsStatus={geolocation.gpsStatus}
                      alertSpeed={alertSpeed}
                      odometer={currentOdometer}
                      viewMode={viewMode}
                      onViewModeChange={handleViewModeChange}
                      fuelLevel={fuelPercentage}
                    />
                  </div>
                }
                rightColumn={
                  <SecondaryStats
                    odometer={currentOdometer}
                    fuelLevel={fuelPercentage}
                    tankCapacity={tankCapacity}
                    fuelEconomy={fuelEconomy}
                    onOdometerClick={handleOpenOdoModal}
                    onReadinessClick={() => setShowReadinessModal(true)}
                    isChecklistComplete={isChecklistComplete}
                  />
                }
              />
            )}

            {activeTab === 'insights' && (
              <div className="portrait-panel-wrapper insights-width">
                <InsightsPanel
                  rides={ridesList}
                  onDeleteRide={handleDeleteRide}
                  currencySymbol="₹"
                />
              </div>
            )}

            {activeTab === 'readiness' && (
              <div className="portrait-panel-wrapper readiness-width">
                <ReadinessChecklist
                  items={readinessItems}
                  onToggleItem={handleToggleReadinessItem}
                />
              </div>
            )}

            {activeTab === 'more' && (
              <div className="portrait-panel-wrapper settings-width">
                <MorePanel onNavigate={(tab) => setActiveTab(tab)} />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="portrait-panel-wrapper settings-width">
                <ProfilePanel
                  rides={ridesList}
                  odometer={currentOdometer}
                  currencySymbol="₹"
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="portrait-panel-wrapper settings-width">
                <SettingsPanel
                  alertSpeed={alertSpeed}
                  onAlertSpeedChange={handleAlertSpeedChange}
                  fuelPrice={fuelPrice}
                  onFuelPriceChange={handleFuelPriceChange}
                  odometer={storedOdometer}
                  onOdometerChange={handleOdometerChange}
                  tankCapacity={tankCapacity}
                  onTankCapacityChange={handleTankCapacityChange}
                  fuelEconomy={fuelEconomy}
                  onFuelEconomyChange={handleFuelEconomyChange}
                  currentFuelLitres={currentFuelLitres}
                  onFuelLitresChange={handleFuelLitresChange}
                  isSimulated={isSimulated}
                  onToggleSimulation={setIsSimulated}
                  simSpeed={simSpeed}
                  onSimSpeedChange={setSimSpeed}
                  simHeading={simHeading}
                  onSimHeadingChange={setSimHeading}
                  onTriggerDecelEvent={handleSimSuddenStop}
                  onTriggerAccelEvent={handleSimAccelSpike}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Nav Bar (Material 3 Style) */}
      <nav className="bottom-nav-bar">
        <button 
          className={`nav-tab-btn ${activeTab === 'speedometer' ? 'active' : ''}`}
          onClick={() => setActiveTab('speedometer')}
        >
          <div className="nav-icon-container">
            <Gauge size={22} />
          </div>
          <span>Speedometer</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <div className="nav-icon-container">
            <TrendingUp size={22} />
          </div>
          <span>Insights</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'readiness' ? 'active' : ''}`}
          onClick={() => setActiveTab('readiness')}
        >
          <div className="nav-icon-container">
            <ShieldCheck size={22} />
          </div>
          <span>Readiness</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          <div className="nav-icon-container">
            <MoreHorizontal size={22} />
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* Checklist dialog modal overlay */}
      {showReadinessModal && (
        <div className="checklist-modal-backdrop" onClick={() => setShowReadinessModal(false)}>
          <div className="checklist-modal-content" onClick={e => e.stopPropagation()}>
            <ReadinessChecklist
              items={readinessItems}
              onToggleItem={handleToggleReadinessItem}
              onClose={() => setShowReadinessModal(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Odometer manual quick edit popup overlay modal */}
      {showOdoModal && (
        <div className="quick-edit-backdrop" onClick={() => setShowOdoModal(false)}>
          <div className="quick-edit-content" onClick={e => e.stopPropagation()}>
            <div className="panel-header" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} />
                <span className="panel-title">Odometer Calibration</span>
              </div>
              <p className="panel-subtitle">Manually override cumulative mileage calibration.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                CURRENT MILEAGE (km)
              </span>
              <input
                type="number"
                className="setting-input"
                value={tempOdoValue}
                onChange={e => setTempOdoValue(e.target.value)}
                autoFocus
                placeholder="e.g. 12458"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
              <button 
                className="sim-btn" 
                onClick={() => setShowOdoModal(false)}
                style={{ background: 'none' }}
              >
                Cancel
              </button>
              <button 
                className="close-modal-btn" 
                onClick={handleSaveOdometer}
                style={{ margin: 0 }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
