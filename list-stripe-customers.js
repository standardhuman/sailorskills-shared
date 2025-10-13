/**
 * List Stripe Customers
 * Shows recent customers to help select one for testing
 */

import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in .env');
    process.exit(1);
}

const stripe = new Stripe(stripeKey);

async function listCustomers() {
    console.log('🔍 Fetching recent Stripe customers...\n');

    try {
        const customers = await stripe.customers.list({
            limit: 10
        });

        if (customers.data.length === 0) {
            console.log('❌ No customers found');
            return;
        }

        console.log(`Found ${customers.data.length} customers:\n`);

        customers.data.forEach((customer, idx) => {
            console.log(`${idx + 1}. ${customer.id}`);
            console.log(`   Name: ${customer.name || 'N/A'}`);
            console.log(`   Email: ${customer.email || 'N/A'}`);
            console.log(`   Created: ${new Date(customer.created * 1000).toLocaleDateString()}`);
            console.log('');
        });

        console.log('💡 Copy a customer ID and run:');
        console.log('   node quick-add-service.js [customer_id]');

    } catch (error) {
        console.error('❌ Error fetching customers:', error.message);
    }
}

listCustomers();
