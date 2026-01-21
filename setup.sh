#!/bin/bash
set -e

echo "🚀 Setting up morning-routine project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first:"
    echo "   Visit https://nodejs.org/ or use: brew install node"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js which includes npm."
    exit 1
fi

echo "✅ Node.js $(node --version) and npm $(npm --version) are installed"

# Check if uv is installed (for Python tooling)
if ! command -v uv &> /dev/null; then
    echo "⚠️  uv is not installed (optional for Python tooling)"
    echo "   Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
else
    # Create virtual environment with uv for Python tooling
    echo "📦 Creating Python virtual environment with uv..."
    uv venv || echo "⚠️  Could not create Python venv (optional)"
    
    if [ -d ".venv" ]; then
        echo "🔌 Activating Python virtual environment..."
        source .venv/bin/activate
        
        echo "📥 Installing Python dependencies..."
        uv pip install -e ".[dev]" || echo "⚠️  Could not install Python deps (optional)"
    fi
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Expo CLI globally if not present
if ! command -v expo &> /dev/null; then
    echo "📥 Installing Expo CLI globally..."
    npm install -g expo-cli@latest
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm start"
echo "2. Install Expo Go app on your iPhone from the App Store"
echo "3. Scan the QR code to run the app on your device"
echo ""
echo "For Python tooling (optional):"
echo "   source .venv/bin/activate"
