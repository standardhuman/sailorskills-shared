/**
 * Sailor Skills Shared Package
 * Common utilities and components for all products
 */

// Supabase utilities
export {
  initSupabase,
  getSupabase,
  createSupabaseClient,
  supabase
} from './supabase/client.js';

// Authentication
export {
  SimpleAuth,
  createAuthModal,
  showAuthError,
  closeAuthModal
} from './auth/auth.js';

// Stripe utilities
export {
  initStripe,
  getStripe,
  createElements,
  createCardElement,
  createPaymentIntent,
  confirmCardPayment,
  handleCardErrors,
  formatAmountForStripe,
  formatAmountFromStripe
} from './stripe/client.js';

// UI Components
export {
  createButton,
  createModal,
  createSpinner,
  createToast,
  createFormInput,
  showToast
} from './ui/components.js';

// Navigation
export {
  createGlobalNav,
  createBreadcrumb,
  injectNavigation,
  initNavigation
} from './ui/navigation.js';

// Version
export const version = '0.1.0';
