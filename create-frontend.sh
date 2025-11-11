#!/bin/bash

# Script tạo Frontend React với Vite
# Chạy: bash create-frontend.sh

echo "🎨 Creating React Frontend with Vite..."
echo ""

# Tạo project với Vite
npm create vite@latest frontend -- --template react

cd frontend

echo "📦 Installing dependencies..."
npm install

# Install additional packages
echo "📦 Installing additional packages..."
npm install react-router-dom axios socket.io-client date-fns
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react

# Initialize Tailwind
npx tailwindcss init -p

echo "✅ Frontend created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. cd frontend"
echo "2. Update tailwind.config.js"
echo "3. npm run dev"
echo ""