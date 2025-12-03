-- Migration: Fix Function Security
-- Created: 2025-12-02
-- Purpose: Fix database functions with mutable search_path and security definer view

-- ============================================================================
-- SECURITY FIXES
-- ============================================================================
-- 
-- This migration addresses security warnings from the database linter:
-- 1. Functions with mutable search_path (can be exploited via search path injection)
-- 2. Security definer view (executes with creator permissions)
--
-- Reference: https://supabase.com/docs/guides/database/database-linter
-- ============================================================================

-- ============================================================================
-- FIX 1: Functions with mutable search_path
-- ============================================================================
-- Setting search_path = '' ensures functions only use fully qualified names,
-- preventing search path injection attacks.

-- Fix increment_clip_views
CREATE OR REPLACE FUNCTION public.increment_clip_views(clip_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."LiveStreamClip" 
  SET views = views + 1 
  WHERE id = clip_id;
END;
$$;

-- Fix increment_clip_shares
CREATE OR REPLACE FUNCTION public.increment_clip_shares(clip_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."LiveStreamClip" 
  SET shares = shares + 1 
  WHERE id = clip_id;
END;
$$;

-- Fix increment_clip_likes
CREATE OR REPLACE FUNCTION public.increment_clip_likes(clip_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."LiveStreamClip" 
  SET likes = likes + 1 
  WHERE id = clip_id;
END;
$$;

-- Fix decrement_clip_likes
CREATE OR REPLACE FUNCTION public.decrement_clip_likes(clip_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."LiveStreamClip" 
  SET likes = GREATEST(0, likes - 1) 
  WHERE id = clip_id;
END;
$$;

-- Fix update_is_minor
CREATE OR REPLACE FUNCTION public.update_is_minor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW."isMinor" := NEW."birthDate" IS NOT NULL AND 
    NEW."birthDate" > (CURRENT_DATE - INTERVAL '18 years');
  RETURN NEW;
END;
$$;

-- Fix record_affiliate_conversion
CREATE OR REPLACE FUNCTION public.record_affiliate_conversion(
  p_affiliate_id TEXT,
  p_user_id TEXT,
  p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."Affiliate"
  SET 
    "conversions" = "conversions" + 1,
    "totalEarnings" = "totalEarnings" + (p_amount * "commissionRate" / 100)
  WHERE id = p_affiliate_id;
END;
$$;

-- Fix can_send_dm
CREATE OR REPLACE FUNCTION public.can_send_dm(sender_id TEXT, receiver_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  are_following BOOLEAN;
BEGIN
  -- Check if users follow each other (mutual follow required for DMs)
  SELECT EXISTS (
    SELECT 1 FROM public."UserFollow"
    WHERE "followerId" = sender_id AND "followingId" = receiver_id
  ) AND EXISTS (
    SELECT 1 FROM public."UserFollow"
    WHERE "followerId" = receiver_id AND "followingId" = sender_id
  ) INTO are_following;
  
  RETURN are_following;
END;
$$;

-- Fix minor_has_permission
CREATE OR REPLACE FUNCTION public.minor_has_permission(
  p_minor_id TEXT,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public."MinorPermission"
    WHERE "minorId" = p_minor_id 
      AND "permission" = p_permission
      AND "granted" = true
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$;

-- Fix update_social_updated_at
CREATE OR REPLACE FUNCTION public.update_social_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" := NOW();
  RETURN NEW;
END;
$$;

-- Fix generate_meeting_code
CREATE OR REPLACE FUNCTION public.generate_meeting_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 10-character meeting code: xxx-xxxx-xxx
  FOR i IN 1..3 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::integer, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::integer, 1);
  END LOOP;
  result := result || '-';
  FOR i IN 1..3 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix is_trusted_family_member
CREATE OR REPLACE FUNCTION public.is_trusted_family_member(
  p_minor_id TEXT,
  p_adult_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  is_trusted BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public."MinorGuardian"
    WHERE "minorId" = p_minor_id 
      AND "guardianId" = p_adult_id
      AND "status" = 'verified'
  ) INTO is_trusted;
  
  RETURN is_trusted;
END;
$$;

-- Fix track_affiliate_click
CREATE OR REPLACE FUNCTION public.track_affiliate_click(p_affiliate_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public."Affiliate"
  SET "clicks" = "clicks" + 1
  WHERE id = p_affiliate_id;
END;
$$;

-- Fix calculate_experience_tier
CREATE OR REPLACE FUNCTION public.calculate_experience_tier(experience_years INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN CASE
    WHEN experience_years < 1 THEN 'beginner'
    WHEN experience_years < 3 THEN 'intermediate'
    WHEN experience_years < 7 THEN 'advanced'
    ELSE 'expert'
  END;
END;
$$;

-- ============================================================================
-- FIX 2: Security Definer View
-- ============================================================================
-- Drop and recreate the view with SECURITY INVOKER (the default)
-- This ensures the view executes with the permissions of the querying user

DROP VIEW IF EXISTS public.admin_usage_stats;

CREATE VIEW public.admin_usage_stats AS
SELECT 
  COUNT(*) FILTER (WHERE "subscriptionTier" = 'free') as free_users,
  COUNT(*) FILTER (WHERE "subscriptionTier" = 'creator') as creator_users,
  COUNT(*) FILTER (WHERE "subscriptionTier" = 'studio') as studio_users,
  COUNT(*) as total_users,
  SUM("aiRequestsUsed") as total_ai_requests,
  SUM("videoMinutesUsed") as total_video_minutes,
  SUM("imageCreditsUsed") as total_image_credits,
  SUM("stemCreditsUsed") as total_stem_credits,
  AVG(CAST("storageUsedGB" AS DECIMAL)) as avg_storage_gb
FROM public."User";

-- Add comment documenting authorization
COMMENT ON VIEW public.admin_usage_stats IS 
'Admin-only usage statistics view.
AUTHORIZATION: Access must be restricted at application layer.
Only users with isOwner=true should query this view.';

-- ============================================================================
-- VERIFICATION QUERIES (run manually after migration)
-- ============================================================================
-- 
-- Check functions have immutable search_path:
-- SELECT proname, prosecdef, proconfig 
-- FROM pg_proc 
-- WHERE pronamespace = 'public'::regnamespace 
-- AND proname IN ('increment_clip_views', 'can_send_dm', 'generate_meeting_code');
--
-- Check view is not security definer:
-- SELECT viewname, definition 
-- FROM pg_views 
-- WHERE viewname = 'admin_usage_stats';
-- ============================================================================





