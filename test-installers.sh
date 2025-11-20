#!/bin/bash
# Test script for verifying built installers
# This script checks if the build artifacts were created successfully

set -e

echo "========================================"
echo "MindVault OS - Installer Test Script"
echo "========================================"
echo ""

# Initialize counters
PASSED=0
FAILED=0

# Function to test file existence and size
test_artifact() {
    local pattern="$1"
    local description="$2"
    local min_size_mb="${3:-50}"  # Default minimum size 50MB
    
    echo -n "Testing $description... "
    
    # Find file matching pattern
    local file=$(find dist/ -name "$pattern" 2>/dev/null | head -1)
    
    if [ -z "$file" ]; then
        echo "✗ FAILED - File not found"
        ((FAILED++))
        return 1
    fi
    
    # Check file size
    local size_bytes=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local size_mb=$((size_bytes / 1024 / 1024))
    
    if [ $size_mb -lt $min_size_mb ]; then
        echo "✗ FAILED - File too small (${size_mb}MB < ${min_size_mb}MB)"
        ((FAILED++))
        return 1
    fi
    
    echo "✓ PASSED"
    echo "  → File: $(basename "$file")"
    echo "  → Size: ${size_mb}MB"
    echo "  → Path: $file"
    ((PASSED++))
    return 0
}

# Function to test DEB package
test_deb_package() {
    echo -n "Testing DEB package metadata... "
    
    local deb_file=$(find dist/ -name "*.deb" 2>/dev/null | head -1)
    
    if [ -z "$deb_file" ]; then
        echo "✗ FAILED - DEB file not found"
        ((FAILED++))
        return 1
    fi
    
    # Check if dpkg-deb is available
    if ! command -v dpkg-deb &> /dev/null; then
        echo "⚠ SKIPPED - dpkg-deb not available"
        return 0
    fi
    
    # Verify package can be read
    if dpkg-deb --info "$deb_file" &> /dev/null; then
        echo "✓ PASSED"
        echo "  → Package details:"
        dpkg-deb --info "$deb_file" | grep -E "^\s*(Package|Version|Architecture|Description)" | sed 's/^/    /'
        ((PASSED++))
        return 0
    else
        echo "✗ FAILED - Invalid DEB package"
        ((FAILED++))
        return 1
    fi
}

# Function to test AppImage
test_appimage() {
    echo -n "Testing AppImage executable... "
    
    local appimage=$(find dist/ -name "*.AppImage" 2>/dev/null | head -1)
    
    if [ -z "$appimage" ]; then
        echo "✗ FAILED - AppImage not found"
        ((FAILED++))
        return 1
    fi
    
    # Check if executable bit is set or can be set
    if [ -x "$appimage" ] || chmod +x "$appimage" 2>/dev/null; then
        echo "✓ PASSED"
        echo "  → AppImage is executable"
        ((PASSED++))
        return 0
    else
        echo "✗ FAILED - Cannot make AppImage executable"
        ((FAILED++))
        return 1
    fi
}

# Main test execution
echo "Checking build directory..."
if [ ! -d "dist" ]; then
    echo "✗ ERROR: dist/ directory not found"
    echo "  Please run build scripts first:"
    echo "    bash build-linux.sh"
    echo "    bash build-windows.sh"
    exit 1
fi

echo "✓ dist/ directory exists"
echo ""

# Count total artifacts
ARTIFACT_COUNT=$(find dist/ -type f \( -name "*.AppImage" -o -name "*.deb" -o -name "*.exe" -o -name "*.dmg" \) 2>/dev/null | wc -l)
echo "Found $ARTIFACT_COUNT installer artifact(s)"
echo ""

# Test Linux artifacts (if present)
echo "=== Linux Artifacts ==="
if find dist/ -name "*.AppImage" &>/dev/null | grep -q .; then
    test_artifact "*.AppImage" "Linux AppImage" 50
    test_appimage
else
    echo "ℹ No AppImage found (may not have been built on this platform)"
fi

if find dist/ -name "*.deb" &>/dev/null | grep -q .; then
    test_artifact "*.deb" "Debian Package" 50
    test_deb_package
else
    echo "ℹ No DEB package found (may not have been built on this platform)"
fi

echo ""

# Test Windows artifacts (if present)
echo "=== Windows Artifacts ==="
if find dist/ -name "*.exe" &>/dev/null | grep -q .; then
    test_artifact "*.exe" "Windows Installer (NSIS)" 50
else
    echo "ℹ No Windows installer found (may not have been built on this platform)"
fi

echo ""

# Test macOS artifacts (if present)
echo "=== macOS Artifacts ==="
if find dist/ -name "*.dmg" &>/dev/null | grep -q .; then
    test_artifact "*.dmg" "macOS DMG" 50
else
    echo "ℹ No macOS DMG found (may not have been built on this platform)"
fi

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ] && [ $PASSED -gt 0 ]; then
    echo "✓ ALL TESTS PASSED!"
    echo ""
    echo "Next steps:"
    echo "1. Test installation on target platforms"
    echo "2. Verify application launches correctly"
    echo "3. Test core functionality (password creation, database init)"
    exit 0
elif [ $PASSED -eq 0 ]; then
    echo "⚠ NO TESTS RUN - No artifacts found"
    echo "Run build scripts first:"
    echo "  bash build-linux.sh"
    echo "  bash build-windows.sh"
    exit 1
else
    echo "✗ SOME TESTS FAILED"
    echo "Review the errors above and rebuild if necessary"
    exit 1
fi
