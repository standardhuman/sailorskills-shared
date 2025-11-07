import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

// Get Stripe mode (test or live)
const stripeMode = Deno.env.get('STRIPE_MODE') || 'test'
const stripeSecretKey = stripeMode === 'live'
  ? Deno.env.get('STRIPE_SECRET_KEY_LIVE')
  : Deno.env.get('STRIPE_SECRET_KEY_TEST')

console.log(`🔑 Stripe mode: ${stripeMode.toUpperCase()}`)

const stripe = new Stripe(stripeSecretKey ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const allowedOrigins = [
  'https://portal.sailorskills.com',
  'https://sailorskills-portal.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { customerId } = await req.json()

    if (!customerId) {
      throw new Error('Customer ID is required')
    }

    console.log(`Creating customer portal session for customer: ${customerId}`)

    // Get customer's stripe_customer_id from database
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('stripe_customer_id, email')
      .eq('id', customerId)
      .single()

    if (customerError) {
      console.error('Error fetching customer:', customerError)
      throw new Error('Customer not found')
    }

    if (!customer?.stripe_customer_id) {
      console.error('No Stripe customer ID found for customer:', customerId)
      throw new Error('No payment method on file. Please contact support to set up billing.')
    }

    console.log(`Found Stripe customer: ${customer.stripe_customer_id} for ${customer.email}`)

    // Create Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${origin}/portal-invoices.html`,
    })

    console.log(`Customer portal session created: ${session.id}`)

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error creating customer portal session:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create portal session' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
