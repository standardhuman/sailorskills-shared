# Sailor Skills Shared

Common utilities, authentication, and components shared across all Sailor Skills products.

## Overview

The Shared package contains all the code that multiple products need: authentication logic, UI components, database utilities, and configuration. This prevents code duplication and ensures consistency across the suite.

## What's Included

### Authentication
- Supabase client initialization
- Login/logout flows
- Session management
- Token handling
- Role-based access control
- Password reset

### UI Components
- Buttons (primary, secondary, danger)
- Form inputs (text, email, tel, etc.)
- Modals and dialogs
- Navigation headers
- Loading states
- Toast notifications
- Error boundaries

### Database Utilities
- Supabase query helpers
- Common table operations (CRUD)
- Transaction wrappers
- Error handling
- Connection pooling

### API Clients
- Stripe integration helpers
- Google Calendar utilities
- Email service wrappers
- HTTP request helpers

### Configuration
- Environment variable loading
- Feature flags
- API endpoint configuration
- Theme/styling constants

### Validation
- Form validation rules
- Data sanitization
- Input formatters (phone, currency, etc.)
- Error messages

## Tech Stack

- **Language**: JavaScript (ES6+)
- **Package Manager**: npm
- **Distribution**: Private npm package or git submodule
- **Testing**: Jest

## Project Structure

```
shared/
├── src/
│   ├── auth/
│   │   ├── supabase.js
│   │   ├── login.js
│   │   └── session.js
│   ├── components/
│   │   ├── Button.js
│   │   ├── Modal.js
│   │   └── Form.js
│   ├── api/
│   │   ├── stripe.js
│   │   ├── calendar.js
│   │   └── email.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── helpers.js
│   └── config/
│       ├── constants.js
│       └── env.js
├── tests/
└── package.json
```

## Installation

### Option A: NPM Package (Recommended)
```bash
# In any product repo
npm install @sailorskills/shared@latest
```

### Option B: Git Submodule
```bash
# In any product repo
git submodule add https://github.com/standardhuman/sailorskills-shared shared
```

## Usage Example

```javascript
// Authentication
import { initSupabase, login, logout } from '@sailorskills/shared/auth';

const supabase = initSupabase();
await login(email, password);

// Components
import { Button, Modal } from '@sailorskills/shared/components';

<Button variant="primary" onClick={handleClick}>
  Save
</Button>

// Validation
import { validateEmail, formatPhone } from '@sailorskills/shared/utils';

if (!validateEmail(email)) {
  showError('Invalid email');
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for distribution
npm run build

# Publish to npm (private)
npm publish
```

## Versioning

Uses Semantic Versioning (SemVer):
- **Major**: Breaking changes (1.0.0 → 2.0.0)
- **Minor**: New features, backwards compatible (1.0.0 → 1.1.0)
- **Patch**: Bug fixes (1.0.0 → 1.0.1)

## Distribution Strategy

**Phase 1**: Git submodule
- Easy to set up
- Direct code access
- Manual updates per repo

**Phase 2**: Private npm package
- Version control
- Dependency management
- Automatic updates
- Better for production

## What Goes in Shared vs Product Repos

**✅ Shared:**
- Used by 2+ products
- No product-specific logic
- Generic, reusable code
- Configuration templates

**❌ Product Repos:**
- Product-specific business logic
- Unique UI flows
- Product-specific data models
- Feature implementations

## Examples of Shared Code

```javascript
// ✅ Good - Generic button component
export function Button({ variant, onClick, children }) { ... }

// ❌ Bad - Product-specific logic
export function CalculateDivingPrice(depth, time) { ... }
// ^ This belongs in estimator repo
```

## License

Private - Sailor Skills Commercial Product

## Contributing

When adding to shared:
1. Ensure it's needed by 2+ products
2. Keep it generic and configurable
3. Add tests
4. Update version number
5. Document in README
