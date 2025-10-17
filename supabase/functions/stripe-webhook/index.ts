import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

// Get Stripe mode (test or live)
const stripeMode = Deno.env.get('STRIPE_MODE') || 'test'
const stripeSecretKey = stripeMode === 'live'
  ? Deno.env.get('STRIPE_SECRET_KEY_LIVE')
  : Deno.env.get('STRIPE_SECRET_KEY_TEST')

console.log(`🔑 Stripe webhook mode: ${stripeMode.toUpperCase()}`)

const stripe = new Stripe(stripeSecretKey ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

serve(async (req) => {
  try {
    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('Webhook event received:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'setup_intent.succeeded':
        await handleSetupIntentSucceeded(event.data.object as Stripe.SetupIntent)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Handle SetupIntent succeeded (recurring services)
 * Attach payment method to customer and set as default
 */
async function handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
  console.log('Processing SetupIntent:', setupIntent.id)

  const customerId = setupIntent.customer as string
  const paymentMethodId = setupIntent.payment_method as string
  const orderId = setupIntent.metadata?.order_id
  const orderNumber = setupIntent.metadata?.order_number

  if (!customerId || !paymentMethodId) {
    console.error('Missing customer or payment method ID')
    return
  }

  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    })

    console.log(`Payment method ${paymentMethodId} attached to customer ${customerId}`)

    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    console.log(`Set ${paymentMethodId} as default for customer ${customerId}`)

    // Update service order in Supabase if order_id provided
    if (orderId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase
        .from('service_orders')
        .update({
          stripe_payment_method_id: paymentMethodId,
          payment_status: 'authorized'
        })
        .eq('id', orderId)

      console.log(`Updated service order ${orderNumber || orderId} with payment method`)
    }

    console.log('SetupIntent processing complete')
  } catch (error) {
    console.error('Error processing SetupIntent:', error)
    throw error
  }
}

/**
 * Handle PaymentIntent succeeded (one-time services)
 * Update order payment status
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Processing PaymentIntent:', paymentIntent.id)

  const orderId = paymentIntent.metadata?.order_id
  const orderNumber = paymentIntent.metadata?.order_number

  if (!orderId) {
    console.log('No order_id in metadata, skipping')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('service_orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'paid',
        paid_amount: paymentIntent.amount / 100 // Convert from cents
      })
      .eq('id', orderId)

    console.log(`Updated service order ${orderNumber || orderId} as paid`)
  } catch (error) {
    console.error('Error processing PaymentIntent:', error)
    throw error
  }
}
