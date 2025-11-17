# Installation Guide - MindVault OS

## System Requirements

### Minimum
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **CPU**: Dual-core processor

### Recommended
- **OS**: Latest version of Windows, macOS, or Linux
- **RAM**: 8 GB or more
- **Storage**: 2 GB free space (for data)
- **CPU**: Quad-core processor

## Quick Start (3 Steps)

### 1. Download

Download the appropriate version for your operating system:

- **Windows**: `MindVault-OS-Setup.exe`
- **macOS**: `MindVault-OS.dmg`
- **Linux**: `MindVault-OS.AppImage`

### 2. Install

**Windows:**
1. Run `MindVault-OS-Setup.exe`
2. Follow installation wizard
3. Launch from Start Menu

**macOS:**
1. Open `MindVault-OS.dmg`
2. Drag app to Applications folder
3. Launch from Applications
4. If blocked: System Preferences → Security → "Open Anyway"

**Linux:**
1. Make executable: `chmod +x MindVault-OS.AppImage`
2. Run: `./MindVault-OS.AppImage`
3. Optional: Create desktop entry

### 3. Initialize

1. Launch MindVault OS
2. Create master password (min 8 characters)
3. Confirm password
4. Click "Initialize MindVault"

**⚠️ IMPORTANT: Remember your master password!**
- There is NO password recovery
- Store it in a safe place
- Consider using a password manager

## Browser Extension Setup

### Chrome/Edge Installation

1. Open Chrome or Edge
2. Navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Navigate to installation directory:
   - **Windows**: `C:\Program Files\MindVault OS\resources\browser-extension\chrome`
   - **macOS**: `/Applications/MindVault OS.app/Contents/Resources/browser-extension/chrome`
   - **Linux**: `~/.local/share/mindvault-os/browser-extension/chrome`
6. Extension installed! Look for 🔐 icon

### Firefox Installation

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Navigate to extension folder (see paths above)
6. Select `manifest.json`
7. Extension loaded (temporary, reload after browser restart)

### Extension Usage

1. Ensure MindVault OS is running and unlocked
2. Visit any login page
3. Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
4. Or click the extension icon → "Fill Current Page"
5. Credentials auto-fill with human-like typing

## First Time Setup

### Adding Your First Password

1. Open MindVault OS
2. Click "Password Manager"
3. Click "+ Add Password"
4. Fill in details:
   - Name (e.g., "GitHub")
   - Username/Email
   - Password
   - URL (e.g., "https://github.com/login")
5. Click "Save"

### Configure AutoFill

1. Go to Settings
2. Enable "AutoFill"
3. Enable "Human-like Typing" (recommended)
4. Set auto-lock timeout (recommended: 15 minutes)

### Test AutoFill

1. Save a credential (e.g., GitHub)
2. Open browser with extension
3. Go to github.com/login
4. Press `Ctrl+Shift+A`
5. Watch credentials auto-fill!

## Data Collection Setup

### Enable Modules

Go to Settings → Data Collection Modules:

- **Keystroke Memory**: Records typing (excludes passwords)
- **Clipboard History**: Tracks clipboard changes
- **Terminal Recording**: Logs terminal commands
- **Browser Tracking**: Records URL visits

Toggle each module on/off as desired.

## Backup & Security

### Create First Backup

1. Go to Settings
2. Scroll to "Backup & Export"
3. Click "Export Encrypted Backup"
4. Save `.mvault` file to safe location

**Backup Recommendations:**
- Backup weekly
- Store in multiple locations
- Keep offline backup (USB drive)
- Test restore process

### Security Best Practices

1. **Strong Master Password**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoid dictionary words
   - Unique to MindVault

2. **Auto-lock**
   - Enable in Settings
   - Set timeout (5-30 minutes)
   - Lock when leaving computer

3. **Regular Backups**
   - Weekly encrypted backups
   - Test restore process
   - Store securely

4. **Extension Security**
   - Only use official extension
   - Check connection status in popup
   - Unload when not needed

## Usage Tips

### Global Hotkeys

- `Ctrl+Alt+A`: Trigger AutoFill (desktop)
- `Ctrl+Alt+S`: Open universal search
- `Ctrl+Alt+L`: Lock vault immediately
- `Ctrl+Shift+A`: Browser AutoFill (in-page)

### Search Everything

1. Click "Universal Search" or press `Ctrl+Alt+S`
2. Type search query
3. Filter by category
4. Click result to view details

### Clipboard History

1. Copy anything to clipboard
2. It's automatically tracked
3. View in "Clipboard History"
4. Search and restore old items

### Terminal History

1. Run commands in terminal
2. Commands auto-logged
3. View in "Terminal Logs"
4. Includes outputs and exit codes

## Troubleshooting

### Cannot Initialize

**Error: "Master password already initialized"**
- Database already exists
- Delete database to reset (loses all data!)
- Location:
  - Windows: `%APPDATA%\mindvault-os\mindvault.db`
  - macOS: `~/Library/Application Support/mindvault-os/mindvault.db`
  - Linux: `~/.config/mindvault-os/mindvault.db`

### Extension Not Working

**"Not Connected to MindVault"**

Check:
1. Desktop app is running
2. Vault is unlocked (green indicator)
3. Port 37405 is not blocked by firewall

**Credentials Not Filling**

Check:
1. Credentials saved for current domain
2. AutoFill enabled in settings
3. Login fields detected (see 🔐 icon)
4. Try manual trigger: Extension icon → "Fill Current Page"

### Performance Issues

**App Running Slow**

- Close unused modules in Settings
- Clear old history (clipboard, terminal)
- Restart application
- Check system resources

**Database Growing Large**

- Export backup
- Clear old history selectively
- Optimize database (future feature)

### Data Loss Prevention

**Forgot Master Password**

⚠️ **NO RECOVERY POSSIBLE**

- Master password cannot be reset
- All data is permanently encrypted
- Always keep secure backup of password
- Consider password manager for password

**Corrupted Database**

1. Close application
2. Restore from backup
3. If no backup: data may be lost
4. Contact support with error logs

## Uninstallation

### Remove Application

**Windows:**
1. Settings → Apps → MindVault OS
2. Click "Uninstall"
3. Follow prompts

**macOS:**
1. Drag app from Applications to Trash
2. Empty Trash

**Linux:**
1. Delete AppImage file
2. Remove desktop entries if created

### Remove Data (Optional)

**⚠️ This deletes ALL your data!**

Delete these folders:

- **Windows**: `%APPDATA%\mindvault-os`
- **macOS**: `~/Library/Application Support/mindvault-os`
- **Linux**: `~/.config/mindvault-os`

### Remove Extension

**Chrome/Edge:**
1. Go to `chrome://extensions`
2. Find MindVault AutoFill
3. Click "Remove"

**Firefox:**
- Temporary extension auto-removes on browser restart

## Getting Help

### Resources

- **Documentation**: README.md, DEVELOPMENT.md
- **FAQ**: Check GitHub Wiki
- **Issues**: GitHub Issues
- **Community**: GitHub Discussions

### Reporting Bugs

Include:
1. Operating system and version
2. MindVault OS version
3. Steps to reproduce
4. Error messages
5. Screenshots (if relevant)

### Feature Requests

Open an issue with:
- Clear description
- Use case
- Expected behavior
- Nice-to-have vs. must-have

## Privacy & Data

### What's Stored Locally

- Master password salt (NOT the password)
- Encrypted passwords
- Encrypted notes
- Encrypted clipboard history
- Encrypted terminal history
- Browser URLs (unencrypted, local only)
- Keystroke records (encrypted)

### What's NOT Stored

- Master password itself
- Unencrypted passwords
- Unencrypted sensitive data
- Telemetry or usage data
- Remote backups (unless you enable manually)

### Network Activity

- **None by default**
- Only localhost API (127.0.0.1)
- No external connections
- No telemetry
- No analytics
- No cloud sync (unless manually enabled)

## Next Steps

1. ✅ Install MindVault OS
2. ✅ Create master password
3. ✅ Install browser extension
4. ✅ Add first password
5. ✅ Test AutoFill
6. ✅ Create backup
7. ✅ Enable modules you want
8. ✅ Configure settings
9. ✅ Start using daily!

---

**Welcome to MindVault OS!** 🔐

Your data, your device, your control.
