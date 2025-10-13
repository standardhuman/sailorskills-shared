#!/bin/bash

# Smart Billing Database Setup Script
# This script helps you apply the database migrations

echo "🚀 Smart Billing Database Setup"
echo "================================"
echo ""
echo "📋 Step 1: Open Supabase SQL Editor"
echo "   Opening browser..."

# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/fzygakldvvzxmahkdylq/sql/new"

echo ""
echo "📋 Step 2: Copy the migration SQL"
echo "   Copying to clipboard..."

# Copy the combined migration SQL to clipboard
cat supabase/migrations/combined_migration.sql | pbcopy

echo "   ✅ Migration SQL copied to clipboard!"
echo ""
echo "📋 Step 3: Run the migration"
echo "   1. The Supabase SQL Editor should be open in your browser"
echo "   2. Paste the SQL (Cmd+V) into the editor"
echo "   3. Click the 'RUN' button"
echo ""
echo "📋 Step 4: Verify the migration"
echo "   After running the SQL, come back here and run:"
echo "   node verify-migrations.js"
echo ""
echo "================================"
echo "✨ Setup complete! Follow the steps above."
