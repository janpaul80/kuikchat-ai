import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import {
  AI_LIMITS,
  parseGatewayRequest,
  RequestValidationError,
} from "./guardrails.ts";
import { ProviderRequestError, runWithFailover } from "./providers.ts";
import type { RateLimitReservation } from "./types.ts";

const ALLOWED_ORIGINS = new Set([
  "https://kuikchat.io",
  "https://www.kuikchat.io",
  "http://localhost:5173",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) || origin.endsWith(".vercel.app");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://kuikchat.io",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`MISSING_CONFIG: ${name}`);
  return value;
}

async function reserveAiRequest(
  supabaseUrl: string,
  serviceRoleKey: string,
  args: { p_user_id: string; p_request_id: string; p_operation: string; p_hour_limit: number; p_day_limit: number },
): Promise<RateLimitReservation> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/reserve_ai_request`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) throw new Error("QUOTA_RPC_FAILURE");
  return (await response.json()) as RateLimitReservation;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return jsonResponse(req, { error: { code: "METHOD_NOT_ALLOWED" } }, 405);

  const requestId = crypto.randomUUID();
  let userId: string | null = null;

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(req, { error: { code: "UNAUTHORIZED", message: "Auth required." } }, 401);
    }

    const token = authHeader.substring(7);
    const authClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) {
      return jsonResponse(req, { error: { code: "UNAUTHORIZED", message: "Invalid session." } }, 401);
    }
    userId = user.id;

    const langdockKey = requiredEnv("LANGDOCK_API_KEY");
    const langdockModel = requiredEnv("LANGDOCK_MODEL");
    const langdockDisabled = Deno.env.get("AI_LANGDOCK_DISABLED") === "true";

    let openrouterConfig = undefined;
    if (!langdockDisabled) {
      openrouterConfig = {
        apiKey: requiredEnv("OPENROUTER_API_KEY"),
        model: requiredEnv("OPENROUTER_MODEL"),
      };
    }

    const body = await req.json().catch(() => { throw new RequestValidationError("Invalid JSON"); });
    const gatewayRequest = parseGatewayRequest(body);

    const reservation = await reserveAiRequest(supabaseUrl, serviceRoleKey, {
      p_user_id: userId,
      p_request_id: requestId,
      p_operation: gatewayRequest.operation,
      p_hour_limit: AI_LIMITS.requestsPerHour,
      p_day_limit: AI_LIMITS.requestsPerDay,
    });

    if (!reservation.allowed) {
      return jsonResponse(req, { error: { code: "RATE_LIMITED", message: "Quota exceeded." } }, 429);
    }

    const result = await runWithFailover(gatewayRequest.messages, {
      langdock: { name: "langdock", endpoint: "https://api.langdock.com/openai/eu/v1/chat/completions", apiKey: langdockKey, model: langdockModel },
      openrouter: { name: "openrouter", endpoint: "https://openrouter.ai/api/v1/chat/completions", apiKey: openrouterConfig!.apiKey, model: openrouterConfig!.model },
      langdockDisabled,
      maxOutputTokens: AI_LIMITS.maxOutputTokens,
      timeoutMs: AI_LIMITS.providerTimeoutMs,
    });

    return jsonResponse(req, {
      request_id: requestId,
      message: { role: "assistant", content: result.content },
      provider: result.provider,
      usage: result.usage,
    });

  } catch (error: any) {
    console.error(`[AI-GATEWAY-ERROR] ID: ${requestId} | ${error.message}`);

    if (error.message.includes("MISSING_CONFIG")) {
      return jsonResponse(req, { error: { code: "SERVER_CONFIG_ERROR", message: "Internal configuration error." } }, 500);
    }
    if (error instanceof RequestValidationError) {
      return jsonResponse(req, { error: { code: "INVALID_REQUEST", message: error.message } }, 400);
    }
    if (error instanceof ProviderRequestError) {
      const mapping: Record<string, string> = {
        "PROVIDER_AUTH_ERROR": "SERVER_CONFIG_ERROR",
        "PROVIDER_RATE_LIMITED": "RATE_LIMITED",
        "PROVIDER_UNAVAILABLE": "PROVIDER_UNAVAILABLE",
      };
      return jsonResponse(req, { error: { code: mapping[error.code] || "PROVIDER_UNAVAILABLE", message: "AI service error." } }, 503);
    }

    return jsonResponse(req, { error: { code: "SERVER_ERROR", message: "An unexpected error occurred." } }, 500);
  }
});
