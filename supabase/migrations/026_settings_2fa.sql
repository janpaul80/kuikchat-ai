-- ============================================================================
-- KuikChat — 026_settings_2fa.sql
-- Add TOTP secret and hashed backup codes to profiles for 2FA support
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS totp_secret text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS backup_codes text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio_visibility text default 'contacts' check (bio_visibility in ('everyone','contacts','nobody'));
