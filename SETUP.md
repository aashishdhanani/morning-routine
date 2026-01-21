# Setup Guide for Morning Routine React Native App

## Prerequisites

1. **Node.js** (v18 or higher)
   - Install from [nodejs.org](https://nodejs.org/) or use Homebrew:

   ```bash
   brew install node
   ```

2. **npm** (comes with Node.js)

3. **Expo Go App** (for testing on your iPhone)
   - Download from the [App Store](https://apps.apple.com/app/expo-go/id982107779)

4. **uv** (optional, for Python tooling/CI)
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

## Initial Setup

### 1. Run the setup script

```bash
chmod +x setup.sh
./setup.sh
```

This will:

- Check Node.js and npm installation
- Install all Node.js dependencies
- Install Expo CLI globally
- Optionally set up Python virtual environment for tooling

### 2. Start the development server

```bash
npm start
```

This will:

- Start the Expo development server
- Display a QR code in your terminal
- Open Expo DevTools in your browser

### 3. Run on your iPhone

1. Open the **Expo Go** app on your iPhone
2. Scan the QR code displayed in your terminal
3. The app will load on your device

**Alternative**: If you're on the same WiFi network, you can also:

- Shake your device to open the Expo menu
- Select "Enter URL manually"
- Enter the URL shown in the terminal (usually `exp://...`)

## Development Workflow

### Daily Development

1. Start the development server:

   ```bash
   npm start
   ```

2. Make changes to your code:
   - Edit files in `app/`, `components/`, `services/`, etc.
   - Changes will hot-reload automatically on your device

3. Run tests:

   ```bash
   npm test
   ```

4. Format code:

   ```bash
   npm run format
   ```

5. Check linting:

   ```bash
   npm run lint
   ```

6. Type checking:
   ```bash
   npm run type-check
   ```

## Project Structure

```
morning-routine/
├── app/                        # Expo Router app directory
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Home screen
├── components/                 # React components
│   └── RoutineChecklist.tsx
├── services/                   # Business logic
│   └── RoutineManager.ts
├── types/                      # TypeScript types
│   └── RoutineItem.ts
├── assets/                     # Images, fonts, etc.
├── node_modules/               # Node.js dependencies
├── .venv/                      # Python virtual environment (optional)
├── package.json               # Node.js project config
├── app.json                   # Expo configuration
├── tsconfig.json              # TypeScript config
├── babel.config.js            # Babel config
├── metro.config.js            # Metro bundler config
├── pyproject.toml             # Python project config (for tooling)
├── setup.sh                   # Setup script
└── Makefile                   # Development commands
```

## Key Features to Implement

1. **Pushup Tracking**
   - Use `expo-sensors` for device motion tracking
   - Count and verify 20 pushups completed
   - Store completion data locally

2. **Photo Verification**
   - Use `expo-camera` and `expo-image-picker`
   - Require photos for: coffee/breakfast, water glass
   - Store photos locally with timestamps using `expo-file-system`

3. **Calendar & Email Check**
   - Use `expo-calendar` for calendar integration
   - Use `expo-mail-composer` for email
   - Track completion status

4. **Music Playing**
   - Use `expo-av` or device audio APIs
   - Verify music is playing
   - Integration with Apple Music/Spotify (may require native modules)

5. **Device Locking**
   - Use React Native device restrictions
   - Lock phone until routine is complete
   - Include emergency failsafe (e.g., emergency contacts, timeout)
   - Note: Full device locking may require native modules or Screen Time API

## Important Notes

- **Phone Locking**: React Native/Expo has limitations for full device locking. Options:
  - Use in-app restrictions (lock app features)
  - Use Focus modes (iOS) or Do Not Disturb
  - Native modules for Screen Time API (requires custom development)
  - Emergency override must be implemented (e.g., 911, emergency contacts)

- **Pushup Tracking**:
  - Use `expo-sensors` Accelerometer and Gyroscope
  - Implement motion pattern detection
  - May require ML models for accurate counting

- **Privacy**:
  - All data (photos, tracking) stored locally using `@react-native-async-storage/async-storage`
  - Photos stored in app's document directory
  - No cloud sync (privacy-first)

## Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Start for iOS simulator (requires Xcode)
- `npm run android` - Start for Android emulator
- `npm run web` - Start for web browser
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Troubleshooting

### Node.js not found

```bash
# Install Node.js
brew install node
# Or download from nodejs.org
```

### npm install fails

```bash
# Clear npm cache
npm cache clean --force
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Expo Go can't connect

- Make sure your phone and computer are on the same WiFi network
- Try using tunnel mode: `npm start -- --tunnel`
- Check firewall settings

### Metro bundler errors

```bash
# Clear Metro cache
npm start -- --clear
# Or
npx expo start --clear
```

### TypeScript errors

```bash
# Run type checking
npm run type-check
# Fix issues or check tsconfig.json
```

### Python tooling issues (optional)

```bash
# If using Python tooling
source .venv/bin/activate
uv pip install -e ".[dev]"
```

## Building for Production

### Development Build (Recommended)

1. Install EAS CLI:

   ```bash
   npm install -g eas-cli
   ```

2. Configure EAS:

   ```bash
   eas build:configure
   ```

3. Build for iOS:
   ```bash
   eas build --platform ios
   ```

### Expo Go Limitations

Expo Go has some limitations. For full features (especially device locking), you'll need a development build or standalone app.

## Next Steps

1. Implement pushup tracking with `expo-sensors`
2. Add camera integration for photo verification
3. Implement calendar and email checking
4. Add music detection
5. Implement device locking mechanism
6. Add local data persistence
7. Create tests for all features
