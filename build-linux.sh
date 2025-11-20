#!/bin/bash
# Linux Build Script for MindVault OS
# This script builds Linux installers (AppImage and deb formats)

set -e

echo "========================================"
echo "MindVault OS - Linux Build Script"
echo "========================================"

echo ""
echo "Step 1: Checking system requirements..."

# Check for required system libraries
echo "Checking for X11 development libraries..."
if ! dpkg -l | grep -q libx11-dev; then
    echo "Warning: libx11-dev not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y libx11-dev libxtst-dev libpng-dev
else
    echo "✓ X11 libraries found"
fi

echo ""
echo "Step 2: Installing npm dependencies..."
npm install --ignore-scripts

echo ""
echo "Step 3: Building Next.js application..."
npm run build

echo ""
echo "Step 4: Building native dependencies for Linux..."
echo "Note: This requires proper build tools (python3, gcc, g++, make)"

echo ""
echo "Step 5: Packaging with electron-builder..."
npm run electron:build -- --linux

echo ""
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "Output location: dist/"
echo ""
ls -lh dist/*.AppImage dist/*.deb 2>/dev/null || echo "Build artifacts:"
ls -lh dist/ 2>/dev/null || echo "dist/ directory not found"
echo ""
echo "Installer types generated:"
echo "  - MindVault OS-*.AppImage (portable, works on most distros)"
echo "  - mindvault-os_*_amd64.deb (Debian/Ubuntu package)"
echo ""
