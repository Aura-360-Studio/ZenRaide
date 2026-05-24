import { useState, useEffect } from 'react';

export function useVibration() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('vibrate' in navigator);
  }, []);

  const triggerVibration = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently catch quirks in some sandboxed desktop browsers
      }
    }
  };

  const alertOverspeed = () => {
    triggerVibration([150, 100, 150]); // Rapid double pulse
  };

  const alertSuddenStop = () => {
    triggerVibration([450]); // Sustained solid pulse
  };

  const confirmToggle = () => {
    triggerVibration([80]); // Light positive click
  };

  return {
    isSupported,
    alertOverspeed,
    alertSuddenStop,
    confirmToggle,
    triggerVibration
  };
}
