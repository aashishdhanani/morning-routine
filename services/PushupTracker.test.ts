import { PushupTracker, PushupState, PushupPhase } from './PushupTracker';
import { Accelerometer, Gyroscope } from 'expo-sensors';

// Mock expo-sensors
jest.mock('expo-sensors', () => ({
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
    isAvailableAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
  },
  Gyroscope: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn(),
    isAvailableAsync: jest.fn(),
  },
}));

describe('PushupTracker', () => {
  let tracker: PushupTracker;
  let accelerometerCallback: ((data: { x: number; y: number; z: number }) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    tracker = new PushupTracker({ targetCount: 3, updateInterval: 50 });

    // Capture the accelerometer callback
    (Accelerometer.addListener as jest.Mock).mockImplementation((callback) => {
      accelerometerCallback = callback;
      return { remove: jest.fn() };
    });

    (Gyroscope.addListener as jest.Mock).mockImplementation(() => {
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    tracker.stop();
    accelerometerCallback = null;
  });

  describe('Initialization', () => {
    test('creates tracker with default config', () => {
      const defaultTracker = new PushupTracker();
      expect(defaultTracker.getCount()).toBe(0);
      expect(defaultTracker.getState()).toBe(PushupState.IDLE);
    });

    test('creates tracker with custom target count', () => {
      const customTracker = new PushupTracker({ targetCount: 10 });
      const data = customTracker.getData();
      expect(data.targetCount).toBe(10);
    });
  });

  describe('Starting and Stopping', () => {
    test('start sets state to TRACKING', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      expect(tracker.getState()).toBe(PushupState.TRACKING);
      expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(50);
      expect(Accelerometer.addListener).toHaveBeenCalled();
      expect(onUpdate).toHaveBeenCalled();
    });

    test('start throws error if already tracking', async () => {
      await tracker.start(jest.fn());
      await expect(tracker.start(jest.fn())).rejects.toThrow(
        'Pushup tracking is already in progress'
      );
    });

    test('stop removes listeners and sets state to IDLE', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      tracker.stop();

      expect(tracker.getState()).toBe(PushupState.IDLE);
    });

    test('reset clears count and state', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      // Simulate some pushups
      if (accelerometerCallback) {
        accelerometerCallback({ x: 0, y: 0, z: -0.6 });
        accelerometerCallback({ x: 0, y: 0, z: -1.2 });
        accelerometerCallback({ x: 0, y: 0, z: 0.6 });
        accelerometerCallback({ x: 0, y: 0, z: 0.0 });
      }

      tracker.reset();

      expect(tracker.getCount()).toBe(0);
      expect(tracker.getState()).toBe(PushupState.IDLE);
    });
  });

  describe('Motion Detection', () => {
    test('detects complete pushup sequence', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      expect(tracker.getData().phase).toBe(PushupPhase.NEUTRAL);

      // Simulate descent
      if (accelerometerCallback) {
        accelerometerCallback({ x: 0, y: 0, z: -0.6 }); // Start descending
        expect(tracker.getData().phase).toBe(PushupPhase.DESCENDING);

        accelerometerCallback({ x: 0, y: 0, z: -1.2 }); // At bottom
        expect(tracker.getData().phase).toBe(PushupPhase.BOTTOM);

        accelerometerCallback({ x: 0, y: 0, z: 0.6 }); // Start ascending
        expect(tracker.getData().phase).toBe(PushupPhase.ASCENDING);

        accelerometerCallback({ x: 0, y: 0, z: 0.0 }); // Back to neutral
        expect(tracker.getCount()).toBe(1);
        expect(tracker.getData().phase).toBe(PushupPhase.NEUTRAL);
      }
    });

    test('increments count for each completed pushup', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      // Simulate 3 pushups
      for (let i = 0; i < 3; i++) {
        if (accelerometerCallback) {
          accelerometerCallback({ x: 0, y: 0, z: -0.6 });
          accelerometerCallback({ x: 0, y: 0, z: -1.2 });
          accelerometerCallback({ x: 0, y: 0, z: 0.6 });
          accelerometerCallback({ x: 0, y: 0, z: 0.0 });
        }
      }

      expect(tracker.getCount()).toBe(3);
    });

    test('completes tracking when target reached', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      // Simulate 3 pushups (target is 3)
      for (let i = 0; i < 3; i++) {
        if (accelerometerCallback) {
          accelerometerCallback({ x: 0, y: 0, z: -0.6 });
          accelerometerCallback({ x: 0, y: 0, z: -1.2 });
          accelerometerCallback({ x: 0, y: 0, z: 0.6 });
          accelerometerCallback({ x: 0, y: 0, z: 0.0 });
        }
      }

      expect(tracker.getState()).toBe(PushupState.COMPLETED);
      expect(tracker.isComplete()).toBe(true);
    });

    test('does not count incomplete pushups', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      // Simulate incomplete pushup (no bottom reached)
      if (accelerometerCallback) {
        accelerometerCallback({ x: 0, y: 0, z: -0.6 }); // Start descending
        accelerometerCallback({ x: 0, y: 0, z: 0.6 }); // Go back up without reaching bottom
        accelerometerCallback({ x: 0, y: 0, z: 0.0 });
      }

      expect(tracker.getCount()).toBe(0);
    });

    test('calls onUpdate callback on state changes', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      const initialCallCount = onUpdate.mock.calls.length;

      // Simulate motion
      if (accelerometerCallback) {
        accelerometerCallback({ x: 0, y: 0, z: -0.6 });
      }

      expect(onUpdate.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe('Sensor Availability', () => {
    test('checkAvailability returns sensor status', async () => {
      (Accelerometer.isAvailableAsync as jest.Mock).mockResolvedValue(true);
      (Gyroscope.isAvailableAsync as jest.Mock).mockResolvedValue(true);

      const availability = await PushupTracker.checkAvailability();

      expect(availability.accelerometer).toBe(true);
      expect(availability.gyroscope).toBe(true);
    });

    test('requestPermissions returns permission status', async () => {
      (Accelerometer.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const hasPermission = await PushupTracker.requestPermissions();

      expect(hasPermission).toBe(true);
    });

    test('requestPermissions handles errors', async () => {
      (Accelerometer.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const hasPermission = await PushupTracker.requestPermissions();

      expect(hasPermission).toBe(false);
    });
  });

  describe('getData', () => {
    test('returns current tracking data', async () => {
      const onUpdate = jest.fn();
      await tracker.start(onUpdate);

      const data = tracker.getData();

      expect(data).toEqual({
        count: 0,
        state: PushupState.TRACKING,
        phase: PushupPhase.NEUTRAL,
        targetCount: 3,
      });
    });
  });
});
