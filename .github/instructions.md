# GitHub Copilot Instructions for MindVault OS

## Repository Overview

MindVault OS is a local-only encrypted productivity system with keystroke memory, clipboard history, terminal recorder, and smart AutoFill capabilities. The application is built with:

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- **Desktop**: Electron
- **Database**: SQLite with better-sqlite3
- **Encryption**: AES-256-GCM with Argon2ID key derivation
- **Browser Extension**: Chrome/Firefox Manifest V3
- **Local API**: Express server (localhost only)

## Security-First Principles

**CRITICAL**: This is a security-focused application. All changes must maintain or improve security:

1. **Local-Only Operation**: All data processing must happen locally. Never introduce remote API calls, telemetry, or cloud dependencies unless explicitly requested and secured.

2. **Encryption Requirements**:
   - All sensitive data must be encrypted with AES-256-GCM
   - Master key must be derived using Argon2ID
   - Never store plaintext credentials, passwords, or sensitive data
   - Always use authenticated encryption (AES-GCM, not just AES)

3. **API Security**:
   - Local API server must only bind to `127.0.0.1` (localhost)
   - Never expose the API to external networks
   - Validate all API inputs
   - Use proper CORS configuration (localhost only)

4. **No Secrets in Code**:
   - Never hardcode passwords, API keys, or cryptographic keys
   - Use environment variables for configuration
   - Ensure `.env.local` is in `.gitignore`

5. **Sandboxing**:
   - Maintain Electron's `contextIsolation: true`
   - Keep `nodeIntegration: false` in renderer
   - Use IPC for controlled main/renderer communication

## Development Workflow

### Project Structure

```
MindVaultOS/
├── app/                    # Next.js pages (App Router)
│   ├── page.tsx           # Home/unlock page
│   ├── dashboard/         # Dashboard pages
│   ├── passwords/         # Password manager
│   ├── notes/             # Notes vault
│   └── settings/          # Settings
├── lib/                   # Core library code
│   ├── crypto/            # Encryption modules
│   ├── db/                # Database layer
│   ├── modules/           # Data collection modules
│   └── api/               # Local API server
├── electron/              # Electron main process
│   ├── main.js           # Main process
│   └── preload.js        # Preload/IPC bridge
└── browser-extension/     # Browser extensions
    └── chrome/           # Chrome/Firefox extension
```

### Build & Test Commands

```bash
# Development
npm run dev              # Next.js dev server only
npm run electron:dev     # Full Electron + Next.js app

# Production
npm run build            # Build Next.js
npm run electron:build   # Package Electron app

# Linting
npm run lint            # ESLint
```

### Before Making Changes

1. **Understand the Context**: Read relevant documentation in README.md, DEVELOPMENT.md, and IMPLEMENTATION_SUMMARY.md
2. **Check Existing Patterns**: Look at similar existing code before implementing new features
3. **Test Locally**: Always test changes with `npm run electron:dev` for full integration testing

## Code Style & Conventions

### TypeScript

- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use strict type checking
- Avoid `any` types - use `unknown` or proper types

### React Components

- Use functional components with hooks
- Prefer named exports for components
- Use TypeScript interfaces for props
- Follow existing component patterns in `app/` directory

### File Organization

- Keep files focused and single-purpose
- Place shared utilities in `lib/`
- Component-specific code stays with components
- Encryption code belongs in `lib/crypto/`
- Database operations in `lib/db/`

### Naming Conventions

- **Files**: `kebab-case.ts` or `kebab-case.tsx`
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## Testing Guidelines

### Manual Testing Checklist

When making changes, test these core flows:

1. **Initialization**: Master password setup
2. **Unlock/Lock**: Vault locking mechanism
3. **Data Storage**: Ensure encryption works
4. **API Communication**: Desktop <-> Browser extension
5. **AutoFill**: Browser extension functionality

### Areas That Need Tests

- Encryption/decryption functions (critical!)
- Database operations
- Key derivation
- API endpoints
- AutoFill logic

## Common Tasks & Patterns

### Adding a New Database Table

1. Update schema in `lib/db/encrypted-db.ts`
2. Add migration logic
3. Implement CRUD operations
4. Ensure proper encryption/decryption
5. Add API endpoints if needed

### Adding a New API Endpoint

1. Add route in `lib/api/local-server.ts`
2. Implement localhost-only middleware check
3. Validate input parameters
4. Handle errors properly
5. Document the endpoint

### Adding UI Pages

1. Create page in `app/` directory (App Router)
2. Use existing components from shared location
3. Follow Tailwind CSS patterns used in project
4. Ensure responsive design
5. Test in Electron window

### Working with Encryption

```typescript
// Always use the encryption utilities
import { encrypt, decrypt } from '@/lib/crypto/aes-encryption';
import { deriveMasterKey } from '@/lib/crypto/key-derivation';

// Encrypt sensitive data
const encrypted = encrypt(plaintext, masterKey);

// Decrypt when needed
const plaintext = decrypt(encrypted, masterKey);
```

## Dependencies

### Adding New Dependencies

1. **Check Security**: Audit new packages for vulnerabilities
2. **Minimize Additions**: Only add truly necessary dependencies
3. **Consider Bundle Size**: Especially for browser extension
4. **Native Modules**: Be cautious - may require rebuild for Electron

### Current Key Dependencies

- `next`: React framework
- `electron`: Desktop app framework
- `better-sqlite3`: Database
- `@noble/hashes`: Cryptographic hashing
- `express`: Local API server
- `tailwindcss`: CSS framework

## Browser Extension Development

The extension uses Manifest V3:

- **Background**: Service worker pattern
- **Content Scripts**: Inject into web pages
- **Communication**: Message passing with desktop app
- **Security**: CSP policies, limited permissions

## Common Pitfalls to Avoid

1. **Don't** add telemetry or analytics
2. **Don't** introduce external API calls without explicit requirement
3. **Don't** store sensitive data in plaintext
4. **Don't** break the localhost-only API restriction
5. **Don't** add unnecessary npm packages
6. **Don't** modify build configuration without good reason
7. **Don't** remove or weaken existing security measures

## Documentation

When making significant changes:

1. Update README.md if user-facing features change
2. Update DEVELOPMENT.md for developer workflow changes
3. Add inline comments for complex logic
4. Document API endpoints
5. Update this instructions file if adding new patterns

## Git Workflow

- Keep commits focused and atomic
- Write clear commit messages
- Reference issue numbers in commits
- Don't commit sensitive data or credentials
- Ensure `.gitignore` excludes build artifacts and dependencies

## Questions to Ask When Reviewing Code Changes

1. Does this maintain local-only operation?
2. Is sensitive data properly encrypted?
3. Are there any security vulnerabilities?
4. Is the code following existing patterns?
5. Are types properly defined?
6. Will this work in both dev and production builds?
7. Does the Electron app still work correctly?
8. Does the browser extension still communicate properly?

## Resources

- **Main README**: Comprehensive feature documentation
- **DEVELOPMENT.md**: Development setup and workflows
- **IMPLEMENTATION_SUMMARY.md**: Technical architecture details

## Task Complexity Guidelines

### Good Tasks for Copilot Agent

- Bug fixes in existing modules
- Adding new UI components following existing patterns
- Implementing new database tables with encryption
- Adding new API endpoints
- Documentation updates
- Code refactoring
- Adding tests

### Tasks Requiring Human Oversight

- Major architectural changes
- Modifying encryption algorithms
- Changing API security policies
- Altering database encryption scheme
- Modifying Electron security settings
- Changes to browser extension manifest
- Release and deployment processes
