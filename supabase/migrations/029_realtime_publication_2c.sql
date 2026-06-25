-- Migration 029: Add missing tables to supabase_realtime publication
-- 
-- Root cause of "The database schema is invalid or incompatible" banner
-- in slice 2c build: professional/page.tsx subscribes to `profiles` and
-- broadcast_lists via postgres_changes, but neither table was added to the
-- supabase_realtime publication when the tables were created. Supabase
-- Realtime returns "schema invalid or incompatible" for any table not in
-- the publication, which propagates as the red error banner.
--
-- Fix: add both tables to supabase_realtime publication.
-- Applied on: 2026-06-25 (staging + production share same Supabase project)

alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.broadcast_lists;
