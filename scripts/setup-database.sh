#!/bin/bash
# Setup script for initializing the database after env vars are configured

echo "🍄 Mycelial Network: Database Setup Script"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages/db" ]; then
    echo "❌ Error: Must run from project root (song-forge directory)"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔄 Running Prisma migrations..."
cd packages/db
pnpm prisma migrate deploy

echo ""
echo "🌱 Generating Prisma client..."
pnpm prisma generate

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify deployment at: https://song-forge.vercel.app"
echo "2. Test authentication flow"
echo "3. Check /api/health endpoint"
