# @sailorskills/shared

Shared utilities and components for all Sailor Skills products.

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

## Styling

Import CSS in your HTML:
```html
<link rel="stylesheet" href="node_modules/@sailorskills/shared/src/ui/styles.css">
<link rel="stylesheet" href="node_modules/@sailorskills/shared/src/auth/styles.css">
```

Or import in your JS/CSS:
```javascript
import '@sailorskills/shared/src/ui/styles.css';
import '@sailorskills/shared/src/auth/styles.css';
```

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

## API Reference

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
- `createFormInput(options)` - Create form input
- `showToast(message, type, duration)` - Quick toast

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
