/**
 * Quick Add Sample Service
 * Usage: node quick-add-service.js [customer_id]
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const customerId = process.argv[2];

if (!customerId) {
    console.log('❌ Usage: node quick-add-service.js [customer_id]');
    console.log('   Example: node quick-add-service.js cus_xxx');
    process.exit(1);
}

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

console.log('📝 Adding service:', sampleService.service_name);
console.log('   Customer ID:', customerId);

try {
    const { data, error } = await supabase
        .from('customer_services')
        .insert(sampleService)
        .select()
        .single();

    if (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }

    console.log('✅ Service added successfully!');
    console.log('   Service ID:', data.id);
    console.log('\n💡 Test with this customer in the billing app');

} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
