// Speedometer Component
import { Fuel } from 'lucide-react';

interface SpeedometerProps {
  speed: number;
  heading: string;
  gpsStatus: 'strong' | 'weak' | 'searching' | 'simulated';
  alertSpeed: number; // Overspeed threshold
  odometer: number;  // Cumulative odometer reading in km
  viewMode: 'analog' | 'digital';
  onViewModeChange: (mode: 'analog' | 'digital') => void;
  fuelLevel: number; // Fuel percentage level
}

export function Speedometer({ speed, heading, gpsStatus, alertSpeed, odometer, viewMode, onViewModeChange, fuelLevel }: SpeedometerProps) {
  // Format odometer as 6-digit zero-padded drum cells
  const odoDigits = String(Math.round(odometer)).padStart(6, '0').slice(-6).split('');
  // SVG circular properties
  const radius = 115;       // Slightly adjusted to make ticks & labels spacious inside card
  const strokeWidth = 12;     // Thicker, premium solid dial track (Speedtest/EV dashboard style)
  const center = 150;
  const circumference = 2 * Math.PI * radius; // ~722.56
  const arcDegrees = 240;     // Sweep of the speedometer arc
  const arcLength = (arcDegrees / 360) * circumference; // ~481.7
  
  const isDigital = viewMode === 'digital';
  
  // Calculate dash offset for current speed (capped at 160)
  const clampedSpeed = Math.min(Math.max(speed, 0), 160);
  const strokeDashoffset = arcLength - (clampedSpeed / 160) * arcLength;

  // Determine dynamic speed style classes & colors based on 5 ranges matching the reference gauge
  let speedColorClass = 'speed-eco';
  let arcStrokeColor = 'var(--accent-green)';
  let arcGlowFilter = 'drop-shadow(0 0 8px var(--accent-green))';

  if (speed >= alertSpeed + 20 || speed >= 130) {
    speedColorClass = 'speed-danger'; // Deep Crimson Danger
    arcStrokeColor = 'var(--accent-crimson)';
    arcGlowFilter = 'drop-shadow(0 0 10px var(--accent-crimson))';
  } else if (speed >= alertSpeed || speed >= 100) {
    speedColorClass = 'speed-warn'; // Pastel Red Warning
    arcStrokeColor = 'var(--accent-red)';
    arcGlowFilter = 'drop-shadow(0 0 8px var(--accent-red))';
  } else if (speed >= Math.max(alertSpeed - 20, 70)) {
    speedColorClass = 'speed-orange'; // Spirited Orange
    arcStrokeColor = 'var(--accent-orange)';
    arcGlowFilter = 'drop-shadow(0 0 8px var(--accent-orange))';
  } else if (speed >= 40) {
    speedColorClass = 'speed-yellow'; // Cruising Yellow
    arcStrokeColor = 'var(--accent-yellow)';
    arcGlowFilter = 'drop-shadow(0 0 8px var(--accent-yellow))';
  } else {
    speedColorClass = 'speed-eco'; // Safe/Eco Green
    arcStrokeColor = 'var(--accent-green)';
    arcGlowFilter = 'drop-shadow(0 0 8px var(--accent-green))';
  }

  // Generate ticks (minimalist: ticks every 10 km/h)
  const ticks = [];
  for (let s = 0; s <= 160; s += 10) {
    const isMajor = s % 40 === 0; // major ticks at 0, 40, 80, 120, 160
    const angle = -120 + (s / 160) * arcDegrees;
    ticks.push({
      speed: s,
      isMajor,
      angle
    });
  }

  // Map GPS status
  const gpsActiveBars = {
    searching: 1,
    weak: 2,
    strong: 4,
    simulated: 4
  }[gpsStatus];

  const gpsLabel = {
    searching: 'Searching...',
    weak: 'Weak GPS',
    strong: 'GPS Strong',
    simulated: 'Simulated'
  }[gpsStatus];

  return (
    <div className="speedometer-gauge-wrapper">
      {/* Premium capsule view switcher (Analog / Digital) */}
      <div className="view-mode-toggle-container">
        <button
          onClick={() => onViewModeChange('analog')}
          className={`toggle-btn ${viewMode === 'analog' ? 'active' : ''}`}
        >
          Analog
        </button>
        <button
          onClick={() => onViewModeChange('digital')}
          className={`toggle-btn ${viewMode === 'digital' ? 'active' : ''}`}
        >
          Digital
        </button>
      </div>

      <svg className="gauge-svg" viewBox="0 0 300 300">
        <defs>
          {/* Soft glowing blue filter for horizon strip */}
          <filter id="horizon-glow" x="-10%" y="-30%" width="120%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ==========================================
           Adopting Horizon Cluster UI (highway lanes)
           ========================================== */}
        <g id="horizon-highway">
          {/* Glowing horizon strip */}
          <line x1="40" y1="216" x2="260" y2="216" className="horizon-glow-line" filter="url(#horizon-glow)" />
          
          {/* Grid lines below the horizon */}
          <line x1="120" y1="226" x2="180" y2="226" className="horizon-cyber-grid" />
          <line x1="100" y1="236" x2="200" y2="236" className="horizon-cyber-grid" />
          <line x1="80" y1="246" x2="220" y2="246" className="horizon-cyber-grid" />

          {/* Perspective highway border lines */}
          <line x1="150" y1="216" x2="80" y2="258" className="perspective-road-solid" />
          <line x1="150" y1="216" x2="220" y2="258" className="perspective-road-solid" />

          {/* Perspective dashed center lane markings */}
          <line x1="150" y1="216" x2="150" y2="258" className="perspective-road-lane" />
        </g>

        {/* Sleek outer accent ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 14}
          fill="none"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1.5"
        />

        {/* Sleek inner accent ring */}
        <circle
          cx={center}
          cy={center}
          r={radius - 14}
          fill="none"
          stroke="rgba(255, 255, 255, 0.02)"
          strokeWidth="1.2"
        />

        {/* Speedometer static background track (Thick & Dark) */}
        <path
          className="gauge-track"
          d="M 50.41 207.5 A 115 115 0 1 1 249.59 207.5"
          fill="none"
          strokeWidth={isDigital ? 2 : strokeWidth}
          strokeLinecap="round"
          style={{ opacity: isDigital ? 0.08 : 1 }}
        />

        {/* Dynamic speed progress level arc (Thick & Glowing) */}
        <path
          className="gauge-progress"
          d="M 50.41 207.5 A 115 115 0 1 1 249.59 207.5"
          fill="none"
          stroke={arcStrokeColor}
          strokeWidth={isDigital ? 4 : strokeWidth + 1}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          style={{
            strokeDashoffset,
            filter: arcGlowFilter,
            opacity: isDigital ? 0.85 : 1
          }}
        />

        {/* Ticks and Clean Labels written INSIDE the dial path */}
        {!isDigital && (
          <g>
            {ticks.map(tick => {
              const rad = ((tick.angle - 90) * Math.PI) / 180;
              const startR = radius - (tick.isMajor ? 12 : 6);
              const endR = radius + (tick.isMajor ? 8 : 4);
              
              const x1 = center + startR * Math.cos(rad);
              const y1 = center + startR * Math.sin(rad);
              const x2 = center + endR * Math.cos(rad);
              const y2 = center + endR * Math.sin(rad);

              const labelR = radius - 24;
              const lx = center + labelR * Math.cos(rad);
              const ly = center + labelR * Math.sin(rad) + 4.5;

              return (
                <g key={tick.speed}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={tick.isMajor ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)'}
                    strokeWidth={tick.isMajor ? 2.5 : 1}
                  />
                  {tick.isMajor && (
                    <text
                      x={lx}
                      y={ly}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      fontFamily="var(--font-display)"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {tick.speed}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Premium Speed needle pointer */}
        {!isDigital && (() => {
          const pointerAngle = -120 + (clampedSpeed / 160) * arcDegrees;
          const pointerRad = ((pointerAngle - 90) * Math.PI) / 180;
          
          const needleLength = radius - 6;
          const ptx = center + needleLength * Math.cos(pointerRad);
          const pty = center + needleLength * Math.sin(pointerRad);

          const startLength = 14;
          const pbx = center + startLength * Math.cos(pointerRad);
          const pby = center + startLength * Math.sin(pointerRad);

          return (
            <g>
              <line
                x1={pbx}
                y1={pby}
                x2={ptx}
                y2={pty}
                stroke={arcStrokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${arcStrokeColor})`,
                  transition: 'all 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)'
                }}
              />
              <circle
                cx={center}
                cy={center}
                r="16"
                fill="#0c0d12"
                stroke="#1f202a"
                strokeWidth="1.5"
              />
              <circle
                cx={center}
                cy={center}
                r="4.5"
                fill={arcStrokeColor}
                style={{
                  filter: `drop-shadow(0 0 5px ${arcStrokeColor})`
                }}
              />
            </g>
          );
        })()}
      </svg>

      {/* Mechanical Drum Odometer */}
      <div className={`odo-drum-wrapper ${isDigital ? 'digital-odo-pos' : ''}`}>
        <div className="odo-drum-label">ODO</div>
        <div className="odo-drum-display">
          {odoDigits.map((digit, i) => (
            <div
              key={i}
              className={`odo-drum-cell${i === odoDigits.length - 1 ? ' odo-drum-cell-last' : ''}`}
            >
              <span className="odo-drum-digit">{digit}</span>
            </div>
          ))}
          <div className="odo-drum-unit">km</div>
        </div>
      </div>

      {/* Speed number + km/h — number centered, km/h floats right with cyber-brackets in digital mode */}
      <div className={`speed-readout-wrapper ${isDigital ? 'digital-hud-mode' : ''}`}>
        {isDigital && (
          <>
            <div className={`hud-corner hud-tl ${speedColorClass}`} />
            <div className={`hud-corner hud-tr ${speedColorClass}`} />
            <div className={`hud-corner hud-bl ${speedColorClass}`} />
            <div className={`hud-corner hud-br ${speedColorClass}`} />
          </>
        )}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className={`speed-number ${speedColorClass}`}>
            {Math.round(speed)}
          </div>
          <div className="speed-unit">km/h</div>
        </div>
      </div>

      {/* Direction capsule (Left Side) */}
      <div className="compass-heading-wrapper">
        <div className="compass-heading-capsule">
          {heading}
        </div>
      </div>

      {/* GPS signal strength (Right Side) */}
      <div className="gps-status-wrapper">
        <div className="gps-status-indicator">
          <div className="gps-bars">
            {[1, 2, 3, 4].map(barNum => (
              <span
                key={barNum}
                className={`gps-bar ${barNum <= gpsActiveBars ? 'active' : ''}`}
              />
            ))}
          </div>
          <span style={{ fontWeight: '500' }}>{gpsLabel}</span>
        </div>
      </div>

      {/* 5-Bar premium dynamic fuel gauge (bottom-right corner, ONLY in Digital Mode) */}
      {isDigital && (() => {
        const activeBarsCount = fuelLevel <= 0 ? 0 : Math.ceil(fuelLevel / 20);
        let fuelColorClass = 'fuel-blue';
        if (fuelLevel <= 20) {
          fuelColorClass = 'fuel-red';
        } else if (fuelLevel > 75) {
          fuelColorClass = 'fuel-green';
        }
        return (
          <div className={`digital-fuel-gauge ${fuelColorClass}`}>
            <div className="fuel-bars-container">
              {[1, 2, 3, 4, 5].map(barNum => (
                <span
                  key={barNum}
                  className={`fuel-bar ${barNum <= activeBarsCount ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="fuel-label-group">
              <span>FUEL</span>
              <span className="fuel-percentage-text">{fuelLevel}%</span>
            </div>
          </div>
        );
      })()}

      {/* Circular dynamic fuel gauge (bottom-right corner, ONLY in Analog Mode) */}
      {!isDigital && (() => {
        let fuelColorClass = 'fuel-blue';
        let strokeColor = '#22d3ee'; // Cyan/blue
        let glowFilter = 'drop-shadow(0 0 4px #22d3ee)';
        
        if (fuelLevel <= 20) {
          fuelColorClass = 'fuel-red';
          strokeColor = 'var(--accent-red)';
          glowFilter = 'drop-shadow(0 0 4px var(--accent-red))';
        } else if (fuelLevel > 75) {
          fuelColorClass = 'fuel-green';
          strokeColor = 'var(--accent-green)';
          glowFilter = 'drop-shadow(0 0 4px var(--accent-green))';
        }

        const miniRadius = 21;
        const miniCircumference = 2 * Math.PI * miniRadius; // ~131.95
        const miniDashoffset = miniCircumference - (Math.min(Math.max(fuelLevel, 0), 100) / 100) * miniCircumference;

        return (
          <div className={`analog-circular-fuel ${fuelColorClass}`}>
            <div className="analog-circle-wrapper">
              <svg width="50" height="50" viewBox="0 0 56 56" style={{ overflow: 'visible' }}>
                {/* Background track circle */}
                <circle
                  cx="28"
                  cy="28"
                  r={miniRadius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.04)"
                  strokeWidth="2.5"
                />
                {/* Glowing active progress circle arc */}
                <circle
                  cx="28"
                  cy="28"
                  r={miniRadius}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeDasharray={miniCircumference}
                  strokeDashoffset={miniDashoffset}
                  transform="rotate(-90 28 28)"
                  style={{
                    filter: glowFilter,
                    transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease'
                  }}
                />
              </svg>
              {/* Glowing dynamic fuel icon centered inside the circle */}
              <div className="analog-circle-icon">
                <Fuel 
                  size={14} 
                  style={{ 
                    color: strokeColor,
                    filter: `drop-shadow(0 0 3px ${strokeColor})`
                  }} 
                />
              </div>
            </div>
            
            {/* FUEL 100% label below the circle, identical to digital mode placement */}
            <div className="fuel-label-group">
              <span>FUEL</span>
              <span className="fuel-percentage-text">{fuelLevel}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
