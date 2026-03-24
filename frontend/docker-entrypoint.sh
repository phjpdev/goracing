#!/bin/sh
# Write runtime env vars so Next.js middleware can read them
cat > /app/.env.production <<EOF
JWT_SECRET_KEY=${JWT_SECRET_KEY}
BACKEND_URL=${BACKEND_URL}
GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_MODEL=${GEMINI_MODEL}
REDIS_URL=${REDIS_URL}
EOF

exec node server.js
