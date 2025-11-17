# MindVault AutoFill Browser Extension

Secure local-only AutoFill extension for MindVault OS.

## Installation

### Chrome/Edge

1. Open Chrome/Edge and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `browser-extension/chrome` folder
5. The extension is now installed!

### Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Navigate to `browser-extension/chrome` and select `manifest.json`
5. The extension is now installed!

## Usage

1. Ensure MindVault OS desktop application is running and unlocked
2. Navigate to any login page
3. Press `Ctrl+Shift+A` (or `Cmd+Shift+A` on Mac)
4. Or click the extension icon and click "Fill Current Page"
5. Credentials will be filled with human-like typing

## Features

- **Auto-detect login forms**: Automatically detects username and password fields
- **Human-like typing**: Simulates natural typing patterns to bypass paste-blocking
- **Visual indicators**: Shows a 🔐 icon on detected login forms
- **Hotkey support**: Quick fill with keyboard shortcut
- **Local-only**: Only connects to 127.0.0.1 (localhost)
- **Status indicator**: Extension popup shows connection status

## Security

- Extension only communicates with local API on 127.0.0.1:37405
- No external network requests
- Credentials never leave your device
- Extension has minimal permissions

## Troubleshooting

**Extension shows "Not Connected":**
- Ensure MindVault OS desktop app is running
- Check that the app is unlocked
- Verify local API is running on port 37405

**AutoFill doesn't work:**
- Make sure you have saved credentials for the current domain
- Check that AutoFill is enabled in MindVault OS settings
- Try reloading the page

## Icons

Note: Icon files are placeholder. To add proper icons:

1. Create or download icon images (16x16, 48x48, 128x128 pixels)
2. Save as PNG files in `browser-extension/chrome/icons/`
3. Name them: `icon16.png`, `icon48.png`, `icon128.png`

## Permissions

The extension requires:
- `activeTab`: To access current page for AutoFill
- `storage`: To save extension settings
- `webNavigation`: To detect page loads
- Host permission `http://127.0.0.1/*`: To communicate with local API

All permissions are minimal and necessary for functionality.
