import { createClient } from '@supabase/supabase-js'
import { customStorage } from './auth-storage.js'

// Environment variables will be provided by each service
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration. Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
}

/**
 * Shared Supabase client configured for SSO across subdomains
 */
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // More secure auth flow
    },
    cookieOptions: {
      name: 'sb-auth-token',
      domain: '.sailorskills.com', // KEY: Enables cross-subdomain SSO
      path: '/',
      sameSite: 'lax',
      maxAge: 604800 // 7 days
    }
  }
)

/**
 * Enable debug logging for auth events (dev only)
 */
export function enableAuthDebug() {
  if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth Debug]', event, {
        userId: session?.user?.id,
        expiresAt: session?.expires_at,
        email: session?.user?.email
      })
    })
  }
}
