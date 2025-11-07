import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

let pricingCache = null;
const CACHE_TTL = 30 * 1000; // 30 seconds (to see Settings changes quickly)

/**
 * Get pricing configuration (cached)
 * Used by Estimator, Billing, and other services
 */
export async function getPricingConfig() {
  if (!pricingCache || Date.now() - pricingCache.timestamp > CACHE_TTL) {
    const { data, error } = await supabase
      .from('business_pricing_config')
      .select('*');

    if (error) {
      console.error('Failed to fetch pricing config:', error);
      throw error;
    }

    // Convert array to flat object for easy access
    pricingCache = {
      data: data.reduce((acc, row) => {
        acc[row.config_key] = parseFloat(row.config_value);
        return acc;
      }, {}),
      timestamp: Date.now(),
    };
  }

  return pricingCache.data;
}

/**
 * Invalidate pricing cache
 * Called when pricing is updated
 */
export function invalidatePricingCache() {
  pricingCache = null;
}

/**
 * Subscribe to pricing changes (real-time)
 */
export function subscribeToPricingChanges(callback) {
  const channel = supabase
    .channel('pricing-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'business_pricing_config',
      },
      () => {
        invalidatePricingCache();
        callback();
      }
    )
    .subscribe();

  return channel;
}
