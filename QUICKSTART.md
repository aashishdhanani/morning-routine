# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Prerequisites

1. **Install Node.js** (if not already installed):

   ```bash
   # Using Homebrew (macOS)
   brew install node

   # Or download from nodejs.org
   # Visit https://nodejs.org/ and download LTS version
   ```

2. **Install Expo Go** on your iPhone:
   - Download from the [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Run Setup Script

```bash
cd /Users/aashishd/Desktop/morning-routine
./setup.sh
```

This installs all Node.js dependencies and sets up the project.

### Step 3: Start Development Server

```bash
npm start
```

This will:

- Start the Expo development server
- Display a QR code in your terminal
- Open Expo DevTools in your browser

### Step 4: Run on Your iPhone

1. Open the **Expo Go** app on your iPhone
2. Scan the QR code displayed in your terminal
3. The app will load on your device automatically!

**Alternative**: If QR code doesn't work:

- Make sure your phone and computer are on the same WiFi network
- Shake your device to open Expo menu
- Select "Enter URL manually"
- Enter the URL shown in terminal (usually `exp://...`)

## ✅ Verification Checklist

- [ ] Node.js is installed (`node --version` shows v18+)
- [ ] npm is installed (`npm --version`)
- [ ] Dependencies installed (`node_modules/` folder exists)
- [ ] Expo Go app installed on iPhone
- [ ] Development server starts (`npm start`)
- [ ] App loads on iPhone via Expo Go

## 🐛 Troubleshooting

### "node: command not found"

```bash
# Install Node.js
brew install node
# Or download from nodejs.org
```

### "npm install fails"

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "Expo Go can't connect"

- Ensure phone and computer are on the same WiFi
- Try tunnel mode: `npm start -- --tunnel`
- Check firewall settings
- Restart Expo Go app

### "Metro bundler errors"

```bash
# Clear Metro cache
npm start -- --clear
```

### "Module not found errors"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📚 Next Steps

1. Read [SETUP.md](SETUP.md) for detailed setup information
2. Review the project structure in [README.md](README.md)
3. Start implementing features:
   - Pushup tracking with `expo-sensors`
   - Photo capture and verification with `expo-camera`
   - Calendar/Email integration
   - Music detection
   - Device locking mechanism

## 💡 Development Tips

- **Hot Reload**: Changes automatically reload on your device
- **Shake Device**: Opens Expo developer menu
- **Use `make` commands**:
  - `make start` - Start development server
  - `make test` - Run tests
  - `make lint` - Check code quality
  - `make format` - Format code
- **Test on real device**: Motion tracking works best on physical devices
- **Expo DevTools**: Opens automatically in browser for debugging

## 🎯 What's Next?

The app currently has a basic checklist. You'll need to implement:

1. **Pushup Tracking** - Use `expo-sensors` for motion detection
2. **Photo Verification** - Use `expo-camera` and `expo-image-picker`
3. **Calendar & Email** - Use `expo-calendar` and `expo-mail-composer`
4. **Music Detection** - Use `expo-av` or device audio APIs
5. **Device Locking** - Implement in-app restrictions or native modules

Happy coding! 🎉
