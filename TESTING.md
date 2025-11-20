# Installer Testing Guide - MindVault OS

This document provides comprehensive testing procedures for Windows and Linux installers.

## Table of Contents
1. [Pre-Test Setup](#pre-test-setup)
2. [Windows Installer Testing](#windows-installer-testing)
3. [Linux AppImage Testing](#linux-appimage-testing)
4. [Linux DEB Package Testing](#linux-deb-package-testing)
5. [Functional Testing](#functional-testing)
6. [Test Checklist](#test-checklist)
7. [Known Issues](#known-issues)

---

## Pre-Test Setup

### Test Environment Requirements

#### Windows Testing
- **Operating Systems**: Windows 10 (21H2 or later), Windows 11
- **Architecture**: x64 (64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB free
- **Permissions**: Administrator rights for installation

#### Linux Testing
- **Distributions**: 
  - Ubuntu 20.04, 22.04, 24.04
  - Debian 11, 12
  - Fedora 38+
  - Linux Mint 21+
- **Architecture**: x86_64 (64-bit)
- **Desktop Environment**: GNOME, KDE, XFCE, etc.
- **RAM**: 4GB minimum
- **Disk Space**: 500MB free

### Before You Start

1. **Clean Environment**: Test on a fresh system or VM
2. **No Previous Versions**: Uninstall any existing MindVault OS installations
3. **Network**: Ensure stable internet connection (for downloading)
4. **Antivirus**: Temporarily disable or add exception if needed
5. **Backup**: Have test data ready for functional testing

---

## Windows Installer Testing

### 1. Download and Verify

```powershell
# Download from GitHub Releases
# URL: https://github.com/amansky404/MindVaultOS/releases/latest

# Verify file integrity
Get-FileHash "MindVault OS Setup-1.0.0.exe" -Algorithm SHA256
# Compare with published checksum
```

### 2. Installation Test

#### Standard Installation

1. **Double-click** `MindVault OS Setup-1.0.0.exe`
2. **UAC Prompt**: Click "Yes" to allow
3. **Installation Wizard**:
   - Welcome screen → Click "Next"
   - License agreement → Accept → "Next"
   - Installation directory → Use default or change → "Next"
   - Start Menu folder → Use default → "Next"
   - Additional tasks → Check "Create desktop icon" → "Next"
   - Ready to install → Click "Install"
4. **Progress**: Wait for installation to complete
5. **Completion**: Check "Launch MindVault OS" → Click "Finish"

**Expected Result**: Application launches successfully

#### Custom Installation

1. Run installer
2. Choose **custom installation directory**: `C:\CustomPath\MindVault`
3. **Uncheck** "Create desktop icon"
4. Complete installation

**Expected Result**: 
- Files installed in custom directory
- No desktop icon created
- Start Menu shortcut exists

### 3. Post-Installation Verification

**Check Installation Directory**:
```powershell
cd "C:\Program Files\MindVault OS"
dir
```

**Expected Files**:
- `MindVault OS.exe` (main executable)
- `resources/` (app resources)
- `locales/` (language files)
- `Uninstall MindVault OS.exe`

**Check Start Menu**:
- Open Start Menu
- Search "MindVault OS"
- Verify shortcut exists

**Check Registry** (Optional):
```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*" | Where-Object {$_.DisplayName -like "*MindVault*"}
```

### 4. Launch Test

**Method 1: Desktop Icon**
- Double-click desktop icon
- Application should launch

**Method 2: Start Menu**
- Open Start Menu → Click "MindVault OS"
- Application should launch

**Method 3: Direct Executable**
```powershell
& "C:\Program Files\MindVault OS\MindVault OS.exe"
```

### 5. Uninstallation Test

**Method 1: Control Panel**
1. Open Settings → Apps → Apps & features
2. Search "MindVault OS"
3. Click → "Uninstall"
4. Confirm uninstallation

**Method 2: Uninstaller**
1. Navigate to installation directory
2. Run "Uninstall MindVault OS.exe"
3. Follow prompts

**Verification**:
- Installation directory deleted
- Start Menu shortcut removed
- Desktop icon removed (if existed)
- Registry entries cleaned

---

## Linux AppImage Testing

### 1. Download and Verify

```bash
# Download from GitHub Releases
wget https://github.com/amansky404/MindVaultOS/releases/download/v1.0.0/MindVault-OS-1.0.0.AppImage

# Verify checksum
sha256sum MindVault-OS-1.0.0.AppImage
# Compare with published checksum
```

### 2. Preparation

```bash
# Make executable
chmod +x MindVault-OS-1.0.0.AppImage

# Verify executable bit set
ls -lh MindVault-OS-1.0.0.AppImage
```

### 3. Launch Test

**Method 1: Double-click**
- Open file manager
- Navigate to download location
- Double-click AppImage
- Application should launch

**Method 2: Command Line**
```bash
./MindVault-OS-1.0.0.AppImage
```

**Method 3: Desktop Integration** (Optional)
```bash
# Install AppImageLauncher (recommended)
# Ubuntu/Debian:
sudo apt install appimagelauncher

# Fedora:
sudo dnf install appimagelauncher

# Then double-click AppImage to integrate
```

### 4. Functional Verification

- Main window opens
- No console errors
- UI renders correctly
- Can interact with application

### 5. Extraction Test (Optional)

```bash
# Extract AppImage contents
./MindVault-OS-1.0.0.AppImage --appimage-extract

# Inspect contents
ls squashfs-root/

# Run extracted app
./squashfs-root/AppRun
```

### 6. Cleanup

```bash
# Remove AppImage
rm MindVault-OS-1.0.0.AppImage

# Remove extracted files (if extracted)
rm -rf squashfs-root/
```

---

## Linux DEB Package Testing

### 1. Download and Verify

```bash
# Download from GitHub Releases
wget https://github.com/amansky404/MindVaultOS/releases/download/v1.0.0/mindvault-os_1.0.0_amd64.deb

# Verify checksum
sha256sum mindvault-os_1.0.0_amd64.deb
```

### 2. Package Inspection

```bash
# View package information
dpkg-deb --info mindvault-os_1.0.0_amd64.deb

# List files in package
dpkg-deb --contents mindvault-os_1.0.0_amd64.deb

# Check for dependencies
dpkg-deb --field mindvault-os_1.0.0_amd64.deb Depends
```

**Expected Output**:
```
Package: mindvault-os
Version: 1.0.0
Architecture: amd64
Maintainer: amansky404
Description: MindVault OS - Local-only encrypted productivity system
```

### 3. Installation Test

**Method 1: Using dpkg**
```bash
# Install package
sudo dpkg -i mindvault-os_1.0.0_amd64.deb

# If dependencies missing:
sudo apt-get install -f
```

**Method 2: Using apt**
```bash
# Install with dependency resolution
sudo apt install ./mindvault-os_1.0.0_amd64.deb
```

**Method 3: Using GUI** (Ubuntu/Debian)
- Double-click .deb file
- Software Center opens
- Click "Install"
- Enter password

### 4. Post-Installation Verification

```bash
# Check if package is installed
dpkg -l | grep mindvault

# List installed files
dpkg -L mindvault-os

# Check executable
which mindvault-os

# Verify desktop entry
ls /usr/share/applications/mindvault*.desktop
```

### 5. Launch Test

**Method 1: Application Menu**
- Open application menu (Activities, Dash, etc.)
- Search "MindVault OS"
- Click to launch

**Method 2: Command Line**
```bash
mindvault-os
```

**Method 3: Desktop Entry**
```bash
gtk-launch mindvault-os.desktop
# or
xdg-open /usr/share/applications/mindvault-os.desktop
```

### 6. Uninstallation Test

**Method 1: Using apt**
```bash
sudo apt remove mindvault-os
```

**Method 2: Using dpkg**
```bash
sudo dpkg -r mindvault-os
```

**Method 3: Purge (complete removal)**
```bash
sudo apt purge mindvault-os
```

**Verification**:
```bash
# Should return nothing
dpkg -l | grep mindvault

# Check files removed
ls /usr/bin/mindvault-os  # Should not exist
ls /opt/MindVault\ OS/     # Should not exist
```

---

## Functional Testing

Once installed, verify core functionality:

### 1. First Launch

**Test**: Initial setup wizard
- [  ] Application launches without errors
- [  ] Welcome screen displays
- [  ] Can proceed through setup

### 2. Master Password Setup

**Test**: Create master password
- [  ] Can enter password (min 8 characters)
- [  ] Password confirmation field works
- [  ] Validation works (mismatch, too short)
- [  ] "Initialize MindVault" button activates
- [  ] Database initializes successfully

### 3. Unlock Screen

**Test**: Unlock with master password
- [  ] Unlock screen appears after restart
- [  ] Correct password unlocks
- [  ] Incorrect password shows error
- [  ] Can lock and re-unlock

### 4. Main Dashboard

**Test**: Dashboard functionality
- [  ] Dashboard loads
- [  ] All module cards visible
- [  ] Navigation works
- [  ] Statistics display (if any)

### 5. Password Manager

**Test**: Store and retrieve passwords
- [  ] Can add new password
- [  ] Password fields encrypt
- [  ] Can edit existing entry
- [  ] Can delete entry
- [  ] Search works
- [  ] Filter by category works

### 6. Clipboard History

**Test**: Clipboard tracking
- [  ] Copy text → appears in history
- [  ] Can restore from history
- [  ] Search clipboard history
- [  ] Clear history works

### 7. Terminal Recording (if available)

**Test**: Command history
- [  ] Terminal commands logged
- [  ] Output captured
- [  ] Can search commands
- [  ] Exit codes recorded

### 8. Browser Extension Connection

**Test**: Extension communication
- [  ] Extension can connect to app
- [  ] Status shows "Connected"
- [  ] Can trigger AutoFill
- [  ] Credentials fill in browser

### 9. Settings

**Test**: Configuration options
- [  ] Can change settings
- [  ] Settings persist after restart
- [  ] Can enable/disable modules
- [  ] Export backup works

### 10. Lock/Unlock

**Test**: Security features
- [  ] Can lock vault (Ctrl+Alt+L)
- [  ] Vault locks on timeout
- [  ] Data not accessible when locked
- [  ] Unlock restores access

---

## Test Checklist

### Windows Installer

- [ ] **Download**: Installer downloads completely
- [ ] **Integrity**: SHA256 checksum matches
- [ ] **Installation**: Installer runs without errors
- [ ] **Directory**: Default installation directory used
- [ ] **Shortcuts**: Desktop and Start Menu shortcuts created
- [ ] **Launch**: Application launches from shortcuts
- [ ] **Functionality**: All core features work
- [ ] **Uninstall**: Clean uninstallation
- [ ] **Cleanup**: All files and registry entries removed

### Linux AppImage

- [ ] **Download**: AppImage downloads completely
- [ ] **Integrity**: SHA256 checksum matches
- [ ] **Permissions**: chmod +x succeeds
- [ ] **Launch**: AppImage runs without errors
- [ ] **UI**: Application UI renders correctly
- [ ] **Functionality**: All core features work
- [ ] **Performance**: No significant lag
- [ ] **Cleanup**: AppImage deleted cleanly

### Linux DEB Package

- [ ] **Download**: DEB package downloads completely
- [ ] **Integrity**: SHA256 checksum matches
- [ ] **Inspection**: Package metadata correct
- [ ] **Dependencies**: All dependencies satisfied
- [ ] **Installation**: dpkg install succeeds
- [ ] **Files**: All files installed in correct locations
- [ ] **Desktop Entry**: Application appears in menu
- [ ] **Launch**: Application launches from menu
- [ ] **Functionality**: All core features work
- [ ] **Uninstall**: Clean uninstallation
- [ ] **Purge**: Complete removal with purge

---

## Known Issues

### Windows

**Issue**: SmartScreen warning
- **Symptom**: "Windows protected your PC" message
- **Reason**: Unsigned installer
- **Solution**: Click "More info" → "Run anyway"

**Issue**: Antivirus false positive
- **Symptom**: Installer blocked by antivirus
- **Reason**: Heuristic detection
- **Solution**: Add exception or disable temporarily

### Linux

**Issue**: AppImage won't run
- **Symptom**: Permission denied
- **Solution**: `chmod +x` the AppImage

**Issue**: Missing dependencies for DEB
- **Symptom**: dpkg install fails
- **Solution**: `sudo apt-get install -f`

**Issue**: FUSE not available (AppImage)
- **Symptom**: "FUSE not found" error
- **Solution**: Install FUSE or extract AppImage

### All Platforms

**Issue**: Database initialization fails
- **Symptom**: Error creating database
- **Solution**: Check disk space and permissions

**Issue**: Port 37405 in use
- **Symptom**: API server won't start
- **Solution**: Check for conflicting services

---

## Reporting Issues

If you encounter issues during testing:

1. **Collect Information**:
   - Operating system and version
   - Installer version
   - Error messages (screenshots)
   - Console output (if available)

2. **Create Issue**: https://github.com/amansky404/MindVaultOS/issues
   - Use template "Bug Report"
   - Include all collected information
   - Tag with "installer" label

3. **Provide Logs**:
   - Windows: `%APPDATA%\mindvault-os\logs\`
   - Linux: `~/.config/mindvault-os/logs/`

---

## Test Report Template

```markdown
# MindVault OS Installer Test Report

## Test Environment
- **OS**: [e.g., Windows 11 Pro 23H2]
- **Architecture**: [e.g., x64]
- **RAM**: [e.g., 16GB]
- **Installer Version**: [e.g., 1.0.0]
- **Installer Type**: [Windows NSIS / Linux AppImage / Linux DEB]
- **Date**: [YYYY-MM-DD]

## Test Results

### Installation
- [ ] Downloaded successfully
- [ ] Checksum verified
- [ ] Installation completed
- [ ] Shortcuts created
- [ ] Application launches

### Functionality
- [ ] Master password setup
- [ ] Database initialization
- [ ] Password manager works
- [ ] Clipboard history works
- [ ] Settings accessible
- [ ] Lock/unlock works

### Uninstallation
- [ ] Uninstaller runs
- [ ] Files removed
- [ ] Shortcuts removed
- [ ] Clean system state

## Issues Found
[List any issues encountered]

## Additional Notes
[Any other observations]

## Overall Result
[ ] PASS - All tests passed
[ ] FAIL - Critical issues found
[ ] PARTIAL - Some issues, but functional

**Tester**: [Your Name]
```

---

**Happy Testing!** 🧪
