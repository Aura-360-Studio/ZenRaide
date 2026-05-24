import { useState, useEffect, useRef } from 'react';

// --- Haversine Formula for Geodetic Distance ---
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// --- Compass Heading calculation between two coordinates ---
export function calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360; // Degrees (0-359)
}

// --- Map heading degrees to cardinal directions ---
export function getCardinalDirection(headingDegrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(headingDegrees / 45) % 8;
  return directions[index];
}

export interface GeolocationState {
  speed: number;          // km/h
  distance: number;       // km
  heading: string;        // "N", "NE", etc.
  gpsStatus: 'strong' | 'weak' | 'searching' | 'simulated';
  avgSpeed: number;       // km/h
  maxSpeed: number;       // km/h
  pathPoints: [number, number][]; // [lat, lng]
}

export function useGeolocation(
  isRecording: boolean,
  isSimulated: boolean,
  simSpeedValue: number, // Live control for speed slider in simulation
  simHeading: string     // Heading selected in simulation
) {
  const [state, setState] = useState<GeolocationState>({
    speed: 0,
    distance: 0,
    heading: 'NE',
    gpsStatus: 'searching',
    avgSpeed: 0,
    maxSpeed: 0,
    pathPoints: []
  });

  const lastPositionRef = useRef<{ lat: number; lng: number; time: number } | null>(null);
  const speedHistoryRef = useRef<number[]>([]);
  const watchIdRef = useRef<number | null>(null);

  // Keep track of recording accumulators
  const speedSumRef = useRef<number>(0);
  const speedCountRef = useRef<number>(0);
  const maxSpeedRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const pathPointsRef = useRef<[number, number][]>([]);

  // Reset trip stats if recording toggles on
  useEffect(() => {
    if (isRecording) {
      speedSumRef.current = 0;
      speedCountRef.current = 0;
      maxSpeedRef.current = 0;
      distanceRef.current = 0;
      pathPointsRef.current = [];
      setState(prev => ({
        ...prev,
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        pathPoints: []
      }));
    }
  }, [isRecording]);

  // Handle Simulation Mode
  useEffect(() => {
    if (isSimulated) {
      // Clear live geolocation watcher if active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Simulation ticks (updates every 1 second)
      const interval = setInterval(() => {
        setState(prev => {
          const rawSpeed = simSpeedValue;
          
          // Apply simple moving average filter to smooth dial movement
          const smoothSpeed = rawSpeed; 
          
          const speedInMps = smoothSpeed / 3.6;
          const newDistance = isRecording 
            ? prev.distance + (speedInMps * 1) / 1000 // speed * 1s in km
            : prev.distance;

          // Stats calculation
          let nextAvg = prev.avgSpeed;
          let nextMax = prev.maxSpeed;
          if (isRecording) {
            speedSumRef.current += smoothSpeed;
            speedCountRef.current += 1;
            nextAvg = Math.round((speedSumRef.current / speedCountRef.current) * 10) / 10;
            if (smoothSpeed > maxSpeedRef.current) {
              maxSpeedRef.current = smoothSpeed;
            }
            nextMax = Math.round(maxSpeedRef.current * 10) / 10;
          }

          return {
            speed: Math.round(smoothSpeed),
            distance: Math.round(newDistance * 100) / 100,
            heading: simHeading || 'NE',
            gpsStatus: 'simulated',
            avgSpeed: nextAvg,
            maxSpeed: nextMax,
            pathPoints: prev.pathPoints
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulated, isRecording, simSpeedValue, simHeading]);

  // Handle Real GPS Mode
  useEffect(() => {
    if (isSimulated) return;

    if (!('geolocation' in navigator)) {
      setState(prev => ({ ...prev, gpsStatus: 'weak', speed: 0 }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const now = position.timestamp;
      let calculatedSpeed = 0;
      let calculatedHeadingDegrees = 45; // Default northeast

      // 1. Calculate Speed
      if (position.coords.speed !== null && position.coords.speed >= 0) {
        calculatedSpeed = position.coords.speed * 3.6; // Convert m/s to km/h
      } else if (lastPositionRef.current) {
        // Fallback: Compute speed from coordinates delta
        const timeDelta = (now - lastPositionRef.current.time) / 1000; // in seconds
        if (timeDelta > 0.5) {
          const distDelta = calculateDistance(
            lastPositionRef.current.lat,
            lastPositionRef.current.lng,
            lat,
            lng
          ); // in km
          calculatedSpeed = (distDelta / timeDelta) * 3600; // km/h
        }
      }

      // 2. Calculate Heading
      if (position.coords.heading !== null && !isNaN(position.coords.heading)) {
        calculatedHeadingDegrees = position.coords.heading;
      } else if (lastPositionRef.current) {
        calculatedHeadingDegrees = calculateHeading(
          lastPositionRef.current.lat,
          lastPositionRef.current.lng,
          lat,
          lng
        );
      }

      // 3. Speed Smoothing (5-point moving average filter)
      speedHistoryRef.current.push(calculatedSpeed);
      if (speedHistoryRef.current.length > 5) {
        speedHistoryRef.current.shift();
      }
      const sum = speedHistoryRef.current.reduce((a, b) => a + b, 0);
      const filteredSpeed = sum / speedHistoryRef.current.length;

      // 4. Distance Accumulation (Only if recording and moving)
      if (isRecording && lastPositionRef.current && filteredSpeed > 2) {
        const deltaD = calculateDistance(
          lastPositionRef.current.lat,
          lastPositionRef.current.lng,
          lat,
          lng
        );
        // Exclude huge GPS jumps (e.g. over 100 meters in 1 second is unrealistic for normal riding)
        if (deltaD < 0.1) {
          distanceRef.current += deltaD;
          pathPointsRef.current.push([lat, lng]);
        }
      }

      // 5. GPS Signal Quality check based on accuracy bounds
      let signalQuality: 'strong' | 'weak' | 'searching' = 'searching';
      if (position.coords.accuracy <= 15) {
        signalQuality = 'strong';
      } else if (position.coords.accuracy > 15) {
        signalQuality = 'weak';
      }

      // 6. Stats calculation
      let nextAvg = state.avgSpeed;
      let nextMax = state.maxSpeed;
      if (isRecording) {
        speedSumRef.current += filteredSpeed;
        speedCountRef.current += 1;
        nextAvg = Math.round((speedSumRef.current / speedCountRef.current) * 10) / 10;
        if (filteredSpeed > maxSpeedRef.current) {
          maxSpeedRef.current = filteredSpeed;
        }
        nextMax = Math.round(maxSpeedRef.current * 10) / 10;
      }

      lastPositionRef.current = { lat, lng, time: now };

      setState({
        speed: Math.round(filteredSpeed),
        distance: Math.round(distanceRef.current * 100) / 100,
        heading: getCardinalDirection(calculatedHeadingDegrees),
        gpsStatus: signalQuality,
        avgSpeed: nextAvg,
        maxSpeed: nextMax,
        pathPoints: pathPointsRef.current
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn('Geolocation watching error:', error.message);
      setState(prev => ({
        ...prev,
        gpsStatus: 'weak',
        speed: 0
      }));
    };

    // Watch position subscription
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isRecording, isSimulated]);

  return state;
}
