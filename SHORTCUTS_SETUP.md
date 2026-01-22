# iOS Shortcuts Setup Guide

This guide explains how to set up iOS Shortcuts automation to automatically open the Morning Routine app when you unlock your iPhone in the morning.

## Overview

The Morning Routine app uses iOS Shortcuts automation to launch the app when you unlock your device during your configured morning hours. Once the app opens, it will automatically lock if you're within your morning routine window and haven't completed your routine yet.

## Prerequisites

- iPhone running iOS 13 or later
- Shortcuts app installed (comes pre-installed on iOS)
- Morning Routine app installed on your device

## Setup Instructions

### Method 1: Time of Day Automation (Recommended)

This method opens the app at a specific time each morning.

1. **Open the Shortcuts app** on your iPhone

2. **Navigate to Automation**
   - Tap the "Automation" tab at the bottom
   - Tap the "+" button in the top right
   - Select "Create Personal Automation"

3. **Choose Trigger**
   - Select "Time of Day"
   - Set the time to your earliest wake-up time (e.g., 7:00 AM)
   - Select "Daily" or choose specific days of the week
   - Tap "Next"

4. **Add Action**
   - Tap "Add Action"
   - Search for "Open App"
   - Select "Open App"
   - Choose "Morning Routine" from the list

5. **Configure Automation**
   - **Important**: Toggle OFF "Ask Before Running"
     - This allows the automation to run automatically
     - The app will open automatically at the specified time
   - Tap "Done"

### Method 2: Wake Up Automation (Requires Apple Watch)

If you have an Apple Watch and use the Sleep focus mode:

1. **Open the Shortcuts app**

2. **Create Personal Automation**
   - Tap "Automation" → "+" → "Create Personal Automation"

3. **Choose Trigger**
   - Scroll down and select "Wake Up"
   - This triggers when your morning alarm goes off

4. **Add Action**
   - Tap "Add Action"
   - Search for "Open App"
   - Select "Morning Routine"
   - Tap "Next"

5. **Configure**
   - Toggle OFF "Ask Before Running"
   - Tap "Done"

### Method 3: Manual Widget (Backup)

If automation doesn't work for your workflow:

1. **Add Widget to Home Screen**
   - Long-press on your home screen
   - Tap the "+" button in the top left
   - Search for "Morning Routine"
   - Add the widget to your home screen

2. **Morning Routine**
   - When you wake up, simply tap the widget to launch the app
   - The app will lock if you're within your morning window

## How It Works

Once set up, here's what happens:

1. **Automation Triggers**
   - Your iPhone opens the Morning Routine app at the configured time
   - OR you manually open the app using the widget/icon

2. **App Checks Lock Status**
   - The app checks if current time is within your morning routine window (configured in Settings)
   - It checks if you've already completed today's routine

3. **Lock Activates**
   - If within morning hours AND routine not complete → App locks
   - Full-screen lock prevents using other features until routine is done
   - Emergency unlock available after 10 minutes (configurable in Settings)

4. **Complete Routine**
   - Complete all routine items (pushups, breakfast, water, calendar, music)
   - App automatically unlocks when all items are checked off
   - Completion is recorded to your history and streak

## Customizing Your Schedule

The app supports different schedules for each day of the week:

1. Open the app
2. Tap the ⚙️ Settings icon in the top right
3. Configure each day:
   - Toggle routine on/off for specific days
   - Set custom start and end times
   - Example: Disable Saturday for sleeping in, or set earlier times on workout days

## Troubleshooting

### Automation Doesn't Run

**Problem**: The Shortcuts automation doesn't seem to open the app.

**Solutions**:

- Make sure "Ask Before Running" is toggled OFF
- Check that the automation is enabled (toggle switch is green)
- Verify the app name is correctly set to "Morning Routine"
- Try restarting your iPhone

### App Doesn't Lock

**Problem**: App opens but doesn't lock automatically.

**Solutions**:

- Check Settings → verify "Enable App Locking" is ON
- Verify current time is within your configured morning window
- Check that today's routine is enabled in Settings
- Make sure you haven't already completed today's routine

### Emergency Unlock Not Appearing

**Problem**: Can't access emergency unlock button.

**Solutions**:

- Emergency unlock appears after 10 minutes by default
- Check Settings → adjust "Emergency Unlock" delay if needed
- Wait for the countdown timer to reach 0:00

### Automation Runs But App Closes

**Problem**: App opens briefly then closes.

**Solutions**:

- This is normal iOS behavior if automation runs while phone is locked
- Unlock your phone when the automation triggers
- The app will stay open once you're on the home/lock screen

## Tips for Success

1. **Set Consistent Wake Time**
   - Use the same automation time for weekdays
   - Adjust per-day schedules in Settings for weekends

2. **Place Phone on Charger**
   - Put your phone on the charger before bed
   - This ensures the automation has power to run

3. **Don't Snooze**
   - The automation triggers at your set time
   - If you snooze and open phone later, the lock still activates if within the window

4. **Test Your Setup**
   - Manually run the automation to test (Edit → tap the play button)
   - Or open the app manually during your morning window to see the lock

5. **Use Emergency Unlock Wisely**
   - Emergency unlock is for true emergencies only
   - Using it will break your streak
   - Consider if you really need to unlock or can complete the routine

## Advanced: Multiple Automations

You can create multiple automations for different scenarios:

1. **Weekday Automation** (Monday-Friday, 7:00 AM)
2. **Weekend Automation** (Saturday-Sunday, 8:30 AM)
3. **Backup Automation** (9:00 AM if you're still in bed)

Each automation follows the same setup steps but with different times/days.

## Support

If you encounter issues:

1. Check that all automations are enabled
2. Verify app permissions in Settings → Morning Routine
3. Restart your iPhone
4. Reinstall the Morning Routine app if problems persist

## Privacy Note

All automation setup stays on your device. The Morning Routine app doesn't require internet access, and all data (history, settings, completion records) is stored locally on your iPhone.
