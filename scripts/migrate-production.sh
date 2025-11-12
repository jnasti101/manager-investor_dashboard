#!/bin/bash
# Production database migration script
# Run this locally after setting up your production database

echo "This script will migrate your production database"
echo "Make sure you have set DATABASE_URL environment variable to your production database"
echo ""
read -p "Production DATABASE_URL: " PROD_DB_URL

if [ -z "$PROD_DB_URL" ]; then
  echo "Error: DATABASE_URL cannot be empty"
  exit 1
fi

echo ""
echo "Running migrations on production database..."
DATABASE_URL="$PROD_DB_URL" npx prisma migrate deploy

echo ""
echo "Migration complete! Your production database is ready."
echo ""
echo "Don't forget to:"
echo "1. Add DATABASE_URL to Vercel environment variables"
echo "2. Add AUTH_SECRET to Vercel (can use the same one from .env)"
echo "3. Add NEXTAUTH_URL to Vercel (your production URL, e.g., https://your-app.vercel.app)"
