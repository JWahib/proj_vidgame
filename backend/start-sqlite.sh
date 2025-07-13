#!/bin/bash

# PS5 Games Backend - SQLite Setup Script
# This script sets up and starts the backend with SQLite (no Docker required)

set -e

echo "🚀 Setting up PS5 Games Backend with SQLite..."

# Navigate to backend directory
cd "$(dirname "$0")"

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

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up SQLite database..."
npm run db:setup

# Seed database
echo "🌱 Seeding database with PS5 games..."
npm run db:seed

# Start server
echo "🚀 Starting backend server..."
echo "💡 Backend will be available at: http://localhost:3000"
echo "💡 Press Ctrl+C to stop the server"

# Start in development mode
npm run dev