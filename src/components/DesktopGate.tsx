import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Gauge, ArrowLeft } from 'lucide-react';
import App from '../App';

interface DesktopGateProps {
  children: ReactNode;
}

const DESKTOP_BREAKPOINT = 768;

export function DesktopGate({ children }: DesktopGateProps) {
  const [isDesktop, setIsDesktop] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth > DESKTOP_BREAKPOINT : false
  );
  const [showApp, setShowApp] = useState(false);

  const handleResize = useCallback(() => {
    setIsDesktop(window.innerWidth > DESKTOP_BREAKPOINT);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // On mobile, render the app directly — no gate needed
  if (!isDesktop) return <>{children}</>;

  // Desktop: Show Landing Page
  if (!showApp) {
    return (
      <div className="desktop-gate">
        {/* Animated equalizer bars background */}
        <div className="gate-bg-bars" aria-hidden="true">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="gate-bar"
              style={{
                '--bar-delay': `${(i * 0.08)}s`,
                '--bar-height': `${20 + Math.random() * 60}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="gate-card">
          {/* Logo icon */}
          <div className="gate-icon">
            <Gauge size={26} strokeWidth={2.5} />
          </div>

          <h1 className="gate-title">
            ZenRide is a{' '}
            <span className="gate-highlight">Mobile-First</span>
            <br />
            Experience
          </h1>

          <p className="gate-desc">
            To enjoy our privacy-first local tracking and immersive full-screen
            interactions, please visit this site on your mobile device.
          </p>

          {/* QR Code — local image from /public */}
          <div className="gate-qr-wrapper">
            <img
              className="gate-qr-img"
              src="/qrcode_zen-ride.vercel.app.png"
              alt="QR Code — Scan to open ZenRide on your phone"
              width={180}
              height={180}
              loading="eager"
            />
          </div>

          <p className="gate-scan-label">SCAN TO DEPLOY ON MOBILE</p>
          <p className="gate-scan-sub">
            Install as a PWA for the full ZenRide experience.
          </p>

          <button
            className="gate-explore-btn"
            onClick={() => setShowApp(true)}
          >
            EXPLORE ANYWAY
          </button>
        </div>
      </div>
    );
  }

  // Desktop: Phone Mockup View — render App with forcePortrait
  return (
    <div className="desktop-gate desktop-gate--mockup">
      {/* Background bars */}
      <div className="gate-bg-bars" aria-hidden="true">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="gate-bar"
            style={{
              '--bar-delay': `${(i * 0.08)}s`,
              '--bar-height': `${20 + Math.random() * 60}%`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Back button */}
      <button className="gate-back-btn" onClick={() => setShowApp(false)}>
        <ArrowLeft size={16} />
        <span>Back to Landing</span>
      </button>

      {/* Phone frame */}
      <div className="phone-mockup">
        {/* Top notch */}
        <div className="phone-notch">
          <span className="phone-notch-dot" />
          <span className="phone-notch-dot phone-notch-dot--small" />
        </div>

        {/* App rendered inside the phone screen — forced to portrait/mobile layout */}
        <div className="phone-screen">
          <App forcePortrait={true} />
        </div>

        {/* Bottom home indicator */}
        <div className="phone-home-bar" />
      </div>
    </div>
  );
}
