# KuikChat AI Integration Research

## Overview

KuikChat will expose one server-side AI gateway for general assistance and later chat actions, document analysis, image generation, and asynchronous video generation.

## Recommended Approach

- Run provider calls in a Supabase Edge Function so provider credentials never enter the Vite bundle.
- Use Langdock's OpenAI-compatible EU endpoint as primary and OpenRouter's `openrouter/free` router as fallback.
- Authenticate every request with the caller's Supabase JWT.
- Reserve usage atomically in Postgres before calling a provider.
- Keep operational logs metadata-only. Conversation content is introduced only with the RLS-scoped history tables in Phase 2.

## Provider Contracts

- Langdock: `POST https://api.langdock.com/openai/eu/v1/chat/completions`, Bearer authentication, model `gpt-5.4-mini`.
- OpenRouter: `POST https://openrouter.ai/api/v1/chat/completions`, Bearer authentication, model `openrouter/free`.

## Guardrails

- 30 requests per rolling hour and 100 requests per rolling day per authenticated user.
- Maximum 20 messages and 12,000 characters per request.
- Maximum 800 generated tokens and a 30-second provider timeout.
- Future document uploads: 15 MB per file, validated server-side before extraction.

## Risks and Mitigations

- Provider outage: typed two-provider failover with sanitized errors.
- Runaway cost: database-backed per-user reservations and output limits.
- Data leakage: server-only secrets, JWT verification, RLS, and metadata-only usage logs.
- Duplicate requests: unique request IDs in the usage ledger.

## References

- https://docs.langdock.com/api-endpoints/completion/openai
- https://openrouter.ai/collections/free-models
