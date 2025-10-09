/**
 * Production Readiness Check
 * Run this before deploying to production
 */

import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let errors = [];
let warnings = [];
let passed = [];

console.log('🔒 Production Readiness Check');
console.log('==============================\n');

// Check 1: Verify no development RLS policies in codebase
console.log('📋 Checking for development RLS policies...');
const devPolicyFile = 'supabase/migrations/001a_customer_services_dev_policy.sql';
if (existsSync(devPolicyFile)) {
    warnings.push('⚠️  Development RLS policy file exists: ' + devPolicyFile);
    warnings.push('   Make sure production RLS policies are applied before deploying');
} else {
    passed.push('✅ No development RLS policy file found');
}

// Check 2: Verify environment variables
console.log('📋 Checking environment variables...');
const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
];

requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        passed.push(`✅ ${varName} is set`);
    } else {
        errors.push(`❌ Missing environment variable: ${varName}`);
    }
});

// Check 3: Verify no service role key in frontend code
console.log('📋 Checking for exposed secrets...');
const distFiles = [
    'dist/admin.html',
    'dist/dashboard.html'
];

let secretsFound = false;
distFiles.forEach(file => {
    if (existsSync(file)) {
        const content = readFileSync(file, 'utf-8');
        if (content.includes('service_role') || content.includes('sk_live_')) {
            errors.push(`❌ Potential secret exposed in: ${file}`);
            secretsFound = true;
        }
    }
});

if (!secretsFound) {
    passed.push('✅ No exposed secrets in frontend files');
}

// Check 4: Check Supabase RLS policies (if possible)
console.log('📋 Checking Supabase RLS policies...');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Try to query with anon key - if it works, policies might be too permissive
        const { data, error } = await supabase
            .from('customer_services')
            .select('*')
            .limit(1);

        if (!error) {
            warnings.push('⚠️  Anon key can read customer_services table');
            warnings.push('   Verify this is intended for production');
        } else {
            passed.push('✅ RLS policies are restricting anon access');
        }
    } catch (err) {
        warnings.push('⚠️  Could not verify RLS policies: ' + err.message);
    }
} else {
    warnings.push('⚠️  Cannot check RLS policies - missing Supabase credentials');
}

// Check 5: Verify test files aren't included in production
console.log('📋 Checking for test files...');
const testFiles = [
    'add-sample-data.js',
    'add-sample-data-auto.js',
    'list-stripe-customers.js',
    'supabase/sample-data.sql'
];

testFiles.forEach(file => {
    if (existsSync(file)) {
        warnings.push(`⚠️  Test file present: ${file} (OK for repo, but don't use in production)`);
    }
});

// Results Summary
console.log('\n==============================');
console.log('📊 Results Summary\n');

if (passed.length > 0) {
    console.log('✅ Passed Checks:');
    passed.forEach(p => console.log('   ' + p));
    console.log('');
}

if (warnings.length > 0) {
    console.log('⚠️  Warnings:');
    warnings.forEach(w => console.log('   ' + w));
    console.log('');
}

if (errors.length > 0) {
    console.log('❌ Errors (must fix before production):');
    errors.forEach(e => console.log('   ' + e));
    console.log('');
}

// Final verdict
console.log('==============================');
if (errors.length === 0 && warnings.length === 0) {
    console.log('🎉 All checks passed! Ready for production.');
    process.exit(0);
} else if (errors.length > 0) {
    console.log('❌ FAILED: Fix errors before deploying to production.');
    console.log('\n📖 See PRODUCTION_DEPLOYMENT_CHECKLIST.md for details.');
    process.exit(1);
} else {
    console.log('⚠️  WARNINGS: Review warnings before deploying.');
    console.log('📖 See PRODUCTION_DEPLOYMENT_CHECKLIST.md for details.');
    console.log('\nProceed with caution.');
    process.exit(0);
}
