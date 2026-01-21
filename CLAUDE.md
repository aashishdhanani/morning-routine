# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Your Role

You are the primary engineer for this repository. You have full autonomy to:

- Make architectural decisions
- Choose libraries and frameworks
- Implement features
- Write tests
- Create CI/CD pipelines
- Refactor code
- Commit changes directly to the repository

## Project Overview

**Morning Routine Mobile App** - A React Native (Expo) mobile application that tracks and enforces morning routine completion, including pushup tracking, photo verification, and device locking until the routine is complete. The app is designed to run on iOS with privacy-first principles (all data stored locally on device).

### Core Features to Implement

1. **Pushup Tracking** - Monitor and verify 20 pushups using device sensors (`expo-sensors`)
2. **Photo Verification** - Require photos for coffee/breakfast and water (`expo-camera`, `expo-image-picker`)
3. **Calendar & Email Check** - Track completion of calendar review and emails (`expo-calendar`, `expo-mail-composer`)
4. **Music Verification** - Confirm music is playing during routine (`expo-av`)
5. **Device Locking** - Lock phone until routine complete (with emergency failsafe)

### Tech Stack

- React Native with Expo (~51.0.0)
- TypeScript (strict mode)
- Expo Router for file-based navigation
- Python/uv for development tooling (optional)

## Development Principles

### Must Follow

- ✅ Write tests for all features (Jest + React Native Testing Library)
- ✅ Keep CI green at all times
- ✅ Follow clean architecture patterns (types → services → components → app)
- ✅ Store all data locally (privacy-first, no cloud sync)
- ✅ Prefer clarity over cleverness
- ✅ Plan before implementing
- ✅ Keep PRs small and reviewable

### Code Quality Standards

- Use TypeScript strictly (no `any` types)
- Follow ESLint and Prettier rules
- Write self-documenting code
- Keep functions small and focused
- Use meaningful variable and function names

## Development Commands

### Essential Commands

```bash
npm start              # Start Expo development server (primary development command)
npm test               # Run Jest tests
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run type-check     # Run TypeScript type checking
```

### Platform-Specific

```bash
npm run ios            # Start for iOS simulator (requires Xcode)
npm run android        # Start for Android emulator
npm run web            # Start for web browser
```

### Make Commands (Alternative)

```bash
make start             # Start Expo dev server
make test              # Run tests
make lint              # Run linters
make format            # Format code
make type-check        # TypeScript type checking
make clean             # Clean build artifacts and caches
```

### Testing Individual Features

When testing specific features on a real device (required for motion/camera features):

1. Start development server with `npm start`
2. Scan QR code with Expo Go app on iPhone
3. Changes hot-reload automatically
4. Shake device to open Expo developer menu for debugging

### Running Specific Tests

```bash
npm test                           # Run all tests
npm test -- --watch                # Watch mode
npm test -- RoutineManager         # Run specific test file
npm test -- --coverage             # Generate coverage report
```

## Architecture

### Core Architecture Pattern

The app follows a clean 4-layer separation of concerns:

1. **Types Layer** (`types/`): Defines domain models and data structures
   - `RoutineItem.ts`: Enum of routine items and their metadata (description, verification requirements)

2. **Services Layer** (`services/`): Business logic and state management
   - `RoutineManager.ts`: Manages routine state (completion tracking, progress calculations)
   - Future services to implement: PushupTracker, PhotoVerification, CalendarEmailService, MusicService, DeviceLockService

3. **Components Layer** (`components/`): Presentational React components
   - `RoutineChecklist.tsx`: Main UI component for displaying and interacting with routine items

4. **App Layer** (`app/`): Expo Router file-based routing
   - `_layout.tsx`: Root layout and navigation configuration
   - `index.tsx`: Home screen that composes RoutineManager and RoutineChecklist

### Key Architectural Decisions

**State Management**: Currently using local component state with `RoutineManager` class instances. When implementing persistence:

- Use `@react-native-async-storage/async-storage` for persisting completion state
- Store photos in app's document directory using `expo-file-system`
- All data stays local (privacy-first requirement)

**Verification System**: Items are marked with `requiresVerification: boolean` in `ROUTINE_ITEM_INFO`. Items requiring verification:

- Pushups: Motion sensor tracking via `expo-sensors`
- Coffee/Breakfast: Photo capture via `expo-camera`
- Water: Photo capture via `expo-camera`

**Navigation**: Uses Expo Router (file-based routing). Add new screens by creating files in `app/` directory.

## Workflow

### Before Making Changes

1. **Read the repository state** - Understand current codebase
2. **Plan your approach** - Think through the solution
3. **Check existing tests** - Understand test patterns
4. **Propose if major** - For architectural changes, explain your approach

### Implementation Process

1. Write tests first (TDD when possible)
2. Implement feature incrementally
3. Run tests: `npm test`
4. Check types: `npm run type-check`
5. Lint code: `npm run lint`
6. Format code: `npm run format`
7. Commit with clear messages

### Git Workflow

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, etc.
- One logical change per commit
- Never commit broken code
- Write clear, descriptive commit messages
- Include co-author: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

**Example Commit Messages:**

```
feat: add pushup tracking with motion sensors
fix: resolve camera permission issue on iOS
test: add unit tests for RoutineManager
refactor: extract photo verification service
docs: update setup instructions for Expo
```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (if needed)
- Feature branches: `feature/description` (optional, use for major changes)

## Implementation Priorities

### Phase 1: Core Functionality

1. ✅ Basic checklist UI (DONE)
2. Pushup tracking with `expo-sensors`
3. Photo capture and verification
4. Local data persistence with AsyncStorage

### Phase 2: Integrations

1. Calendar integration (`expo-calendar`)
2. Email integration (`expo-mail-composer`)
3. Music detection (`expo-av`)

### Phase 3: Advanced Features

1. Device locking mechanism
2. Emergency failsafe
3. Routine history/analytics
4. Notifications/reminders

## Implementation Guide

### When Adding New Routine Items

1. Add enum value to `RoutineItem` in `types/RoutineItem.ts`
2. Add metadata to `ROUTINE_ITEM_INFO` with description and verification requirements
3. If verification required, implement corresponding service in `services/`

### When Implementing Sensor-Based Features

- **Pushup Tracking**: Use `expo-sensors` (Accelerometer, Gyroscope) to detect motion patterns. Requires physical device for testing.
- **Motion permissions**: Already configured in `app.json` under iOS `infoPlist`

### When Implementing Photo Verification

- **Camera Access**: Use `expo-camera` for live camera or `expo-image-picker` for photo library
- **Storage**: Save photos to app's local directory, include timestamps in metadata
- **Permissions**: Already configured in `app.json` (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`)

### When Implementing Device Locking

React Native/Expo has limitations for full device locking. Approach:

1. Start with in-app restrictions (lock app features until routine complete)
2. Consider iOS Focus mode integration (user-controlled)
3. Full device locking requires custom native modules and development build (not Expo Go)
4. Must include emergency failsafe (e.g., 911 access, timeout override)

## Testing Requirements

### Test Strategy

- **Unit Tests**: Test services and business logic (RoutineManager, verification services)
- **Component Tests**: Use `@testing-library/react-native` for UI components
- **Integration Tests**: Test complete workflows (routine completion flow, data persistence)
- **Device Testing**: Motion tracking and camera features MUST be tested on physical device
- **Test coverage target**: 80%+

### Test File Location

- Place test files adjacent to source files: `RoutineManager.test.ts`
- Or in `__tests__/` directories within each module

## CI/CD Configuration

- **CI Pipeline** (`.github/workflows/ci.yml`): Runs type-check, lint, format check, and tests on push/PR
- **Python tooling**: Optional, used for auxiliary development tools (configured in `pyproject.toml`)
- All CI checks must pass before merging

## Privacy & Security Constraints

### Privacy-First Requirements

- All data must be stored locally (AsyncStorage, expo-file-system)
- No cloud sync or external APIs
- Photos stored in app's document directory
- No tracking or analytics

### Security Considerations

- Don't store sensitive data in AsyncStorage without encryption (though this app only stores routine completion state)
- Implement emergency override for device locking (timeout, emergency contacts)
- Respect iOS privacy requirements for permissions

## Project-Specific Constraints

### Expo Go Limitations

Some features require development build instead of Expo Go:

- Full device locking (Screen Time API integration)
- Advanced native module integration
- Custom notification behaviors

To create development build: Use EAS CLI (`eas build`)

### TypeScript Configuration

- Strict mode enabled
- All files must pass type checking (`npm run type-check`)
- No implicit any types

### Permissions Already Configured

The following iOS permissions are pre-configured in `app.json`:

- Camera access (`NSCameraUsageDescription`)
- Photo library access (`NSPhotoLibraryUsageDescription`)
- Motion sensors (`NSMotionUsageDescription`)
- HealthKit (optional, for pushup tracking)

## Common Pitfalls

1. **Don't modify `app.json` permissions** without understanding iOS privacy requirements
2. **Don't store sensitive data in AsyncStorage without encryption** (though this app only stores routine completion state)
3. **Don't forget to test sensor features on real device** - simulators don't have motion sensors
4. **Don't implement server sync** - this violates the privacy-first requirement
5. **When adding dependencies**, verify they work with Expo Go or note if development build required

## When You're Stuck

- Check Expo documentation: https://docs.expo.dev/
- Review React Native docs: https://reactnative.dev/
- Check existing code patterns in the repo
- Search for similar implementations
- If truly blocked, document the issue and suggest alternatives

## Success Criteria

The project is successful when:

- All core features are implemented and tested
- App runs smoothly on iOS (and Android if possible)
- Code is maintainable and well-tested
- CI pipeline is green
- Documentation is up to date
- Privacy-first approach maintained

## Getting Started

1. Read this file completely
2. Review the codebase structure
3. Check existing tests to understand patterns
4. Start with Phase 1 features
5. Implement incrementally with tests
6. Commit frequently with clear messages

**Remember**: You have full autonomy. Make decisions, implement features, write tests, and commit changes. The goal is a working, tested, maintainable morning routine tracking app.
