#!/bin/bash

set -e

PROJECT_ROOT="$PWD"
MEDUSA_CONFIG="$PROJECT_ROOT/apps/backend/medusa-config.ts"

ZROK_LOG=$(mktemp)

cleanup() {
    echo ""
    echo "🛑 Stopping zrok..."
    if [ -n "$ZROK_PID" ]; then
        kill "$ZROK_PID" 2>/dev/null || true
    fi
    rm -f "$ZROK_LOG"
}

trap cleanup EXIT INT TERM

echo "🚀 Starting zrok..."

# Run zrok headless
zrok share public --headless localhost:9000 > "$ZROK_LOG" 2>&1 &
ZROK_PID=$!

echo "⏳ Waiting for zrok URL..."

ZROK_HOST=""

for i in {1..30}; do
    sleep 1

    ZROK_HOST=$(grep -oE '[a-zA-Z0-9-]+\.shares\.zrok\.io' "$ZROK_LOG" | head -n 1 || true)

    if [ -n "$ZROK_HOST" ]; then
        break
    fi

    # If zrok died, show the error immediately
    if ! kill -0 "$ZROK_PID" 2>/dev/null; then
        echo ""
        echo "❌ zrok exited unexpectedly."
        echo ""
        cat "$ZROK_LOG"
        exit 1
    fi
done

if [ -z "$ZROK_HOST" ]; then
    echo ""
    echo "❌ Could not find zrok hostname."
    echo ""
    echo "zrok output:"
    cat "$ZROK_LOG"
    exit 1
fi

ZROK_URL="https://$ZROK_HOST"

echo ""
echo "=========================================="
echo "✅ zrok started"
echo "=========================================="
echo "🌐 $ZROK_URL"
echo "=========================================="
echo ""

# ------------------------------------------
# Update Medusa config
# ------------------------------------------

echo "🔧 Updating Medusa config..."

if [ ! -f "$MEDUSA_CONFIG" ]; then
    echo "❌ File not found:"
    echo "$MEDUSA_CONFIG"
    exit 1
fi

sed -i '' -E \
"s/allowedHosts: \[[^]]*\]/allowedHosts: [\"$ZROK_HOST\"]/" \
"$MEDUSA_CONFIG"

echo "✅ allowedHosts updated:"
grep -n "allowedHosts" "$MEDUSA_CONFIG"

echo ""

# ------------------------------------------
# Start backend
# ------------------------------------------

echo "🚀 Opening backend terminal..."

osascript -e "tell application \"Terminal\"
    do script \"cd '$PROJECT_ROOT' && pnpm backend:dev\"
end tell"

# ------------------------------------------
# Start storefront
# ------------------------------------------

echo "🚀 Opening storefront terminal..."

osascript -e "tell application \"Terminal\"
    do script \"cd '$PROJECT_ROOT' && pnpm storefront:dev -- --experimental-https\"
end tell"

echo ""
echo "=========================================="
echo "✅ Development environment is running"
echo "=========================================="
echo ""
echo "🌐 zrok:"
echo "$ZROK_URL"
echo ""
echo "🔧 Medusa:"
echo "allowedHosts: [\"$ZROK_HOST\"]"
echo ""
echo "📦 Backend:"
echo "pnpm backend:dev"
echo ""
echo "🛍️ Storefront:"
echo "pnpm storefront:dev -- --experimental-https"
echo ""
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop zrok and this script."
echo ""

# Keep current terminal alive and display zrok output
tail -f "$ZROK_LOG" &
TAIL_PID=$!

wait "$ZROK_PID"

kill "$TAIL_PID" 2>/dev/null || true
