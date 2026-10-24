#!/bin/sh
# Write runtime env vars so Next.js middleware can read them
cat > /app/.env.production <<EOF
JWT_SECRET_KEY=${JWT_SECRET_KEY}
BACKEND_URL=${BACKEND_URL}
GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_MODEL=${GEMINI_MODEL}
REDIS_URL=${REDIS_URL}
EOF

# Warm HKJC meetings cache in background (every 60s)
if [ "${DISABLE_MEETINGS_WARMER}" = "1" ]; then
  echo "[meetings-warmer] disabled via DISABLE_MEETINGS_WARMER=1"
else
(
  sleep 15
  while true; do
    wget -q -O /dev/null http://127.0.0.1:3000/api/races/meetings/warm 2>/dev/null || true
    sleep 60
  done
) &
fi

exec node server.js
