import Dexie, { type Table } from 'dexie';

export interface Ride {
  id?: number;
  startTime: number;      // Epoch timestamp (ms)
  endTime: number;        // Epoch timestamp (ms)
  distance: number;       // Distance in km
  duration: number;       // Duration in ms
  avgSpeed: number;       // Average Speed in km/h
  maxSpeed: number;       // Maximum Speed in km/h
  fuelSaved: number;      // Estimated fuel saved in Litres
  costSaved: number;      // Estimated fuel cost saved in Rupees (or local currency)
  storySummary: string;   // USP: "You completed a 12.45 km trip..."
  pathPoints?: [number, number][]; // Array of [latitude, longitude] pairs for trip mapping
}

export interface Setting {
  key: string;
  value: any;
}

export class ZenRideDatabase extends Dexie {
  rides!: Table<Ride>;
  settings!: Table<Setting>;

  constructor() {
    super('ZenRideDatabase');
    this.version(1).stores({
      rides: '++id, startTime, endTime, distance, avgSpeed, maxSpeed',
      settings: 'key'
    });
  }
}

export const db = new ZenRideDatabase();

// --- Database Helper Functions ---

// Fetch app setting with a fallback
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const record = await db.settings.get(key);
    return record ? (record.value as T) : defaultValue;
  } catch (error) {
    console.error(`Failed to fetch setting ${key}:`, error);
    return defaultValue;
  }
}

// Update app setting
export async function setSetting<T>(key: string, value: T): Promise<void> {
  try {
    await db.settings.put({ key, value });
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
  }
}

// Delete a ride
export async function deleteRide(id: number): Promise<void> {
  try {
    await db.rides.delete(id);
  } catch (error) {
    console.error(`Failed to delete ride ${id}:`, error);
  }
}

// Initialize default settings if not exists
export async function initializeDefaultSettings(): Promise<void> {
  const odo = await db.settings.get('odometer');
  if (odo === undefined) {
    await setSetting('odometer', 12458.0); // Pre-fill default from sample mockup
  }
  const fuel = await db.settings.get('fuelLevel');
  if (fuel === undefined) {
    await setSetting('fuelLevel', 75); // 75% full
  }
  const fuelPrice = await db.settings.get('fuelPrice');
  if (fuelPrice === undefined) {
    await setSetting('fuelPrice', 104.5); // Average Indian Fuel Price per litre (₹)
  }
  const alertSpeed = await db.settings.get('alertSpeed');
  if (alertSpeed === undefined) {
    await setSetting('alertSpeed', 80); // Speedometer overspeed alert threshold (80 km/h)
  }
}
