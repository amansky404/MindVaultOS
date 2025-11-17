# MindVault OS

**Local-only encrypted productivity system with keystroke memory, clipboard history, terminal recorder, and smart AutoFill.**

---

## 🔐 Overview

MindVault OS is a comprehensive, **local-only** productivity and security system that runs entirely on your device. All data is encrypted with **AES-256-GCM** using an **Argon2ID** derived master key. No cloud, no remote logging, no data leaves your device unless you explicitly enable it.

### Core Features

- **🔑 Encrypted Database**: SQLite with AES-256-GCM encryption
- **💾 Data Collection Modules**:
  - Keystroke memory (excludes password fields)
  - Clipboard history tracking
  - Terminal command and output recorder
  - Browser URL logger
- **📊 Next.js Dashboard**: Modern web interface for managing all data
- **🎯 Smart AutoFill Engine**:
  - Browser extension (Chrome/Firefox)
  - Desktop app AutoType
  - Terminal AutoFill (SSH, sudo, git, database logins)
  - Human-like typing simulation
  - Multi-step login support
- **🔒 Security First**:
  - Local API (127.0.0.1 only)
  - Sandboxed execution
  - No remote logging
  - Optional manual cloud sync

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/amansky404/credsManagerkeyClip.git
cd credsManagerkeyClip

# Install dependencies
npm install

# Start development
npm run electron:dev
```

### First Run

1. Launch MindVault OS
2. Set your master password (minimum 8 characters)
3. **Remember this password** - it cannot be recovered!
4. Your vault is now initialized and encrypted

---

## 📦 Project Structure

```
mindvault-os/
├── lib/
│   ├── crypto/              # Encryption modules
│   │   ├── key-derivation.ts    # Argon2ID key derivation
│   │   └── aes-encryption.ts    # AES-256-GCM encryption
│   ├── db/                  # Database layer
│   │   └── encrypted-db.ts      # Encrypted SQLite wrapper
│   ├── modules/             # Data collection modules
│   │   ├── keystroke-memory.ts
│   │   ├── clipboard-history.ts
│   │   ├── terminal-history.ts
│   │   ├── browser-history.ts
│   │   ├── password-manager.ts
│   │   └── notes-vault.ts
│   └── api/                 # Local API server
│       ├── local-server.ts      # Express API (127.0.0.1 only)
│       └── autofill-engine.ts   # AutoFill logic
├── electron/                # Electron main process
│   ├── main.js
│   └── preload.js
├── app/                     # Next.js pages
│   ├── page.tsx             # Home/unlock page
│   ├── layout.tsx
│   └── globals.css
├── browser-extension/       # Browser extensions
│   └── chrome/              # Chrome/Edge extension
│       ├── manifest.json
│       ├── background.js
│       ├── content.js
│       ├── popup.html
│       └── popup.js
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database path (optional, defaults to app data directory)
DB_PATH=/path/to/mindvault.db

# API server port (optional, defaults to 37405)
API_PORT=37405
```

---

## 🎯 Features in Detail

### 1. Keystroke Memory

Records what you type (excluding password fields) for later search and retrieval.

**Security:**
- Automatically excludes password fields
- Encrypted at rest
- Only accessible when vault is unlocked

### 2. Clipboard History

Tracks clipboard changes with full history.

**Features:**
- Unlimited history (configurable)
- Search and filter
- Quick restore
- Encrypted storage

### 3. Terminal Recorder

Records terminal commands and their outputs.

**Features:**
- Command history with outputs
- Exit codes tracking
- Working directory context
- Shell identification

### 4. Browser URL Logger

Logs browser visits for personal analytics.

**Features:**
- Visit counting
- Title tracking
- Search functionality
- Privacy-focused (local only)

### 5. Password Manager

Secure password storage with AutoFill capabilities.

**Features:**
- AES-256-GCM encrypted passwords
- Password generator (coming soon)
- AutoFill configuration per entry
- Multi-step login support
- Category organization
- Tags and notes

### 6. Notes Vault

Encrypted note storage.

**Features:**
- Rich text support (coming soon)
- Categories and tags
- Full-text search
- Export/import (encrypted)

### 7. Smart AutoFill

Intelligent credential filling across platforms.

**Browser AutoFill:**
- Chrome/Firefox extension
- Hotkey: `Ctrl+Shift+A`
- Human-like typing simulation
- Auto-detect login forms
- Visual indicators

**Desktop AutoType:**
- Global hotkey: `Ctrl+Alt+A`
- Cross-application support
- Field mapping

**Terminal AutoFill:**
- SSH credentials
- sudo passwords
- Git authentication
- Database logins

---

## 🔒 Security Architecture

### Encryption

**Master Key Derivation:**
```
User Password → Argon2ID(password, salt, params) → 256-bit Master Key
```

**Parameters:**
- Memory: 64 MB
- Time cost: 3 iterations
- Parallelism: 4 threads

**Data Encryption:**
```
Plaintext → AES-256-GCM(plaintext, masterKey) → {iv, authTag, ciphertext}
```

### Local API Security

The API server only listens on `127.0.0.1` (localhost):

```typescript
// Middleware blocks non-localhost requests
app.use((req, res, next) => {
  const clientIP = req.ip || req.socket.remoteAddress;
  if (clientIP !== '127.0.0.1' && clientIP !== '::1') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});
```

### Sandboxing

- Electron app with `contextIsolation: true`
- No `nodeIntegration` in renderer
- IPC for controlled communication
- CSP headers (coming soon)

---

## 🌐 Browser Extension

### Installation

**Chrome/Edge:**
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `browser-extension/chrome` folder

**Firefox:**
1. Go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest.json` from `browser-extension/chrome`

### Usage

1. Ensure MindVault OS is running and unlocked
2. Navigate to a login page
3. Press `Ctrl+Shift+A` or click the 🔐 icon
4. Credentials are filled with human-like typing

---

## ⌨️ Global Hotkeys

| Hotkey | Action |
|--------|--------|
| `Ctrl+Alt+A` | Smart AutoFill (desktop) |
| `Ctrl+Alt+S` | Universal Search |
| `Ctrl+Alt+L` | Lock Vault |
| `Ctrl+Shift+A` | Browser AutoFill |

---

## 🛠️ Development

### Build Commands

```bash
# Development
npm run dev              # Next.js dev server
npm run electron:dev     # Electron + Next.js

# Production
npm run build            # Build Next.js
npm run electron:build   # Package Electron app

# Linting
npm run lint
```

### Testing

```bash
# Unit tests (coming soon)
npm test

# E2E tests (coming soon)
npm run test:e2e
```

---

## 📊 Dashboard Pages

### Home
- Overview and quick stats
- Module access grid
- Status indicators

### Universal Search
- Search across all modules
- Real-time results
- Category filtering

### Password Manager
- Add/edit/delete passwords
- Search and filter
- AutoFill configuration

### Notes Vault
- Create and organize notes
- Rich text editor
- Tags and categories

### Clipboard History
- View clipboard timeline
- Search contents
- Quick restore

### Terminal Logs
- Command history
- Output viewing
- Exit code tracking

### Settings
- Master password change
- Module toggles
- AutoFill configuration
- Export/import data

---

## 🔐 Security Best Practices

1. **Use a Strong Master Password**: Minimum 12 characters, mix of types
2. **Regular Backups**: Export encrypted backups periodically
3. **Lock When Away**: Use `Ctrl+Alt+L` to lock vault
4. **Review Extensions**: Only install from official sources
5. **Keep Updated**: Update MindVault OS regularly

---

## 🚨 Security Warnings

- **Master password is unrecoverable**: There is NO password reset. Keep it safe!
- **Local only by default**: No cloud backup unless you enable it manually
- **Extension security**: Only use the official browser extension
- **API localhost only**: Never expose the API beyond 127.0.0.1

---

## 📝 Privacy Statement

MindVault OS is designed with privacy as the top priority:

- ✅ **100% local processing**: All data stays on your device
- ✅ **No telemetry**: We don't track anything
- ✅ **No network calls**: Except when you explicitly enable sync
- ✅ **Open source**: Audit the code yourself
- ✅ **Encrypted at rest**: AES-256-GCM for all sensitive data
- ✅ **Encrypted in memory**: Master key cleared on lock

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon).

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **Argon2**: Password hashing algorithm
- **AES-GCM**: Authenticated encryption
- **SQLite**: Database engine
- **Electron**: Cross-platform desktop apps
- **Next.js**: React framework
- **TypeScript**: Type safety

---

## 🔮 Roadmap

- [ ] Mobile apps (iOS/Android)
- [ ] Password strength analyzer
- [ ] Password generator
- [ ] 2FA/TOTP support
- [ ] Biometric unlock
- [ ] File encryption module
- [ ] End-to-end encrypted sync (optional)
- [ ] Audit logs
- [ ] Auto-backup scheduler
- [ ] Dark/light theme toggle
- [ ] Rich text editor for notes
- [ ] Command palette
- [ ] Plugins system

---

## 💡 Use Cases

- Personal password management
- Development credential storage
- Command-line workflow automation
- Research note-taking
- Secure clipboard management
- Terminal session recording
- Browser history tracking

---

## ⚠️ Disclaimer

MindVault OS is provided as-is for personal use. The developers are not responsible for any data loss. Always maintain backups of critical data.

---

## 📧 Support

For issues, feature requests, or questions:
- GitHub Issues: [github.com/amansky404/credsManagerkeyClip/issues](https://github.com/amansky404/credsManagerkeyClip/issues)

---

**MindVault OS** - Your data, your device, your control. 🔐