# @sailorskills/shared

Shared utilities, components, and design system for all Sailor Skills products.

> **Design Philosophy**: Clean, minimal, professional aesthetic inspired by the estimator service.
> **Brand Colors**: Blue-gray palette (#345475)
> **Typography**: Montserrat
> **Style**: Sharp corners, flat design, high contrast

## ⚠️ IMPORTANT: Production Security

**Before deploying to production**, you MUST:
1. Review and update database RLS (Row Level Security) policies
2. Run the production readiness check: `node check-production-ready.js`
3. See `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for complete details

Current development RLS policies are **TOO PERMISSIVE** for production use.

## Installation

### Option 1: npm Package (Recommended)
```bash
npm install @sailorskills/shared
```

### Option 2: Git Submodule
```bash
git submodule add https://github.com/standardhuman/sailorskills-shared.git shared
```

## Features

### 🔐 Authentication
Simple password-based auth with session management:
```javascript
import { SimpleAuth, createAuthModal } from '@sailorskills/shared';

const auth = new SimpleAuth({ sessionKey: 'my_app_session' });

// Check if authenticated
if (auth.isLoggedIn()) {
  // User is logged in
}

// Show login modal
const { password, modal } = await createAuthModal({
  title: '🔒 Login Required',
  subtitle: 'Enter password to continue'
});
```

### 🗄️ Supabase Integration
```javascript
import { createSupabaseClient, supabase } from '@sailorskills/shared';

// Initialize (auto-configured from env vars)
const client = createSupabaseClient();

// Or use singleton
const { data, error } = await supabase
  .from('table')
  .select('*');
```

### 💳 Stripe Integration
```javascript
import {
  initStripe,
  createCardElement,
  createPaymentIntent,
  confirmCardPayment
} from '@sailorskills/shared';

// Initialize Stripe
initStripe('pk_test_...');

// Create card element
const cardElement = createCardElement('#card-element');

// Process payment
const intent = await createPaymentIntent('/api/payment', { amount: 5000 });
const result = await confirmCardPayment(intent.clientSecret, cardElement);
```

### 🎨 UI Components
```javascript
import {
  createButton,
  createModal,
  createSpinner,
  showToast,
  createFormInput
} from '@sailorskills/shared';

// Button
const btn = createButton({
  text: 'Click Me',
  variant: 'primary',
  onClick: () => alert('Clicked!')
});

// Modal
const modal = createModal({
  title: 'Hello',
  content: 'Modal content here',
  size: 'medium'
});
modal.open();

// Toast notification
showToast('Success!', 'success', 3000);

// Form input
const input = createFormInput({
  type: 'email',
  label: 'Email Address',
  required: true
});
```

## Design System

### Styling

Import the design system CSS in your HTML:
```html
<!-- Design tokens (CSS variables) -->
<link rel="stylesheet" href="node_modules/@sailorskills/shared/src/ui/design-tokens.css">
<!-- Component styles -->
<link rel="stylesheet" href="node_modules/@sailorskills/shared/src/ui/styles.css">
<!-- Auth styles (if needed) -->
<link rel="stylesheet" href="node_modules/@sailorskills/shared/src/auth/styles.css">
```

Or import in your JS/CSS:
```javascript
import '@sailorskills/shared/src/ui/design-tokens.css';
import '@sailorskills/shared/src/ui/styles.css';
import '@sailorskills/shared/src/auth/styles.css';
```

### Design Tokens

The shared package provides CSS variables for consistent styling:

```css
/* Colors */
--ss-primary: #345475;           /* Brand blue-gray */
--ss-text-dark: #181818;         /* Primary text */
--ss-text-medium: #6d7b89;       /* Secondary text */

/* Typography */
--ss-font-primary: 'Montserrat', Arial, sans-serif;
--ss-text-base: 1rem;            /* 16px */
--ss-text-lg: 1.25rem;           /* 20px */
--ss-weight-normal: 400;

/* Spacing */
--ss-space-sm: 0.5rem;           /* 8px */
--ss-space-md: 1rem;             /* 16px */
--ss-space-lg: 1.5rem;           /* 24px */

/* Borders */
--ss-radius-none: 0px;           /* Sharp corners everywhere */
--ss-border: #d0d0d0;
```

**See `src/ui/design-tokens.css` for the complete list.**

### Brand Guidelines

#### Colors
- **Primary**: `#345475` (dark blue-gray) - Used for headers, primary actions
- **Text Dark**: `#181818` - Body text
- **Text Medium**: `#6d7b89` - Secondary text, subtitles
- **Accent Blue**: `#116DFF` - Highlights, borders
- **Background**: `#ffffff` (white) with `#fafafa` for subtle variation

#### Typography
- **Font**: Montserrat (primary), Arial (fallback)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Hero Size**: 100px (desktop), 64px (mobile)
- **Headings**: 20-40px range
- **Body**: 14-16px

#### Design Principles
- **Sharp Corners**: Use `border-radius: 0px` for buttons, inputs, cards
- **Flat Design**: Minimal shadows, avoid gradients
- **High Contrast**: Dark text on white backgrounds
- **Minimal**: Clean, spacious layouts with generous whitespace

## Environment Variables

Required for Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Required for Stripe:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Configuration & Constants

The shared package provides common constants and utilities:

```javascript
import {
  SERVICES,      // Service URLs
  BUSINESS,      // Business constants (minimum fee, etc.)
  STORAGE_KEYS,  // localStorage/sessionStorage keys
  ENV,           // Environment helpers
  VALIDATORS,    // Validation functions
  FORMATTERS     // Formatting helpers
} from '@sailorskills/shared';

// Example usage
const minFee = BUSINESS.MINIMUM_SERVICE_FEE; // $150
const isValid = VALIDATORS.isValidEmail('user@example.com');
const formatted = FORMATTERS.currency(1234.56); // "$1,234.56"
```

### Environment Variables

Use the `ENV` helper to access environment variables consistently:

```javascript
import { ENV } from '@sailorskills/shared';

const supabaseUrl = ENV.getSupabaseUrl();
const isProduction = ENV.isProduction();
```

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## API Reference

### Configuration & Constants
- `SERVICES` - Service URLs for all microservices
- `BUSINESS` - Business constants (minimum fee, currency, etc.)
- `STORAGE_KEYS` - Standardized storage keys
- `SERVICE_TYPES` - Service type constants
- `BOAT_TYPES` - Boat type constants
- `PAYMENT_STATUS` - Payment status constants
- `ENV.getSupabaseUrl()` - Get Supabase URL from env
- `ENV.getStripeKey()` - Get Stripe key from env
- `ENV.isProduction()` - Check if production
- `VALIDATORS.isValidEmail(email)` - Validate email
- `FORMATTERS.currency(amount)` - Format currency
- `FORMATTERS.phone(phone)` - Format phone number
- `FORMATTERS.date(date, format)` - Format date

### Authentication
- `SimpleAuth` - Auth class with session management
- `createAuthModal(options)` - Create login modal
- `showAuthError(errorDiv, passwordInput)` - Show auth error
- `closeAuthModal(modal)` - Close auth modal

### Supabase
- `initSupabase(url, key)` - Initialize client
- `getSupabase()` - Get client instance
- `createSupabaseClient()` - Auto-init from env
- `supabase` - Singleton instance

### Stripe
- `initStripe(publishableKey)` - Initialize Stripe
- `getStripe()` - Get Stripe instance
- `createCardElement(selector, style)` - Create card input
- `createPaymentIntent(url, data)` - Create payment
- `confirmCardPayment(secret, card, billing)` - Confirm payment
- `formatAmountForStripe(amount)` - Convert to cents
- `formatAmountFromStripe(amount)` - Convert to dollars

### UI Components
- `createButton(options)` - Create button
- `createModal(options)` - Create modal
- `createSpinner(options)` - Create loading spinner
- `createToast(options)` - Create toast notification
- `createFormInput(options)` - Create form text input
- `createFormSelect(options)` - Create form select/dropdown
- `createHeroHeader(options)` - Create hero header section
- `showToast(message, type, duration)` - Quick toast

### Navigation
- `createGlobalNav(options)` - Create navigation header HTML
- `createBreadcrumb(breadcrumbs)` - Create breadcrumb trail
- `injectNavigation(options)` - Inject nav into DOM
- `initNavigation(options)` - Initialize navigation for a page

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

## Best Practices

### What Goes in Shared vs Product Repos

**✅ Shared Package Should Contain:**
- UI components used by 2+ services
- Design system (colors, typography, spacing)
- Shared utilities (validation, formatting)
- Common constants (business rules, service URLs)
- Environment variable helpers
- Navigation components
- Authentication utilities
- API client wrappers (Supabase, Stripe)

**❌ Product Repos Should Contain:**
- Product-specific business logic
- Unique UI flows and features
- Product-specific data models
- Custom calculations (e.g., diving price calculator)
- Service-specific API endpoints
- Product-specific state management

### Examples

```javascript
// ✅ Good - Belongs in shared
export function createButton({ variant, onClick, text }) { ... }
export const BUSINESS = { MINIMUM_SERVICE_FEE: 150 };
export function formatCurrency(amount) { ... }

// ❌ Bad - Belongs in product repos
export function calculateDivingPrice(depth, time, hull) { ... }
export function DivingEstimateForm() { ... }
export const DIVING_SERVICES = ['hull-cleaning', 'zincs', ...];
```

### Environment Variables

Store common environment variable keys and helpers in shared:
- ✅ `ENV.getSupabaseUrl()` - Generic helper
- ✅ `STORAGE_KEYS.AUTH_SESSION` - Standardized key names
- ❌ Service-specific API endpoints - Keep in product repos

### Styling Best Practices

**Use the design system for consistency:**

```css
/* ✅ Good - Use CSS variables */
.my-component {
  color: var(--ss-primary);
  font-family: var(--ss-font-primary);
  padding: var(--ss-space-md);
  border-radius: var(--ss-radius-none);
}

/* ❌ Bad - Hardcoded values */
.my-component {
  color: #345475;
  font-family: 'Montserrat';
  padding: 16px;
  border-radius: 8px; /* Should be 0px for Sailor Skills */
}
```

**Component classes:**
- Use `ss-` prefix for shared components
- Use shared components via JavaScript exports when possible
- Add service-specific styles in product repos

### Version Control

When adding to shared:
1. Ensure it's needed by 2+ products (or will be soon)
2. Keep it generic and configurable
3. Add tests if applicable
4. Update version number (semver)
5. Update README with examples
6. Test in at least one service before pushing

## License

Private - Sailor Skills Commercial Product

## Contributing

When adding to shared:
1. Ensure it's needed by 2+ products
2. Keep it generic and configurable
3. Add tests
4. Update version number
5. Document in README
