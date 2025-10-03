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
  createFormSelect,
  createHeroHeader,
  showToast
} from './ui/components.js';

// Navigation
export {
  createGlobalNav,
  createBreadcrumb,
  injectNavigation,
  initNavigation
} from './ui/navigation.js';

// Configuration & Constants
export {
  SERVICES,
  BUSINESS,
  STORAGE_KEYS,
  SERVICE_TYPES,
  BOAT_TYPES,
  PAYMENT_STATUS,
  API_ENDPOINTS,
  PATTERNS,
  DATE_FORMATS,
  ENV,
  VALIDATORS,
  FORMATTERS
} from './config/constants.js';

// Version
export const version = '0.1.0';
