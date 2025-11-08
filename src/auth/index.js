/**
 * Shared Authentication Module
 * Provides SSO functionality across all Sailorskills services
 */

// Storage utilities
export { getCookie, setCookie, deleteCookie, customStorage } from './auth-storage.js'

// Supabase client
export { supabase, enableAuthDebug } from './supabase-client.js'

// Core auth functions
export {
  login,
  logout,
  getCurrentUser,
  getUserRole,
  getCurrentSession,
  isAuthenticated
} from './auth-core.js'

// Auth guards
export {
  requireAuth,
  requireCustomer,
  requireStaff,
  requireAdmin
} from './auth-guards.js'
