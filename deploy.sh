#!/bin/bash
set -e
cd /var/www/projects/yufo
echo "Fetching latest changes..."
git pull origin main
echo "Installing dependencies..."
npm install --prefer-offline --no-audit
echo "Building Next.js..."
npm run build
echo "Restarting PM2..."
pm2 restart yufo
echo "Deployment completed successfully!"
