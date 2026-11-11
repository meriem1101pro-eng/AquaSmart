#!/usr/bin/env bash

# AquaSmart – Startup Script
# Smart Agriculture & Intelligent Water Management Platform (Morocco)

echo "🌱 Starting AquaSmart Platform..."

# 1. Start MySQL daemon (if not already running)
if ! ss -tlpn | grep -q ":3307"; then
  echo "📦 Starting dedicated MySQL instance on port 3307..."
  /usr/sbin/mysqld --datadir=/tmp/aquasmart_mysql/data --socket=/tmp/aquasmart_mysql/mysql.sock --port=3307 --pid-file=/tmp/aquasmart_mysql/mysqld.pid --log-error=/tmp/aquasmart_mysql/error.log --mysqlx=0 >/dev/null 2>&1 &
  sleep 2
fi

# 2. Start Laravel Backend API
echo "🚀 Starting Laravel REST API (http://127.0.0.1:8000)..."
cd "$(dirname "$0")/backend"
php artisan serve --host=127.0.0.1 --port=8000 >/dev/null 2>&1 &

# 3. Start React Frontend
echo "💻 Starting React Tailwind Frontend (http://127.0.0.1:5173)..."
cd "$(dirname "$0")/frontend"
npm run dev -- --host 0.0.0.0 --port 5173

echo "✅ AquaSmart is running at http://localhost:5173"
