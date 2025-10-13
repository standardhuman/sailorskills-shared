/**
 * Add Sample Test Data for Smart Billing (Non-interactive)
 * Usage: node add-sample-data-auto.js <customer_id>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMultipleSampleServices(customerId) {
    console.log('🚀 Add Multiple Sample Services');
    console.log('================================\n');
    console.log(`Customer ID: ${customerId}\n`);

    const services = [
        {
            customer_id: customerId,
            service_type: 'recurring_cleaning',
            service_name: 'Recurring Cleaning and Anodes - Two Months',
            frequency: 'two_months',
            boat_length: 35,
            base_price: 250.00,
            includes_anodes: true,
            status: 'active'
        },
        {
            customer_id: customerId,
            service_type: 'recurring_cleaning',
            service_name: 'Recurring Cleaning - Monthly',
            frequency: 'monthly',
            boat_length: 35,
            base_price: 150.00,
            includes_anodes: false,
            status: 'paused'
        },
        {
            customer_id: customerId,
            service_type: 'recurring_cleaning',
            service_name: 'Recurring Cleaning and Anodes - Monthly',
            frequency: 'monthly',
            boat_length: 42,
            base_price: 300.00,
            includes_anodes: true,
            status: 'active'
        }
    ];

    console.log(`📝 Adding ${services.length} services...`);

    try {
        const { data, error } = await supabase
            .from('customer_services')
            .insert(services)
            .select();

        if (error) {
            console.error('❌ Error adding services:', error.message);
            process.exit(1);
        }

        console.log(`\n✅ ${data.length} services added successfully!`);
        data.forEach((service, idx) => {
            console.log(`${idx + 1}. [ID: ${service.id}] ${service.service_name} (${service.status})`);
        });
        console.log('\n💡 You can now test the smart billing flow with this customer.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get customer ID from command line argument
const customerId = process.argv[2] || 'cus_test_sailorskills_123';

if (!customerId.startsWith('cus_')) {
    console.error('❌ Invalid customer ID. Must start with "cus_"');
    console.log('Usage: node add-sample-data-auto.js <customer_id>');
    process.exit(1);
}

addMultipleSampleServices(customerId).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
