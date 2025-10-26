-- Fix RLS policies to allow admin users to access all boat data
-- This enables admin@sailorskills.com to view service history and videos for any boat

-- ============================================================================
-- SERVICE_LOGS TABLE - Allow admin to view all service logs
-- ============================================================================

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view their own boat service logs" ON service_logs;

-- Create new policy that allows:
-- 1. Users to see service logs for boats they have access to (via customer_boat_access)
-- 2. Admin users to see ALL service logs
CREATE POLICY "Users and admins can view service logs"
ON service_logs
FOR SELECT
TO authenticated
USING (
  -- Check if user is admin
  EXISTS (
    SELECT 1 FROM customer_accounts
    WHERE customer_accounts.id = auth.uid()
    AND customer_accounts.is_admin = TRUE
  )
  OR
  -- OR user has access to this boat
  EXISTS (
    SELECT 1 FROM customer_boat_access
    WHERE customer_boat_access.boat_id = service_logs.boat_id
    AND customer_boat_access.customer_account_id = auth.uid()
  )
);

-- ============================================================================
-- YOUTUBE_PLAYLISTS TABLE - Allow admin to view all playlists
-- ============================================================================

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view playlists for their boats" ON youtube_playlists;

-- Create new policy that allows:
-- 1. Users to see playlists for boats they have access to
-- 2. Admin users to see ALL playlists
CREATE POLICY "Users and admins can view playlists"
ON youtube_playlists
FOR SELECT
TO authenticated
USING (
  -- Check if user is admin
  EXISTS (
    SELECT 1 FROM customer_accounts
    WHERE customer_accounts.id = auth.uid()
    AND customer_accounts.is_admin = TRUE
  )
  OR
  -- OR user has access to this boat
  EXISTS (
    SELECT 1 FROM customer_boat_access
    WHERE customer_boat_access.boat_id = youtube_playlists.boat_id
    AND customer_boat_access.customer_account_id = auth.uid()
  )
  OR
  -- OR playlist is marked as public
  youtube_playlists.is_public = TRUE
);

-- ============================================================================
-- BOATS TABLE - Allow admin to view all boats (already done by getUserBoats)
-- ============================================================================

-- Drop existing policy if needed
DROP POLICY IF EXISTS "Users can view their accessible boats" ON boats;

-- Create policy that allows users to see their boats, admins to see all
CREATE POLICY "Users and admins can view boats"
ON boats
FOR SELECT
TO authenticated
USING (
  -- Check if user is admin
  EXISTS (
    SELECT 1 FROM customer_accounts
    WHERE customer_accounts.id = auth.uid()
    AND customer_accounts.is_admin = TRUE
  )
  OR
  -- OR user has access to this boat
  EXISTS (
    SELECT 1 FROM customer_boat_access
    WHERE customer_boat_access.boat_id = boats.id
    AND customer_boat_access.customer_account_id = auth.uid()
  )
);

-- ============================================================================
-- CUSTOMER_BOAT_ACCESS TABLE - Allow admin to view all access records
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own boat access" ON customer_boat_access;

CREATE POLICY "Users and admins can view boat access"
ON customer_boat_access
FOR SELECT
TO authenticated
USING (
  -- Check if user is admin
  EXISTS (
    SELECT 1 FROM customer_accounts
    WHERE customer_accounts.id = auth.uid()
    AND customer_accounts.is_admin = TRUE
  )
  OR
  -- OR it's the user's own access record
  customer_boat_access.customer_account_id = auth.uid()
);

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Run this to verify admin has access:
-- SELECT COUNT(*) FROM service_logs;  -- Should return all service logs
-- SELECT COUNT(*) FROM youtube_playlists;  -- Should return all playlists
-- SELECT COUNT(*) FROM boats;  -- Should return all boats
