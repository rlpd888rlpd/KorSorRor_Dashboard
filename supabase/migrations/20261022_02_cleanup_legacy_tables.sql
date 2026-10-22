-- ==============================================================================
-- Migration: 20261022_02_cleanup_legacy_tables.sql
-- Description: Drop unused legacy event/seminar/site-visit tables from Supabase
-- Leaving ONLY the core KorSorRor Executive Dashboard tables
-- ==============================================================================

DROP TABLE IF EXISTS public.bus_participants CASCADE;
DROP TABLE IF EXISTS public.card_registrations CASCADE;
DROP TABLE IF EXISTS public.community_center_registrations CASCADE;
DROP TABLE IF EXISTS public.ebook_submissions CASCADE;
DROP TABLE IF EXISTS public.justice_office_registrations CASCADE;
DROP TABLE IF EXISTS public.organizer_feedbacks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.seminar_document_registrations CASCADE;
DROP TABLE IF EXISTS public.site_visit_approvals CASCADE;
DROP TABLE IF EXISTS public.site_visit_evaluators CASCADE;
DROP TABLE IF EXISTS public.site_visit_scores CASCADE;
DROP TABLE IF EXISTS public.site_visit_sessions CASCADE;
DROP TABLE IF EXISTS public.site_visit_summary CASCADE;
DROP TABLE IF EXISTS public.staff_service_registrations CASCADE;
