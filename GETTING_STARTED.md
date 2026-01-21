# Getting Started with Claude Code

## 🎯 What You Have Now

Your project is set up with:

✅ **React Native with Expo**

- TypeScript configuration
- Expo Router for navigation
- Basic app structure with checklist UI
- Routine tracking models and services
- All necessary Expo packages configured

✅ **Python Environment** (Optional, for tooling/CI)

- `uv` package manager configuration
- Virtual environment setup (`.venv/`)
- Development dependencies (testing, linting, formatting)
- CI/CD pipeline configuration

✅ **Development Tools**

- Setup scripts
- Makefile for common tasks
- ESLint and Prettier configuration
- Git ignore configuration
- Comprehensive documentation

## 📋 Immediate Next Steps

### 1. Run Initial Setup

```bash
cd /Users/aashishd/Desktop/morning-routine
./setup.sh
```

This installs all Node.js dependencies and optionally sets up Python tooling.

### 2. Start Development Server

```bash
npm start
```

This starts the Expo development server and shows a QR code.

### 3. Run on Your iPhone

1. Install **Expo Go** from the App Store
2. Scan the QR code from the terminal
3. App loads automatically on your device!

### 4. Verify Everything Works

```bash
# Test Node.js environment
node --version  # Should show v18+
npm --version   # Should show npm version

# Test Expo
npx expo --version  # Should show Expo version

# Test app runs
npm start  # Should start dev server
```

## 🏗️ Project Architecture

```
morning-routine/
├── app/                        # Expo Router app directory
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Home screen
├── components/                 # React components
│   └── RoutineChecklist.tsx   # Checklist UI component
├── services/                   # Business logic
│   └── RoutineManager.ts      # Routine state management
├── types/                      # TypeScript types
│   └── RoutineItem.ts         # Routine item definitions
├── assets/                     # Images, fonts, etc. (create as needed)
├── node_modules/              # Node.js dependencies
├── .venv/                      # Python virtual environment (optional)
├── package.json               # Node.js project config
├── app.json                   # Expo configuration
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler config
├── pyproject.toml             # Python project config (for tooling)
├── setup.sh                   # Initial setup script
├── Makefile                   # Development commands
└── Documentation/
    ├── README.md              # Project overview
    ├── SETUP.md               # Detailed setup guide
    ├── QUICKSTART.md          # Quick start guide
    └── GETTING_STARTED.md     # This file
```

## 🔧 Daily Development Workflow

1. **Start Development Server**

   ```bash
   npm start
   ```

2. **Make Changes**
   - Edit TypeScript/React files
   - Changes hot-reload automatically on your device
   - No need to rebuild or restart

3. **Run Quality Checks** (optional)

   ```bash
   make format      # Format code
   make lint        # Check for issues
   make type-check  # TypeScript type checking
   make test        # Run tests
   ```

4. **Test on Device**
   - App automatically reloads when you save files
   - Shake device to open Expo developer menu
   - Check Expo DevTools in browser for logs

## 🎨 Features to Implement

The app currently has a basic checklist. You need to implement:

1. **Pushup Tracking** (`services/PushupTracker.ts`)
   - Use `expo-sensors` (Accelerometer, Gyroscope)
   - Detect pushup motion patterns
   - Count to 20
   - Verify completion
   - Store data locally

2. **Photo Verification** (`services/PhotoVerification.ts`)
   - Use `expo-camera` and `expo-image-picker`
   - Photo capture for coffee/breakfast
   - Photo capture for water
   - Store photos locally with `expo-file-system`
   - Add timestamps

3. **Calendar & Email Integration** (`services/CalendarEmailService.ts`)
   - Use `expo-calendar` for calendar access
   - Use `expo-mail-composer` for email
   - Track completion status
   - Store locally

4. **Music Detection** (`services/MusicService.ts`)
   - Use `expo-av` or device audio APIs
   - Detect if music is playing
   - Verify during routine
   - May require native modules for full integration

5. **Device Locking** (`services/DeviceLockService.ts`)
   - In-app restrictions (lock app features)
   - Focus modes integration
   - May require custom native modules for full device locking
   - Emergency override (911, contacts, timeout)

## 📱 React Native/Expo Development Notes

### Required Permissions (Already Configured)

- **Camera**: For photo verification (`expo-camera`)
- **Photo Library**: To save verification photos (`expo-image-picker`)
- **Motion Sensors**: For pushup tracking (`expo-sensors`)
- **Calendar**: For calendar access (`expo-calendar`)
- **Media Library**: For music detection

### Privacy Considerations

- All data stored locally using `@react-native-async-storage/async-storage`
- Photos stored in app's document directory with `expo-file-system`
- No cloud sync (privacy-first)
- Routine data in AsyncStorage

### Device Locking Challenges

React Native/Expo has limitations for full device locking:

1. **In-App Restrictions**: Lock app features until routine complete
2. **Focus Modes**: Integrate with iOS Focus modes (user-controlled)
3. **Native Modules**: Custom native code for Screen Time API (requires Expo dev build)
4. **App Restrictions**: Limit access to other apps (may require native modules)

**Recommendation**: Start with in-app restrictions and Focus mode integration. Full device locking may require a development build with custom native modules.

### Expo Go vs Development Build

- **Expo Go**: Quick development, some limitations
- **Development Build**: Full native module support, required for advanced features like Screen Time API

## 🧪 Testing Strategy

1. **Unit Tests**: Test business logic (RoutineManager, etc.)
   - Use Jest (already configured)
   - Test services and utilities

2. **Component Tests**: Test React components
   - Use React Native Testing Library
   - Test UI interactions

3. **Integration Tests**: Test feature combinations
   - Test complete workflows
   - Test data persistence

4. **Device Testing**: Test on real device
   - Motion tracking requires physical device
   - Camera features need real device
   - Test all sensors and permissions

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Sensors](https://docs.expo.dev/versions/latest/sdk/sensors/)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Need Help?

- Check [SETUP.md](SETUP.md) for detailed setup
- Check [QUICKSTART.md](QUICKSTART.md) for quick reference
- Review [README.md](README.md) for project overview
- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)

## 🚀 Ready to Code!

You're all set! Start by:

1. Running `npm start` to start the dev server
2. Scanning the QR code with Expo Go on your iPhone
3. Seeing the basic checklist app running
4. Implementing features one at a time:
   - Start with pushup tracking
   - Add photo verification
   - Integrate calendar/email
   - Add music detection
   - Implement device locking

Happy coding! 🎉
