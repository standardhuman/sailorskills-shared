import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const allowedOrigins = [
  'https://cost-calculator-sigma.vercel.app',
  'https://sailorskills-estimator.vercel.app',
  'https://sailorskills-estimator-309d9lol8-brians-projects-bc2d3592.vercel.app',
  'https://diving.sailorskills.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5175'
]

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe mode (test or live)
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test'
    const publishableKey = stripeMode === 'live'
      ? Deno.env.get('STRIPE_PUBLISHABLE_KEY_LIVE')
      : Deno.env.get('STRIPE_PUBLISHABLE_KEY_TEST')

    console.log(`🔑 Serving Stripe config - Mode: ${stripeMode.toUpperCase()}`)

    return new Response(
      JSON.stringify({
        publishableKey,
        mode: stripeMode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
