#!/bin/bash

# 🍄 CronkWaters Auth Secret Generator 🍄
# This script generates a secure NEXTAUTH_SECRET for your Vercel deployment

echo "🍄 Generating secure NEXTAUTH_SECRET..."
echo ""

# Generate a secure random string
SECRET=$(openssl rand -base64 32)

echo "Your NEXTAUTH_SECRET:"
echo "===================="
echo "$SECRET"
echo "===================="
echo ""
echo "📋 Add this to your Vercel environment variables:"
echo ""
echo "1. Go to your Vercel dashboard"
echo "2. Navigate to your project settings"
echo "3. Click on 'Environment Variables'"
echo "4. Add the following variables:"
echo ""
echo "NEXTAUTH_SECRET=$SECRET"
echo "NEXTAUTH_URL=https://www.cronkwaters.com"
echo ""
echo "Don't forget to also add:"
echo "- DATABASE_URL (your PostgreSQL connection string)"
echo "- EMAIL_SERVER_URL (for magic link login)"
echo "- EMAIL_FROM=noreply@cronkwaters.com"
echo ""
echo "🍄 The mycelial network awaits these nutrients! 🍄"
