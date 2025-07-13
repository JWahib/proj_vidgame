#!/bin/bash

# PS5 Games Frontend - Start Script
# This script starts the React frontend on port 8000

set -e

echo "🎮 Starting PS5 Games Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if .env file exists, create from example if not
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Start the frontend development server
echo "🚀 Starting frontend on http://localhost:8000"
echo "💡 Make sure the backend is running on http://localhost:3000"
echo "💡 Press Ctrl+C to stop the frontend"

# Start with explicit port configuration
PORT=8000 npm start