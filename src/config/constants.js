/**
 * Sailor Skills - Shared Constants and Configuration
 * Common configuration values used across all services
 */

/**
 * Service URLs
 * Note: These can be overridden by environment variables in each service
 */
export const SERVICES = {
  MAIN_SITE: 'https://www.sailorskills.com',
  DASHBOARD: 'https://sailorskills-dashboard.vercel.app',      // Business metrics and analytics
  BILLING: 'https://sailorskills-billing.vercel.app',          // Payment processing and invoicing
  OPERATIONS: 'https://sailorskills-operations.vercel.app',    // Field operations (was Portal, includes Schedule)
  CUSTOMERS: 'https://sailorskills-customers.vercel.app',      // Customer-facing portal
  INVENTORY: 'https://sailorskills-inventory.vercel.app',      // Parts and supply tracking
  ESTIMATOR: 'https://sailorskills-estimator.vercel.app',      // Customer quotes
  VIDEO: 'https://sailorskills-video.vercel.app',              // Video management

  // Legacy aliases (for backwards compatibility - remove after migration)
  ADMIN: 'https://sailorskills-dashboard.vercel.app',
  PORTAL: 'https://sailorskills-operations.vercel.app',
  SCHEDULE: 'https://sailorskills-operations.vercel.app'
};

/**
 * Business Constants
 */
export const BUSINESS = {
  NAME: 'Sailor Skills',
  MINIMUM_SERVICE_FEE: 150, // $150 minimum for all services
  DEFAULT_CURRENCY: 'USD',
  TIMEZONE: 'America/Los_Angeles', // Pacific Time
  SUPPORT_EMAIL: 'support@sailorskills.com',
  PHONE: '+1 (XXX) XXX-XXXX' // Update with actual phone
};

/**
 * Session Storage Keys
 * Standardized keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  AUTH_SESSION: 'sailorskills_auth_session',
  USER_PREFERENCES: 'sailorskills_user_prefs',
  CART: 'sailorskills_cart',
  LAST_ESTIMATE: 'sailorskills_last_estimate'
};

/**
 * Service Types/Categories
 */
export const SERVICE_TYPES = {
  DIVING: 'diving',
  RIGGING: 'rigging',
  SAILING: 'sailing',
  MAINTENANCE: 'maintenance',
  TRAINING: 'training'
};

/**
 * Boat Types
 */
export const BOAT_TYPES = {
  SAILBOAT: 'sailboat',
  POWERBOAT: 'powerboat',
  CATAMARAN: 'catamaran',
  TRIMARAN: 'trimaran',
  MONOHULL: 'monohull'
};

/**
 * Payment Status
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

/**
 * API Endpoints
 * Base paths for common API endpoints
 */
export const API_ENDPOINTS = {
  CUSTOMERS: '/api/customers',
  INVOICES: '/api/invoices',
  PAYMENTS: '/api/payments',
  ESTIMATES: '/api/estimates',
  BOOKINGS: '/api/bookings'
};

/**
 * Regex Patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?1?\d{10,14}$/,
  BOAT_LENGTH: /^\d{1,3}(\.\d{1,2})?$/
};

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'h:mm A',
  DATETIME: 'MM/DD/YYYY h:mm A',
  ISO: 'YYYY-MM-DD'
};

/**
 * Environment helper functions
 */
export const ENV = {
  /**
   * Get Supabase URL from environment
   * @returns {string} Supabase URL
   */
  getSupabaseUrl() {
    return import.meta.env?.VITE_SUPABASE_URL ||
           process.env?.VITE_SUPABASE_URL ||
           '';
  },

  /**
   * Get Supabase Anon Key from environment
   * @returns {string} Supabase anon key
   */
  getSupabaseAnonKey() {
    return import.meta.env?.VITE_SUPABASE_ANON_KEY ||
           process.env?.VITE_SUPABASE_ANON_KEY ||
           '';
  },

  /**
   * Get Stripe Publishable Key from environment
   * @returns {string} Stripe publishable key
   */
  getStripeKey() {
    return import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY ||
           process.env?.VITE_STRIPE_PUBLISHABLE_KEY ||
           '';
  },

  /**
   * Check if in production
   * @returns {boolean} True if production
   */
  isProduction() {
    return import.meta.env?.MODE === 'production' ||
           process.env?.NODE_ENV === 'production';
  },

  /**
   * Check if in development
   * @returns {boolean} True if development
   */
  isDevelopment() {
    return import.meta.env?.MODE === 'development' ||
           process.env?.NODE_ENV === 'development';
  }
};

/**
 * Validation helpers
 */
export const VALIDATORS = {
  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    return PATTERNS.EMAIL.test(email);
  },

  /**
   * Validate phone number
   * @param {string} phone - Phone to validate
   * @returns {boolean} True if valid
   */
  isValidPhone(phone) {
    return PATTERNS.PHONE.test(phone);
  },

  /**
   * Validate boat length
   * @param {number|string} length - Boat length in feet
   * @returns {boolean} True if valid
   */
  isValidBoatLength(length) {
    const num = parseFloat(length);
    return !isNaN(num) && num > 0 && num < 500;
  }
};

/**
 * Format helpers
 */
export const FORMATTERS = {
  /**
   * Format currency amount
   * @param {number} amount - Amount in dollars
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency string
   */
  currency(amount, currency = BUSINESS.DEFAULT_CURRENCY) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  /**
   * Format phone number
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  phone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },

  /**
   * Format date
   * @param {Date|string} date - Date to format
   * @param {string} format - Format type (SHORT, LONG, etc.)
   * @returns {string} Formatted date string
   */
  date(date, format = 'SHORT') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const pad = (n) => n.toString().padStart(2, '0');

    switch (format) {
      case 'SHORT':
        return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
      case 'LONG':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'ISO':
        return d.toISOString().split('T')[0];
      default:
        return d.toLocaleDateString();
    }
  }
};

export default {
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
};
