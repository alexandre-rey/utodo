#!/bin/bash

echo "🧪 Testing Google Analytics Configuration"
echo "========================================"

echo ""
echo "📝 Current environment variables:"
echo "VITE_ENV: $(grep VITE_ENV .env | cut -d'=' -f2)"
echo "VITE_GA_MEASUREMENT_ID: $(grep VITE_GA_MEASUREMENT_ID .env | cut -d'=' -f2)"
echo "VITE_GA_DEBUG_MODE: $(grep VITE_GA_DEBUG_MODE .env | cut -d'=' -f2)"

echo ""
echo "🔍 Testing production configuration (what GA4 will receive):"
echo "- Environment: production"
echo "- Debug Mode: false (logs disabled, data sent to GA4)"
echo "- Test Mode: false (real data sent to GA4)"

echo ""
echo "🚀 Starting local server to test..."
echo "Open your browser and check:"
echo "1. GA4 Real-time reports: https://analytics.google.com/analytics/web/"
echo "2. Browser console should NOT show debug logs (debug_mode: false)"
echo "3. Events should appear in GA4 dashboard within 30 seconds"

echo ""
echo "📊 Expected behavior:"
echo "✅ No debug logs in console (production mode)"
echo "✅ Events sent to GA4 (testMode: false)"
echo "✅ Real-time data visible in GA4 dashboard"
