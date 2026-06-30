-- Phase 1 AI usage ledger. This table intentionally stores no prompt or response content.
CREATE TABLE public.ai_usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('chat')),
  provider TEXT CHECK (provider IN ('langdock', 'openrouter')),
  model TEXT,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'succeeded', 'failed')),
  input_tokens INTEGER CHECK (input_tokens IS NULL OR input_tokens >= 0),
  output_tokens INTEGER CHECK (output_tokens IS NULL OR output_tokens >= 0),
  latency_ms INTEGER CHECK (latency_ms IS NULL OR latency_ms >= 0),
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX ai_usage_events_user_created_idx
  ON public.ai_usage_events (user_id, created_at DESC);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.ai_usage_events FROM anon, authenticated;
GRANT SELECT ON public.ai_usage_events TO authenticated;

CREATE OR REPLACE FUNCTION public.reserve_ai_request(
  p_user_id UUID,
  p_request_id UUID,
  p_operation TEXT,
  p_hour_limit INTEGER DEFAULT 30,
  p_day_limit INTEGER DEFAULT 100
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  hour_count INTEGER;
  day_count INTEGER;
BEGIN
  IF p_operation <> 'chat' THEN
    RAISE EXCEPTION 'Unsupported AI operation';
  END IF;

  -- Serialize reservations for one user so concurrent requests cannot bypass limits.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  SELECT
    count(*) FILTER (WHERE created_at >= now() - interval '1 hour'),
    count(*) FILTER (WHERE created_at >= now() - interval '1 day')
  INTO hour_count, day_count
  FROM public.ai_usage_events
  WHERE user_id = p_user_id;

  IF hour_count >= p_hour_limit OR day_count >= p_day_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'hour_remaining', greatest(p_hour_limit - hour_count, 0),
      'day_remaining', greatest(p_day_limit - day_count, 0)
    );
  END IF;

  INSERT INTO public.ai_usage_events (
    request_id,
    user_id,
    operation,
    status
  ) VALUES (
    p_request_id,
    p_user_id,
    p_operation,
    'accepted'
  );

  RETURN jsonb_build_object(
    'allowed', true,
    'hour_remaining', greatest(p_hour_limit - hour_count - 1, 0),
    'day_remaining', greatest(p_day_limit - day_count - 1, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ai_request(UUID, UUID, TEXT, INTEGER, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_request(UUID, UUID, TEXT, INTEGER, INTEGER)
  TO service_role;
