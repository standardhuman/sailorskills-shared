/**
 * BCC Lookup Utility
 *
 * Gets BCC email address for a service with fallback to ENV variable.
 * Used by edge functions across all services.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Get BCC address for a service with fallback
 * @param {string} serviceName - 'operations', 'billing', 'booking', 'portal', 'settings', 'shared'
 * @returns {Promise<string|null>} BCC email address or null
 */
export async function getBccAddress(serviceName) {
  try {
    // Create Supabase client (for Deno edge functions)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('[BCC] Missing Supabase credentials, using ENV fallback');
      return getEnvFallback(serviceName);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check database for service-specific BCC
    const { data, error } = await supabase
      .from('email_bcc_settings')
      .select('bcc_address, is_active')
      .eq('service_name', serviceName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn(`[BCC] Database query failed for ${serviceName}:`, error.message);
      return getEnvFallback(serviceName);
    }

    if (data && data.bcc_address) {
      console.log(`[BCC] ${serviceName}: ${data.bcc_address} (from database)`);
      return data.bcc_address;
    }

    // 2. No database entry found, use ENV fallback
    return getEnvFallback(serviceName);

  } catch (err) {
    console.error(`[BCC] Error getting BCC for ${serviceName}:`, err);
    return getEnvFallback(serviceName);
  }
}

/**
 * Get BCC from ENV variable (fallback)
 * @param {string} serviceName - Service name for logging
 * @returns {string|null} BCC email from ENV or null
 */
function getEnvFallback(serviceName) {
  const envBcc = Deno.env.get('EMAIL_BCC_ADDRESS');
  if (envBcc) {
    console.log(`[BCC] ${serviceName}: ${envBcc} (from ENV fallback)`);
    return envBcc;
  }
  console.warn(`[BCC] ${serviceName}: No BCC configured (database or ENV)`);
  return null;
}
