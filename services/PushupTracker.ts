import { Accelerometer, Gyroscope } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';

export enum PushupState {
  IDLE = 'idle',
  TRACKING = 'tracking',
  COMPLETED = 'completed',
}

export enum PushupPhase {
  NEUTRAL = 'neutral',
  DESCENDING = 'descending',
  BOTTOM = 'bottom',
  ASCENDING = 'ascending',
}

export interface PushupData {
  count: number;
  state: PushupState;
  phase: PushupPhase;
  targetCount: number;
}

export interface PushupTrackerConfig {
  targetCount?: number;
  descentThreshold?: number;
  ascentThreshold?: number;
  bottomThreshold?: number;
  updateInterval?: number;
}

type PushupUpdateCallback = (data: PushupData) => void;

const DEFAULT_CONFIG: Required<PushupTrackerConfig> = {
  targetCount: 20,
  descentThreshold: -0.5, // Accelerometer Z-axis threshold for going down
  ascentThreshold: 0.5, // Accelerometer Z-axis threshold for coming up
  bottomThreshold: -1.0, // Minimum Z value to consider "bottom" of pushup
  updateInterval: 100, // ms between sensor readings
};

export class PushupTracker {
  private config: Required<PushupTrackerConfig>;
  private count: number = 0;
  private state: PushupState = PushupState.IDLE;
  private phase: PushupPhase = PushupPhase.NEUTRAL;
  private accelerometerSubscription: Subscription | null = null;
  private gyroscopeSubscription: Subscription | null = null;
  private onUpdate: PushupUpdateCallback | null = null;

  // Motion tracking state
  private previousZ: number = 0;
  private bottomDetected: boolean = false;

  constructor(config: PushupTrackerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start tracking pushups
   */
  async start(onUpdate: PushupUpdateCallback): Promise<void> {
    if (this.state === PushupState.TRACKING) {
      throw new Error('Pushup tracking is already in progress');
    }

    this.onUpdate = onUpdate;
    this.count = 0;
    this.state = PushupState.TRACKING;
    this.phase = PushupPhase.NEUTRAL;
    this.bottomDetected = false;

    // Set update intervals
    Accelerometer.setUpdateInterval(this.config.updateInterval);
    Gyroscope.setUpdateInterval(this.config.updateInterval);

    // Subscribe to accelerometer
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.processAccelerometerData(data.z);
    });

    // Subscribe to gyroscope (for additional validation)
    this.gyroscopeSubscription = Gyroscope.addListener(() => {
      // Gyroscope data can be used for additional validation
      // Currently using accelerometer as primary signal
    });

    this.notifyUpdate();
  }

  /**
   * Stop tracking pushups
   */
  stop(): void {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    this.state = PushupState.IDLE;
    this.notifyUpdate();
  }

  /**
   * Reset the tracker
   */
  reset(): void {
    this.stop();
    this.count = 0;
    this.state = PushupState.IDLE;
    this.phase = PushupPhase.NEUTRAL;
    this.bottomDetected = false;
    this.notifyUpdate();
  }

  /**
   * Process accelerometer data to detect pushup motion
   */
  private processAccelerometerData(z: number): void {
    if (this.state !== PushupState.TRACKING) {
      return;
    }

    const deltaZ = z - this.previousZ;
    this.previousZ = z;

    // State machine for pushup detection
    switch (this.phase) {
      case PushupPhase.NEUTRAL:
        // Looking for descent
        if (deltaZ < this.config.descentThreshold) {
          this.phase = PushupPhase.DESCENDING;
          this.bottomDetected = false;
          this.notifyUpdate();
        }
        break;

      case PushupPhase.DESCENDING:
        // Check if we've reached the bottom
        if (z < this.config.bottomThreshold) {
          this.phase = PushupPhase.BOTTOM;
          this.bottomDetected = true;
          this.notifyUpdate();
        }
        // If we start ascending without reaching bottom, reset
        else if (deltaZ > this.config.ascentThreshold) {
          this.phase = PushupPhase.NEUTRAL;
          this.notifyUpdate();
        }
        break;

      case PushupPhase.BOTTOM:
        // Looking for ascent
        if (deltaZ > this.config.ascentThreshold) {
          this.phase = PushupPhase.ASCENDING;
          this.notifyUpdate();
        }
        break;

      case PushupPhase.ASCENDING:
        // Check if we've completed the pushup (returned to neutral)
        if (z > -0.2 && z < 0.2 && this.bottomDetected) {
          this.count++;
          this.phase = PushupPhase.NEUTRAL;
          this.bottomDetected = false;

          // Check if target reached
          if (this.count >= this.config.targetCount) {
            this.state = PushupState.COMPLETED;
            // Stop listening to sensors but keep state as COMPLETED
            if (this.accelerometerSubscription) {
              this.accelerometerSubscription.remove();
              this.accelerometerSubscription = null;
            }
            if (this.gyroscopeSubscription) {
              this.gyroscopeSubscription.remove();
              this.gyroscopeSubscription = null;
            }
          }

          this.notifyUpdate();
        }
        // If we start descending again (double bounce), count it
        else if (deltaZ < this.config.descentThreshold && this.bottomDetected) {
          this.count++;
          this.phase = PushupPhase.DESCENDING;
          this.bottomDetected = false;

          if (this.count >= this.config.targetCount) {
            this.state = PushupState.COMPLETED;
            // Stop listening to sensors but keep state as COMPLETED
            if (this.accelerometerSubscription) {
              this.accelerometerSubscription.remove();
              this.accelerometerSubscription = null;
            }
            if (this.gyroscopeSubscription) {
              this.gyroscopeSubscription.remove();
              this.gyroscopeSubscription = null;
            }
          }

          this.notifyUpdate();
        }
        break;
    }
  }

  /**
   * Notify update callback with current data
   */
  private notifyUpdate(): void {
    if (this.onUpdate) {
      this.onUpdate(this.getData());
    }
  }

  /**
   * Get current pushup tracking data
   */
  getData(): PushupData {
    return {
      count: this.count,
      state: this.state,
      phase: this.phase,
      targetCount: this.config.targetCount,
    };
  }

  /**
   * Get current count
   */
  getCount(): number {
    return this.count;
  }

  /**
   * Get current state
   */
  getState(): PushupState {
    return this.state;
  }

  /**
   * Check if tracking is complete
   */
  isComplete(): boolean {
    return this.state === PushupState.COMPLETED;
  }

  /**
   * Check if sensors are available
   */
  static async checkAvailability(): Promise<{
    accelerometer: boolean;
    gyroscope: boolean;
  }> {
    const accelerometerAvailable = await Accelerometer.isAvailableAsync();
    const gyroscopeAvailable = await Gyroscope.isAvailableAsync();

    return {
      accelerometer: accelerometerAvailable,
      gyroscope: gyroscopeAvailable,
    };
  }

  /**
   * Request permissions for sensors
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Accelerometer.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting sensor permissions:', error);
      return false;
    }
  }
}
