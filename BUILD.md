# Build Instructions - MindVault OS

This document provides comprehensive instructions for building MindVault OS installers for Windows and Linux platforms.

## Prerequisites

### All Platforms
- **Node.js**: v18.x or v20.x LTS
- **npm**: v9.x or v10.x
- **Git**: Latest version
- **Storage**: At least 2GB free space for build artifacts

### Windows
- **Windows 10/11** (64-bit)
- **Visual Studio Build Tools 2019 or later** (for native modules)
  - Install from: https://visualstudio.microsoft.com/downloads/
  - Select "Desktop development with C++" workload
- **Python 3.x** (for node-gyp)
  - Install from: https://www.python.org/downloads/

### Linux (Ubuntu/Debian)
- **Ubuntu 20.04+** or **Debian 11+** (64-bit)
- Build essentials:
  ```bash
  sudo apt-get update
  sudo apt-get install -y build-essential python3 libx11-dev libxtst-dev libpng-dev
  ```

### macOS (for completeness)
- **macOS 10.15+**
- **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```

---

## Quick Build

### Windows Installer

```bash
# Run the automated build script
bash build-windows.sh

# Or manually:
npm install
npm run build
npm run electron:build -- --win
```

**Output**: `dist/MindVault OS Setup.exe` (NSIS installer)

### Linux Packages

```bash
# Run the automated build script
bash build-linux.sh

# Or manually:
npm install
npm run build
npm run electron:build -- --linux
```

**Output**: 
- `dist/MindVault OS-*.AppImage` (Universal Linux binary)
- `dist/mindvault-os_*_amd64.deb` (Debian/Ubuntu package)

---

## Detailed Build Process

### Step 1: Clone Repository

```bash
git clone https://github.com/amansky404/MindVaultOS.git
cd MindVaultOS
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note**: This will install all required npm packages and build native modules.

**Troubleshooting Native Module Builds**:

If you encounter errors with native modules (argon2, robotjs, node-pty, better-sqlite3):

1. **Ensure build tools are installed** (see Prerequisites above)
2. **Clear npm cache**: `npm cache clean --force`
3. **Rebuild native modules**: `npm rebuild`
4. **Check Node.js version**: Should be LTS version (v18 or v20)

### Step 3: Build Next.js Application

```bash
npm run build
```

This compiles the Next.js web interface into production-ready static files in `.next/` directory.

**Verification**: Check that `.next/` directory exists and contains built files.

### Step 4: Package with Electron Builder

#### For Windows (NSIS installer):
```bash
npm run electron:build -- --win
```

Configuration in `package.json`:
```json
"win": {
  "target": ["nsis"]
}
```

#### For Linux (AppImage + deb):
```bash
npm run electron:build -- --linux
```

Configuration in `package.json`:
```json
"linux": {
  "target": ["AppImage", "deb"],
  "category": "Utility"
}
```

#### For macOS (DMG):
```bash
npm run electron:build -- --mac
```

Configuration in `package.json`:
```json
"mac": {
  "category": "public.app-category.productivity",
  "target": ["dmg"]
}
```

### Step 5: Verify Build Artifacts

After successful build, check the `dist/` directory:

```bash
ls -lh dist/
```

Expected outputs:
- **Windows**: `MindVault OS Setup-1.0.0.exe` (~150-250 MB)
- **Linux**: 
  - `MindVault OS-1.0.0.AppImage` (~150-250 MB)
  - `mindvault-os_1.0.0_amd64.deb` (~150-250 MB)
- **macOS**: `MindVault OS-1.0.0.dmg` (~150-250 MB)

---

## Build Configuration

The build configuration is defined in `package.json` under the `"build"` field:

```json
{
  "build": {
    "appId": "com.mindvault.os",
    "productName": "MindVault OS",
    "directories": {
      "output": "dist"
    },
    "files": [
      "electron/**/*",
      ".next/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Utility"
    },
    "mac": {
      "category": "public.app-category.productivity",
      "target": ["dmg"]
    }
  }
}
```

### Customizing Build

#### Change Output Directory
```json
"directories": {
  "output": "build"
}
```

#### Add More Linux Targets
```json
"linux": {
  "target": ["AppImage", "deb", "rpm", "snap"],
  "category": "Utility"
}
```

#### Windows Code Signing (Optional)
```json
"win": {
  "target": ["nsis"],
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

---

## Cross-Platform Building

### Building Windows Installer on Linux

Requires Wine:
```bash
sudo apt-get install wine64
npm run electron:build -- --win
```

### Building Linux Packages on Windows

Requires Docker or WSL2:
```bash
# Using WSL2 (recommended)
wsl
cd /mnt/c/path/to/MindVaultOS
bash build-linux.sh
```

---

## Testing Built Installers

### Windows (NSIS)

1. **Locate installer**: `dist/MindVault OS Setup-1.0.0.exe`
2. **Double-click** to run installer
3. **Follow installation wizard**:
   - Choose installation directory
   - Select Start Menu folder
   - Choose desktop shortcut option
4. **Launch** from Start Menu or desktop
5. **Verify**:
   - App launches successfully
   - Main window displays
   - Can create master password
   - Database initializes

### Linux (AppImage)

1. **Locate AppImage**: `dist/MindVault OS-1.0.0.AppImage`
2. **Make executable**:
   ```bash
   chmod +x "dist/MindVault OS-1.0.0.AppImage"
   ```
3. **Run**:
   ```bash
   ./dist/MindVault\ OS-1.0.0.AppImage
   ```
4. **Verify** (same as Windows)

### Linux (DEB package)

1. **Locate package**: `dist/mindvault-os_1.0.0_amd64.deb`
2. **Install**:
   ```bash
   sudo dpkg -i dist/mindvault-os_1.0.0_amd64.deb
   # If dependencies missing:
   sudo apt-get install -f
   ```
3. **Launch**:
   ```bash
   mindvault-os
   # Or from applications menu
   ```
4. **Verify** (same as Windows)
5. **Uninstall** (when done testing):
   ```bash
   sudo apt-get remove mindvault-os
   ```

---

## Automated Testing Script

Create `test-installer.sh`:

```bash
#!/bin/bash
# Test script for verifying built installers

echo "Testing MindVault OS Installers"
echo "================================"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist/ directory not found. Run build first."
    exit 1
fi

# Test Linux AppImage
if [ -f dist/*.AppImage ]; then
    echo "✓ AppImage found"
    APPIMAGE=$(ls dist/*.AppImage)
    chmod +x "$APPIMAGE"
    echo "  Size: $(du -h "$APPIMAGE" | cut -f1)"
else
    echo "✗ AppImage not found"
fi

# Test Linux DEB
if [ -f dist/*.deb ]; then
    echo "✓ DEB package found"
    DEB=$(ls dist/*.deb)
    echo "  Size: $(du -h "$DEB" | cut -f1)"
    echo "  Info:"
    dpkg-deb --info "$DEB" | grep -E "Package|Version|Architecture|Depends"
else
    echo "✗ DEB package not found"
fi

# Test Windows EXE
if [ -f dist/*.exe ]; then
    echo "✓ Windows installer found"
    EXE=$(ls dist/*.exe)
    echo "  Size: $(du -h "$EXE" | cut -f1)"
else
    echo "✗ Windows installer not found"
fi

echo ""
echo "Test complete!"
```

Usage:
```bash
chmod +x test-installer.sh
./test-installer.sh
```

---

## Common Issues and Solutions

### Issue: Native Module Build Fails

**Symptoms**: Error during `npm install` with node-gyp errors

**Solution**:
1. Install platform-specific build tools (see Prerequisites)
2. Use Node.js LTS version (v18 or v20)
3. Clear npm cache: `npm cache clean --force`
4. Try: `npm install --build-from-source`

### Issue: electron-builder Fails

**Symptoms**: "Cannot find module electron" or builder errors

**Solution**:
1. Ensure electron is in `devDependencies` (not `dependencies`)
2. Run: `npm install electron-builder --save-dev`
3. Check disk space (need ~2GB free)

### Issue: AppImage Doesn't Run

**Symptoms**: Permission denied or "cannot execute binary file"

**Solution**:
```bash
chmod +x "MindVault OS-1.0.0.AppImage"
# If still fails, extract and run:
./MindVault\ OS-1.0.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

### Issue: DEB Install Fails

**Symptoms**: "dependency problems" during dpkg install

**Solution**:
```bash
sudo apt-get install -f
# This installs missing dependencies
```

### Issue: Large Installer Size

**Symptoms**: Installer is >500MB

**Solution**:
1. Check `package.json` "files" field - ensure not including unnecessary files
2. Run `npm prune --production` before building
3. Consider using `asar` packing (enabled by default in electron-builder)

---

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/build.yml`:

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
      - run: npm run electron:build -- --win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist/*.exe

  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: sudo apt-get install -y libx11-dev libxtst-dev libpng-dev
      - run: npm install
      - run: npm run build
      - run: npm run electron:build -- --linux
      - uses: actions/upload-artifact@v3
        with:
          name: linux-installers
          path: |
            dist/*.AppImage
            dist/*.deb
```

---

## Release Checklist

Before releasing new installers:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Test installers on clean VMs:
  - [ ] Windows 10
  - [ ] Windows 11
  - [ ] Ubuntu 22.04
  - [ ] Debian 12
- [ ] Verify all core features work:
  - [ ] Master password initialization
  - [ ] Database creation
  - [ ] Password manager
  - [ ] Clipboard history
  - [ ] Terminal recording
  - [ ] Browser extension connection
- [ ] Create GitHub release with:
  - [ ] Release notes
  - [ ] All installer files
  - [ ] SHA256 checksums
- [ ] Update documentation links

---

## Getting Help

If you encounter issues during the build process:

1. **Check this documentation** for common issues
2. **Search GitHub Issues**: https://github.com/amansky404/MindVaultOS/issues
3. **Open a new issue** with:
   - Operating system and version
   - Node.js and npm versions (`node -v`, `npm -v`)
   - Full error message
   - Build command used

---

## Build Architecture

```
MindVault OS Build Process
│
├── Source Code
│   ├── app/ (Next.js pages)
│   ├── electron/ (Electron main process)
│   ├── lib/ (Core libraries)
│   └── browser-extension/
│
├── npm install
│   └── Compiles native modules
│       ├── argon2 (password hashing)
│       ├── better-sqlite3 (database)
│       ├── node-pty (terminal emulation)
│       └── robotjs (automation)
│
├── npm run build
│   └── Builds Next.js app → .next/
│
└── electron-builder
    ├── Packages .next/ + electron/ + node_modules/
    ├── Creates platform-specific installers
    └── Outputs to dist/
        ├── Windows: .exe (NSIS)
        ├── Linux: .AppImage, .deb
        └── macOS: .dmg
```

---

**Happy Building!** 🏗️
