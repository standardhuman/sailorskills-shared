/**
 * Check Boat Names in Stripe Metadata
 * Verifies which customers have boat_name in their metadata
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

async function checkBoatNames() {
    console.log('🚤 Checking for boat names in Stripe customer metadata...\n');

    try {
        // Get all customers (up to 100)
        const customers = await stripe.customers.list({
            limit: 100
        });

        if (customers.data.length === 0) {
            console.log('❌ No customers found');
            return;
        }

        console.log(`Checked ${customers.data.length} customers:\n`);

        let customersWithBoats = 0;
        let customersWithoutBoats = 0;

        customers.data.forEach((customer, idx) => {
            const boatName = customer.metadata?.boat_name;

            if (boatName) {
                customersWithBoats++;
                console.log(`✅ ${customer.id}`);
                console.log(`   Name: ${customer.name || 'N/A'}`);
                console.log(`   Email: ${customer.email || 'N/A'}`);
                console.log(`   🚤 Boat: ${boatName}`);
                if (customer.metadata.boat_length) {
                    console.log(`   📏 Length: ${customer.metadata.boat_length} ft`);
                }
                if (customer.metadata.boat_make) {
                    console.log(`   🏭 Make: ${customer.metadata.boat_make}`);
                }
                console.log('');
            } else {
                customersWithoutBoats++;
            }
        });

        console.log('═'.repeat(60));
        console.log(`📊 Summary:`);
        console.log(`   Customers with boat names: ${customersWithBoats}`);
        console.log(`   Customers without boat names: ${customersWithoutBoats}`);
        console.log(`   Total: ${customers.data.length}`);
        console.log('═'.repeat(60));

        if (customersWithBoats === 0) {
            console.log('\n⚠️  No customers have boat_name in metadata!');
            console.log('   The boat name search feature requires customers to have metadata.');
            console.log('\n💡 To add boat names to customers, you can:');
            console.log('   1. Update customer via Stripe Dashboard');
            console.log('   2. Use the Stripe API to add metadata');
            console.log('   3. Customers created through the admin UI should have this data');
        }

    } catch (error) {
        console.error('❌ Error fetching customers:', error.message);
    }
}

checkBoatNames();
