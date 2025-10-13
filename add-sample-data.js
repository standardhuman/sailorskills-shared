/**
 * Add Sample Test Data for Smart Billing
 * Creates test customer services for development and testing
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function addSampleService() {
    console.log('🚀 Add Sample Customer Service');
    console.log('================================\n');

    // Get customer ID from user
    const customerId = await question('Enter Stripe Customer ID (e.g., cus_xxx): ');

    if (!customerId || !customerId.startsWith('cus_')) {
        console.log('❌ Invalid customer ID. Must start with "cus_"');
        rl.close();
        return;
    }

    // Sample service data
    const sampleService = {
        customer_id: customerId,
        service_type: 'recurring_cleaning',
        service_name: 'Recurring Cleaning and Anodes - Two Months',
        frequency: 'two_months',
        boat_length: 35,
        base_price: 250.00,
        includes_anodes: true,
        twin_engines: false,
        hull_type: 'monohull',
        boat_type: 'sailboat',
        status: 'active'
    };

    console.log('\n📝 Service details:');
    console.log(JSON.stringify(sampleService, null, 2));
    console.log('');

    const confirm = await question('Add this service? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        rl.close();
        return;
    }

    try {
        const { data, error } = await supabase
            .from('customer_services')
            .insert(sampleService)
            .select()
            .single();

        if (error) {
            console.error('❌ Error adding service:', error.message);
            rl.close();
            return;
        }

        console.log('\n✅ Sample service added successfully!');
        console.log('Service ID:', data.id);
        console.log('\n💡 You can now test the smart billing flow with this customer.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    rl.close();
}

async function addMultipleSampleServices() {
    console.log('🚀 Add Multiple Sample Services');
    console.log('================================\n');

    const customerId = await question('Enter Stripe Customer ID (e.g., cus_xxx): ');

    if (!customerId || !customerId.startsWith('cus_')) {
        console.log('❌ Invalid customer ID. Must start with "cus_"');
        rl.close();
        return;
    }

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
        }
    ];

    console.log(`\n📝 Adding ${services.length} services...`);

    try {
        const { data, error } = await supabase
            .from('customer_services')
            .insert(services)
            .select();

        if (error) {
            console.error('❌ Error adding services:', error.message);
            rl.close();
            return;
        }

        console.log(`\n✅ ${data.length} services added successfully!`);
        data.forEach((service, idx) => {
            console.log(`${idx + 1}. ${service.service_name} (${service.status})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    rl.close();
}

async function main() {
    console.log('\n🎯 Sample Data Options:');
    console.log('1. Add single test service');
    console.log('2. Add multiple test services');
    console.log('');

    const choice = await question('Choose option (1 or 2): ');

    if (choice === '1') {
        await addSampleService();
    } else if (choice === '2') {
        await addMultipleSampleServices();
    } else {
        console.log('❌ Invalid choice');
        rl.close();
    }
}

main().catch(console.error);
