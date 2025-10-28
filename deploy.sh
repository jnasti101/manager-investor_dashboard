#!/bin/bash

# Real Estate Dashboard - Deployment Script
# This script helps you deploy to Vercel via GitHub

echo "🚀 Real Estate Dashboard - Deployment Helper"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Add all files
echo ""
echo "📝 Adding files to git..."
git add .

# Commit
echo ""
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update Real Estate Dashboard"
fi
git commit -m "$commit_msg"

# Check if remote exists
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 No GitHub remote found."
    echo ""
    echo "Please create a new repository on GitHub:"
    echo "👉 https://github.com/new"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., git@github.com:username/repo.git): " repo_url
    git remote add origin "$repo_url"
    echo "✅ Remote added"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Click 'Add New Project'"
echo "3. Import your GitHub repository"
echo "4. Click 'Deploy'"
echo ""
echo "Your app will be live in 2-3 minutes! 🎉"
