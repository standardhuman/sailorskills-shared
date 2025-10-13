#!/bin/bash

echo "🚀 Starting Sailor Skills Billing - Dev Server"
echo "=============================================="
echo ""

# Check if vercel is installed
if command -v vercel &> /dev/null; then
    echo "📦 Starting with Vercel Dev..."
    echo "   URL: http://localhost:3000"
    echo ""
    vercel dev
else
    echo "📦 Vercel not found, using http-server..."
    echo "   URL: http://localhost:8001"
    echo ""
    npx http-server dist -p 8001 -c-1 --cors
fi
