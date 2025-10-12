/**
 * Supabase client initialization
 * Shared across all Sailor Skills products
 */

import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

/**
 * Initialize Supabase client
 * @param {string} url - Supabase project URL
 * @param {string} anonKey - Supabase anonymous key
 * @returns {object} Supabase client instance
 */
export function initSupabase(url, anonKey) {
  if (!url || !anonKey) {
    console.warn('Supabase configuration is missing. Please check your environment variables.');
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, anonKey);
  }

  return supabaseInstance;
}

/**
 * Get existing Supabase client instance
 * @returns {object|null} Supabase client instance or null if not initialized
 */
export function getSupabase() {
  if (!supabaseInstance) {
    console.warn('Supabase client not initialized. Call initSupabase() first.');
  }
  return supabaseInstance;
}

/**
 * Create Supabase client from environment variables
 * Supports both Vite (import.meta.env) and standard (process.env)
 * @returns {object} Supabase client instance
 */
export function createSupabaseClient() {
  // Support both Vite and Node.js environments
  const url = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
               (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '';

  const anonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
                  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '';

  return initSupabase(url, anonKey);
}

// Export singleton instance
export const supabase = createSupabaseClient();
