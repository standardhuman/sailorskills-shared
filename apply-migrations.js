/**
 * Apply Database Migrations to Supabase
 * Reads migration files and applies them to the production database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(sql, description) {
    console.log(`\n📝 ${description}...`);

    try {
        // Note: Supabase JS client doesn't support raw SQL execution with the anon key
        // We need to use the service role key or REST API
        console.log('⚠️  Cannot execute raw SQL with anon key');
        console.log('📋 SQL to be executed:\n');
        console.log(sql);
        console.log('\n');
        return false;
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return false;
    }
}

async function checkTablesExist() {
    console.log('\n🔍 Checking if tables already exist...');

    try {
        // Try to query the customer_services table
        const { data, error } = await supabase
            .from('customer_services')
            .select('id')
            .limit(1);

        if (!error) {
            console.log('✅ customer_services table already exists');
            return { customer_services: true };
        } else if (error.code === '42P01') {
            console.log('❌ customer_services table does not exist');
            return { customer_services: false };
        } else {
            console.log(`⚠️  Error checking customer_services: ${error.message}`);
            return { customer_services: false };
        }
    } catch (error) {
        console.log(`⚠️  Error checking tables: ${error.message}`);
        return { customer_services: false };
    }
}

async function main() {
    console.log('🚀 Supabase Migration Script');
    console.log('============================');

    // Check if tables exist
    const existingTables = await checkTablesExist();

    // Read migration files
    const migration1Path = join(__dirname, 'supabase/migrations/001_customer_services.sql');
    const migration2Path = join(__dirname, 'supabase/migrations/002_service_conditions_log.sql');

    const migration1 = readFileSync(migration1Path, 'utf-8');
    const migration2 = readFileSync(migration2Path, 'utf-8');

    console.log('\n⚠️  IMPORTANT: Manual Migration Required ⚠️');
    console.log('==============================================\n');
    console.log('The Supabase anon key cannot execute DDL statements (CREATE TABLE, etc.).');
    console.log('You need to run these migrations in the Supabase SQL Editor:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/fzygakldvvzxmahkdylq/sql/new');
    console.log('2. Copy and paste the SQL from each migration file');
    console.log('3. Click "RUN" for each migration\n');

    console.log('📄 Migration files to run:');
    console.log('  1. supabase/migrations/001_customer_services.sql');
    console.log('  2. supabase/migrations/002_service_conditions_log.sql');

    console.log('\n💡 Alternatively, save this complete SQL and run it all at once:\n');
    console.log('-- ============================================');
    console.log('-- Migration 1: Customer Services Table');
    console.log('-- ============================================\n');
    console.log(migration1);
    console.log('\n-- ============================================');
    console.log('-- Migration 2: Service Conditions Log Table');
    console.log('-- ============================================\n');
    console.log(migration2);

    console.log('\n✅ After running the migrations, you can verify with:');
    console.log('   node verify-migrations.js');
}

main().catch(console.error);
