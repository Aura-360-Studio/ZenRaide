// MorePanel Component — Quick links & App information
import { Settings, ShieldCheck, User, Info, Star, ExternalLink, ChevronRight } from 'lucide-react';

interface MorePanelProps {
  onNavigate: (tab: 'settings' | 'readiness' | 'profile') => void;
}

export function MorePanel({ onNavigate }: MorePanelProps) {
  const menuItems = [
    {
      id: 'profile',
      icon: <User size={18} style={{ color: 'var(--accent-blue)' }} />,
      iconBg: 'rgba(168, 199, 250, 0.12)',
      label: 'Rider Profile',
      desc: 'View stats, eco achievements & bike info',
      action: () => onNavigate('profile'),
    },
    {
      id: 'readiness',
      icon: <ShieldCheck size={18} style={{ color: 'var(--accent-green)' }} />,
      iconBg: 'rgba(134, 239, 172, 0.12)',
      label: 'Pre-Ride Safety Check',
      desc: 'Run through your helmet, tyres & brake checklist',
      action: () => onNavigate('readiness'),
    },
    {
      id: 'settings',
      icon: <Settings size={18} style={{ color: 'var(--accent-yellow)' }} />,
      iconBg: 'rgba(253, 224, 71, 0.12)',
      label: 'Settings & Calibration',
      desc: 'Configure speed alerts, fuel, odometer & simulation',
      action: () => onNavigate('settings'),
    },
  ];

  return (
    <div className="panel-container">
      <div className="panel-header">
        <span className="panel-title">More</span>
        <p className="panel-subtitle">Quick access to profile, safety checks and configuration.</p>
      </div>

      {/* Main Menu List */}
      <div className="zen-card" style={{ padding: '8px', gap: '4px' }}>
        {menuItems.map((item, idx) => (
          <button
            key={item.id}
            className="more-menu-item"
            onClick={item.action}
            style={{ borderBottom: idx < menuItems.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}
          >
            <div className="more-menu-icon" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <div className="more-menu-text">
              <span className="more-menu-label">{item.label}</span>
              <span className="more-menu-desc">{item.desc}</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </button>
        ))}
      </div>

      {/* App Info Card */}
      <div className="zen-card" style={{ gap: '12px' }}>
        <div className="card-title">
          <Info size={14} style={{ color: 'var(--text-muted)' }} />
          <span>About ZenRide</span>
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', display: 'flex', gap: '8px' }}>
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
  );
}
