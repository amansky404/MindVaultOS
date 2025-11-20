#!/bin/bash
# Windows Build Script for MindVault OS
# This script builds the Windows installer (NSIS format)

set -e

echo "========================================"
echo "MindVault OS - Windows Build Script"
echo "========================================"

# Check if running on Windows or Linux with Wine
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "win32" ]]; then
    echo "Note: Building Windows installer on non-Windows system"
    echo "      This requires Wine to be installed for signing/verification"
fi

echo ""
echo "Step 1: Installing dependencies..."
npm install --ignore-scripts

echo ""
echo "Step 2: Building Next.js application..."
npm run build

echo ""
echo "Step 3: Building native dependencies for Windows..."
echo "Note: This step requires proper Windows build tools or cross-compilation setup"

echo ""
echo "Step 4: Packaging with electron-builder..."
npm run electron:build -- --win

echo ""
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "Output location: dist/"
echo ""
ls -lh dist/*.exe 2>/dev/null || echo "No .exe files found - build may have failed"
echo ""
echo "Installer types generated:"
echo "  - MindVault OS Setup.exe (NSIS installer)"
echo ""
