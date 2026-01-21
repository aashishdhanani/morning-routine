# Morning Routine Mobile App

## Goal

A React Native (Expo) mobile application that tracks and enforces morning routine completion, including pushup tracking, photo verification, and device locking until routine is complete.

## Features

- **Pushup Tracking**: Monitors and verifies completion of 20 pushups using device sensors
- **Photo Verification**: Requires photo uploads for coffee/breakfast and water consumption
- **Calendar & Email Check**: Tracks completion of calendar review and email checking
- **Music Verification**: Confirms music is playing during routine
- **Device Locking**: Locks phone until morning routine is complete (with emergency failsafe)

## Tech Stack

- **React Native** with **Expo** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing
- **Python/uv** - Development tooling and CI

## Non-negotiables

- Must include automated tests
- Must include CI
- Must follow clean architecture
- Prefer clarity over cleverness
- All data stored locally on device (privacy-first)

## Setup

See [SETUP.md](SETUP.md) for detailed setup instructions.

Quick start:

```bash
./setup.sh
npm start
# Scan QR code with Expo Go app on your iPhone
```

## Claude Instructions

Claude Code is the primary developer for this repository.
It should:

- Plan before implementing
- Write tests first when possible
- Commit logically grouped changes
- Keep PRs small and reviewable
