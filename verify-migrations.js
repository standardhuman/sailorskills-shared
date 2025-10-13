/**
 * Verify Database Migrations
 * Checks if tables exist and shows sample data
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

async function checkTable(tableName) {
    console.log(`\n🔍 Checking ${tableName} table...`);

    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: false })
            .limit(5);

        if (error) {
            if (error.code === '42P01') {
                console.log(`❌ Table "${tableName}" does not exist`);
                console.log(`   Error: ${error.message}`);
                return false;
            } else {
                console.log(`⚠️  Error querying ${tableName}: ${error.message}`);
                return false;
            }
        }

        console.log(`✅ Table "${tableName}" exists`);
        console.log(`   Records: ${count || 0}`);

        if (data && data.length > 0) {
            console.log(`   Sample data (showing ${data.length} records):`);
            data.forEach((row, idx) => {
                console.log(`   ${idx + 1}. ${JSON.stringify(row, null, 2).split('\n').join('\n      ')}`);
            });
        } else {
            console.log(`   No data found (table is empty)`);
        }

        return true;
    } catch (error) {
        console.log(`❌ Error checking ${tableName}: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Supabase Migration Verification');
    console.log('===================================');
    console.log(`Connected to: ${supabaseUrl}\n`);

    const customerServicesExists = await checkTable('customer_services');
    const conditionsLogExists = await checkTable('service_conditions_log');

    console.log('\n===================================');
    console.log('📊 Summary:');
    console.log(`   customer_services: ${customerServicesExists ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`   service_conditions_log: ${conditionsLogExists ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!customerServicesExists || !conditionsLogExists) {
        console.log('\n⚠️  Some tables are missing!');
        console.log('   Run the migration SQL in Supabase SQL Editor:');
        console.log('   File: supabase/migrations/combined_migration.sql');
        console.log('   URL: https://supabase.com/dashboard/project/fzygakldvvzxmahkdylq/sql/new');
    } else {
        console.log('\n✅ All tables are set up correctly!');
    }

    console.log('===================================\n');
}

main().catch(console.error);
