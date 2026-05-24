// ProfilePanel Component – Rider Hub with Premium Exploration Menus
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Settings, 
  TrendingUp, 
  Info, 
  Star, 
  Edit2, 
  Check, 
  ChevronRight, 
  ExternalLink,
  Award,
  Calendar,
  Zap
} from 'lucide-react';
import { ReadinessChecklist, type ChecklistItem } from './ReadinessChecklist';
import { SettingsPanel } from './SettingsPanel';

interface ProfilePanelProps {
  rides: any[]; // Ride[] from db
  odometer: number;
  currencySymbol: string;
  
  // Settings Panel parameters
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
  
  // Readiness Checklist parameters
  checklistItems: ChecklistItem[];
  onToggleChecklistItem: (id: string) => void;

  // Navigation tab switcher (to jump between speedometer / insights)
  onNavigateTab: (tab: 'speedometer' | 'insights' | 'readiness' | 'more' | 'settings' | 'profile') => void;

  // Custom Rider Profile details
  riderName: string;
  onRiderNameChange: (val: string) => void;
}

type SubView = 'menu' | 'achievements' | 'checklist' | 'settings' | 'about';

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

  checklistItems,
  onToggleChecklistItem,

  onNavigateTab,

  riderName,
  onRiderNameChange
}: ProfilePanelProps) {
  const [activeSubView, setActiveSubView] = useState<SubView>('menu');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(riderName);

  // Sync temp name when prop changes
  useEffect(() => {
    setTempName(riderName);
  }, [riderName]);

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

  const handleBackClick = () => {
    if (activeSubView === 'menu') {
      // Go back to speedometer
      onNavigateTab('speedometer');
    } else {
      setActiveSubView('menu');
    }
  };

  // Aggregates for achievements
  const totalRidesCount = rides.length;
  const totalDistance = rides.reduce((acc, r) => acc + r.distance, 0);
  const totalFuelSaved = rides.reduce((acc, r) => acc + r.fuelSaved, 0);
  const totalCostSaved = rides.reduce((acc, r) => acc + r.costSaved, 0);
  const recentRides = [...rides].slice(-3).reverse();

  return (
    <div className="panel-container">
      {/* Circle back button top left (always visible, acts as master router back to menu / speedometer) */}
      <button 
        className="profile-back-circle" 
        onClick={handleBackClick}
        title={activeSubView === 'menu' ? "Return to speedometer" : "Back to profile hub"}
      >
        <ArrowLeft size={18} />
      </button>

      {activeSubView === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Header Profile Area matching screenshot */}
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

          {/* Explore section title matching screenshot */}
          <span className="explore-section-title">Explore</span>

          {/* Premium Rounded Card Menu List matching screenshot */}
          <div className="premium-menu-list">
            <button className="premium-menu-row" onClick={() => setActiveSubView('achievements')}>
              <div className="premium-menu-icon-badge" style={{ background: 'rgba(168, 199, 250, 0.12)', color: 'var(--accent-blue)' }}>
                <Star size={18} />
              </div>
              <div className="premium-menu-info">
                <span className="premium-menu-title">Rider Statistics</span>
                <span className="premium-menu-subtitle">
                  {odometer.toFixed(0)} km ODO • {totalRidesCount} rides completed
                </span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button className="premium-menu-row" onClick={() => setActiveSubView('checklist')}>
              <div className="premium-menu-icon-badge" style={{ background: 'rgba(134, 239, 172, 0.12)', color: 'var(--accent-green)' }}>
                <ShieldCheck size={18} />
              </div>
              <div className="premium-menu-info">
                <span className="premium-menu-title">Pre-Ride Safety Check</span>
                <span className="premium-menu-subtitle">Tires, brakes, helmet & critical checklist</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button className="premium-menu-row" onClick={() => setActiveSubView('settings')}>
              <div className="premium-menu-icon-badge" style={{ background: 'rgba(253, 224, 71, 0.12)', color: 'var(--accent-yellow)' }}>
                <Settings size={18} />
              </div>
              <div className="premium-menu-info">
                <span className="premium-menu-title">Settings & Calibration</span>
                <span className="premium-menu-subtitle">Configure speeds, fuel price & simulation</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button className="premium-menu-row" onClick={() => onNavigateTab('insights')}>
              <div className="premium-menu-icon-badge" style={{ background: 'rgba(192, 132, 252, 0.12)', color: '#c084fc' }}>
                <TrendingUp size={18} />
              </div>
              <div className="premium-menu-info">
                <span className="premium-menu-title">Ride Analytics</span>
                <span className="premium-menu-subtitle">Deep eco insights and full trip history logs</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>

            <button className="premium-menu-row" onClick={() => setActiveSubView('about')}>
              <div className="premium-menu-icon-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                <Info size={18} />
              </div>
              <div className="premium-menu-info">
                <span className="premium-menu-title">About ZenRide</span>
                <span className="premium-menu-subtitle">App details, offline capabilities & share info</span>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      )}

      {/* Sub-view: Rider Statistics / Achievements */}
      {activeSubView === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '36px' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <span className="panel-title">Rider Statistics</span>
            <p className="panel-subtitle">Your aggregated eco achievements and riding milestones.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div className="zen-card" style={{ padding: '12px', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                <Award size={12} style={{ color: 'var(--accent-yellow)' }} />
                <span>Odometer</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {odometer.toFixed(1)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>km</span>
              </span>
            </div>

            <div className="zen-card" style={{ padding: '12px', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                <Zap size={12} style={{ color: 'var(--accent-green)' }} />
                <span>Fuel Saved</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>
                {totalFuelSaved.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>L</span>
              </span>
            </div>

            <div className="zen-card" style={{ padding: '12px', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                <Calendar size={12} style={{ color: 'var(--accent-blue)' }} />
                <span>Total Trips</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {totalRidesCount} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>rides</span>
              </span>
            </div>

            <div className="zen-card" style={{ padding: '12px', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                <Star size={12} style={{ color: '#c084fc' }} />
                <span>Money Saved</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', color: '#c084fc' }}>
                {currencySymbol}{totalCostSaved.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="zen-card" style={{ padding: '14px' }}>
            <div className="card-title" style={{ marginBottom: '8px' }}>
              <Star size={14} style={{ color: 'var(--accent-yellow)' }} />
              <span>Recent Riding Logs</span>
            </div>
            {recentRides.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                No rides logged yet. Start recording in the cockpit tab!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentRides.map((ride, idx) => (
                  <div 
                    key={ride.id ?? idx} 
                    style={{ 
                      paddingBottom: idx < recentRides.length - 1 ? '8px' : '0', 
                      borderBottom: idx < recentRides.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(ride.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {ride.distance.toFixed(2)} km
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Duration: {Math.round(ride.duration / 60000)} min • Avg Speed: {Math.round(ride.avgSpeed)} km/h
                      </span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: '600' }}>
                        Saved {currencySymbol}{ride.costSaved.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-view: Pre-Ride Safety Check */}
      {activeSubView === 'checklist' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '36px' }}>
          <ReadinessChecklist
            items={checklistItems}
            onToggleItem={onToggleChecklistItem}
          />
        </div>
      )}

      {/* Sub-view: Settings & Calibration */}
      {activeSubView === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '36px' }}>
          <SettingsPanel
            alertSpeed={alertSpeed}
            onAlertSpeedChange={onAlertSpeedChange}
            fuelPrice={fuelPrice}
            onFuelPriceChange={onFuelPriceChange}
            odometer={odometer}
            onOdometerChange={onOdometerChange}
            tankCapacity={tankCapacity}
            onTankCapacityChange={onTankCapacityChange}
            fuelEconomy={fuelEconomy}
            onFuelEconomyChange={onFuelEconomyChange}
            currentFuelLitres={currentFuelLitres}
            onFuelLitresChange={onFuelLitresChange}
            isSimulated={isSimulated}
            onToggleSimulation={onToggleSimulation}
            simSpeed={simSpeed}
            onSimSpeedChange={onSimSpeedChange}
            simHeading={simHeading}
            onSimHeadingChange={onSimHeadingChange}
            onTriggerDecelEvent={onTriggerDecelEvent}
            onTriggerAccelEvent={onTriggerAccelEvent}
          />
        </div>
      )}

      {/* Sub-view: About ZenRide */}
      {activeSubView === 'about' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '36px' }}>
          <div className="panel-header" style={{ marginBottom: '14px' }}>
            <span className="panel-title">About ZenRide</span>
            <p className="panel-subtitle">Application details, platform specs and settings sharing.</p>
          </div>

          <div className="zen-card" style={{ gap: '12px' }}>
            <div className="card-title">
              <Info size={14} style={{ color: 'var(--text-muted)' }} />
              <span>System & Software Information</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Version</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>v1.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Platform</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-blue)' }}>PWA · Offline Ready</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Built with</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>React + Vite + Dexie</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                className="sim-btn"
                style={{ flex: 1, fontSize: '12px', gap: '6px' }}
                onClick={() => window.open('https://github.com/Aura-360-Studio/ZenRaide', '_blank')}
              >
                <ExternalLink size={13} />
                GitHub
              </button>
              <button
                className="sim-btn"
                style={{ flex: 1, fontSize: '12px', gap: '6px', color: 'var(--accent-yellow)' }}
                onClick={() => {
                  if ('share' in navigator) {
                    navigator.share({ title: 'ZenRide', text: 'A zen motorcycle dashboard PWA!', url: window.location.href });
                  }
                }}
              >
                <Star size={13} />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
