# MindVault OS - Development Guide

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: v3.8+ (for node-gyp)
- **Build tools**: 
  - Windows: Visual Studio Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: build-essential

## Installation

```bash
# Clone the repository
git clone https://github.com/amansky404/credsManagerkeyClip.git
cd credsManagerkeyClip

# Install dependencies
npm install
```

## Development

### Running in Development Mode

```bash
# Start Next.js dev server only (for UI development)
npm run dev

# Start Electron + Next.js together (full app)
npm run electron:dev
```

The application will:
1. Start Next.js dev server on http://localhost:3000
2. Launch Electron window loading the Next.js app
3. Initialize encrypted database
4. Start local API server on 127.0.0.1:37405

### Development Workflow

1. **UI Development**: Use `npm run dev` and develop in browser
2. **Full App Testing**: Use `npm run electron:dev` to test Electron integration
3. **Hot Reload**: Changes to React components auto-reload
4. **Electron Restart**: Changes to `electron/main.js` require app restart

## Building for Production

```bash
# Build Next.js
npm run build

# Package Electron app
npm run electron:build
```

Built applications will be in the `dist/` directory:
- **macOS**: `dist/MindVault OS.dmg`
- **Windows**: `dist/MindVault OS Setup.exe`
- **Linux**: `dist/MindVault OS.AppImage`

## Project Structure

```
mindvault-os/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Home/unlock page
│   ├── dashboard/         # Activity dashboard
│   ├── search/            # Universal search
│   ├── passwords/         # Password manager
│   ├── notes/             # Notes vault
│   ├── files/             # File vault
│   ├── clipboard/         # Clipboard history
│   ├── terminal/          # Terminal logs
│   └── settings/          # Settings
├── lib/                   # Core library code
│   ├── crypto/            # Encryption (AES-256-GCM, Argon2)
│   ├── db/                # Database layer
│   ├── modules/           # Data collection modules
│   └── api/               # Local API server
├── electron/              # Electron main process
│   ├── main.js           # Main process
│   └── preload.js        # Preload script (IPC bridge)
├── browser-extension/     # Browser extension
│   └── chrome/           # Chrome/Firefox extension
└── components/           # Shared React components
```

## Technology Stack

### Core
- **Electron**: Desktop app framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS

### Encryption & Security
- **@noble/hashes**: Argon2ID key derivation
- **Node.js crypto**: AES-256-GCM encryption
- **better-sqlite3**: Fast SQLite database

### Backend
- **Express**: Local API server
- **CORS**: Restricted to localhost only

### Browser Extension
- **Manifest V3**: Modern extension API
- **Content scripts**: Page interaction
- **Service worker**: Background tasks

## Environment Variables

Create `.env.local` for custom configuration:

```env
# Database path (optional)
DB_PATH=/custom/path/to/mindvault.db

# API server port (optional, default: 37405)
API_PORT=37405

# Enable dev tools in production (optional)
ELECTRON_DEV_TOOLS=true
```

## Database Schema

The SQLite database includes these tables:

- `master_config`: Master password salt and verification
- `keystrokes`: Encrypted keystroke records
- `clipboard_history`: Encrypted clipboard entries
- `terminal_history`: Terminal commands and outputs
- `browser_history`: Browser URL logs
- `passwords`: Encrypted password vault
- `notes`: Encrypted notes
- `files`: File vault metadata
- `autofill_rules`: AutoFill configuration

All sensitive data is encrypted with AES-256-GCM using the master key.

## API Endpoints

Local API server (127.0.0.1:37405):

```
GET  /api/health                      # Health check
GET  /api/status                      # Lock status
POST /api/credentials/search          # Search credentials
GET  /api/credentials/:id             # Get credential
POST /api/autofill/rules              # Get AutoFill rules
POST /api/credentials/terminal        # Terminal credentials
```

## Browser Extension Development

### Loading Extension

**Chrome/Edge:**
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension/chrome`

**Firefox:**
1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `browser-extension/chrome/manifest.json`

### Testing Extension

1. Start MindVault OS desktop app
2. Unlock the vault
3. Navigate to a login page (e.g., github.com/login)
4. Press `Ctrl+Shift+A` or click extension icon
5. Credentials should auto-fill

## Debugging

### Electron Main Process

Add to `electron/main.js`:
```javascript
console.log('[Debug]', message);
```

Logs appear in terminal where you ran `npm run electron:dev`.

### Next.js Renderer

Use browser DevTools:
- Press `F12` or `Cmd+Option+I`
- Console tab shows logs
- Network tab shows API calls

### Database

Inspect database directly:
```bash
sqlite3 ~/Library/Application\ Support/mindvault-os/mindvault.db
.tables
SELECT * FROM master_config;
```

Note: Data is encrypted, so you'll see base64 strings.

## Testing

### Unit Tests (Coming Soon)
```bash
npm test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Initialize with master password
- [ ] Unlock/lock functionality
- [ ] Add password entry
- [ ] Search passwords
- [ ] Copy password to clipboard
- [ ] Browser extension loads
- [ ] AutoFill works on login page
- [ ] Terminal history records
- [ ] Clipboard history tracks
- [ ] Settings save properly
- [ ] Export backup
- [ ] Import backup

## Performance

- **Database**: SQLite with WAL mode for fast reads/writes
- **Encryption**: Minimal overhead with hardware AES acceleration
- **UI**: Next.js with React 18 for optimal rendering
- **Memory**: ~100-200 MB typical usage

## Security Considerations

1. **Master Password**: Use strong password (12+ characters, mixed types)
2. **Auto-lock**: Enable timeout in settings
3. **Backups**: Regular encrypted backups
4. **Extensions**: Only load official extension
5. **API Access**: Verify localhost-only binding

## Troubleshooting

### Database Locked Error
```
Solution: Ensure no other instances are running
```

### Native Module Errors
```bash
# Rebuild native modules
npm run postinstall
```

### Extension Not Connecting
```
Check:
1. Desktop app is running
2. Vault is unlocked
3. API server started (check logs)
4. Port 37405 is available
```

### Build Errors
```bash
# Clean and reinstall
rm -rf node_modules .next dist
npm install
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

MIT License - see LICENSE file

## Support

- Issues: GitHub Issues
- Documentation: README.md
- Security: Report privately to maintainers
