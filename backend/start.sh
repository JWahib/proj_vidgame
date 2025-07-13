#!/bin/bash

# PS5 Games Backend Startup Script

echo "🎮 Starting PS5 Games Backend..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start SQL Server container
echo "🗄️  Starting SQL Server container..."
docker-compose up -d

# Wait for SQL Server to be ready
echo "⏳ Waiting for SQL Server to be ready..."
sleep 10

# Check if SQL Server is ready
until docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" > /dev/null 2>&1; do
    echo "⏳ SQL Server is not ready yet. Waiting..."
    sleep 5
done

echo "✅ SQL Server is ready!"

# Set up database
echo "🔧 Setting up database..."
npm run db:setup

# Seed database with PS5 games
echo "🌱 Seeding database with PS5 games..."
npm run db:seed

# Start the application
echo "🚀 Starting the application..."
npm run dev