import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import {
  AI_LIMITS,
  parseGatewayRequest,
  RequestValidationError,
} from "./guardrails.ts";
import { ProviderRequestError, runWithFailover } from "./providers.ts";
import type { RateLimitReservation } from "./types.ts";

interface AiUsageUpdate {
  provider?: "langdock" | "openrouter";
  model?: string;
  status?: "accepted" | "succeeded" | "failed";
  input_tokens?: number | null;
  output_tokens?: number | null;
  latency_ms?: number | null;
  fallback_used?: boolean;
  error_code?: string | null;
  completed_at?: string | null;
}

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
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
  extraHeaders = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing server configuration: ${name}`);
  return value;
}

function serviceHeaders(serviceRoleKey: string): Record<string, string> {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

async function reserveAiRequest(
  supabaseUrl: string,
  serviceRoleKey: string,
  args: {
    p_user_id: string;
    p_request_id: string;
    p_operation: "chat";
    p_hour_limit: number;
    p_day_limit: number;
  },
): Promise<RateLimitReservation> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/rpc/reserve_ai_request`,
    {
      method: "POST",
      headers: serviceHeaders(serviceRoleKey),
      body: JSON.stringify(args),
    },
  );
  if (!response.ok) throw new Error("AI usage reservation failed");
  return (await response.json()) as RateLimitReservation;
}

async function updateUsageEvent(
  supabaseUrl: string,
  serviceRoleKey: string,
  requestId: string,
  update: AiUsageUpdate,
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/ai_usage_events?request_id=eq.${
      encodeURIComponent(requestId)
    }`,
    {
      method: "PATCH",
      headers: { ...serviceHeaders(serviceRoleKey), Prefer: "return=minimal" },
      body: JSON.stringify(update),
    },
  );
  if (!response.ok) throw new Error("AI usage logging failed");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, {
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." },
    }, 405);
  }

  const requestId = crypto.randomUUID();
  let userId: string | null = null;
  let serviceContext: { supabaseUrl: string; serviceRoleKey: string } | null =
    null;

  try {
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const anonKey = requiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse(
        req,
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Please sign in to use KuikChat AI.",
          },
        },
        401,
      );
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
    const { data: authData, error: authError } = await authClient.auth
      .getUser();
    if (authError || !authData.user) {
      return jsonResponse(
        req,
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Your session is no longer valid.",
          },
        },
        401,
      );
    }
    userId = authData.user.id;

    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      throw new RequestValidationError("Request body must be valid JSON.");
    }
    const gatewayRequest = parseGatewayRequest(requestBody);

    serviceContext = { supabaseUrl, serviceRoleKey };
    const reservation = await reserveAiRequest(
      supabaseUrl,
      serviceRoleKey,
      {
        p_user_id: userId,
        p_request_id: requestId,
        p_operation: gatewayRequest.operation,
        p_hour_limit: AI_LIMITS.requestsPerHour,
        p_day_limit: AI_LIMITS.requestsPerDay,
      },
    );
    if (!reservation.allowed) {
      return jsonResponse(
        req,
        {
          error: {
            code: "RATE_LIMITED",
            message:
              "You have reached the AI usage limit. Please try again later.",
          },
          limits: reservation,
        },
        429,
        { "Retry-After": "3600" },
      );
    }

    const result = await runWithFailover(gatewayRequest.messages, {
      langdock: {
        name: "langdock",
        endpoint: Deno.env.get("LANGDOCK_ENDPOINT_URL")?.trim() ??
          "https://api.langdock.com/openai/eu/v1/chat/completions",
        apiKey: requiredEnv("LANGDOCK_API_KEY"),
        model: Deno.env.get("LANGDOCK_MODEL")?.trim() || "gpt-5.4-mini",
      },
      openrouter: {
        name: "openrouter",
        endpoint: Deno.env.get("OPENROUTER_ENDPOINT_URL")?.trim() ??
          "https://openrouter.ai/api/v1/chat/completions",
        apiKey: requiredEnv("OPENROUTER_API_KEY"),
        model: Deno.env.get("OPENROUTER_MODEL")?.trim() || "openrouter/free",
      },
      langdockDisabled: Deno.env.get("AI_LANGDOCK_DISABLED") === "true",
      maxOutputTokens: AI_LIMITS.maxOutputTokens,
      timeoutMs: AI_LIMITS.providerTimeoutMs,
    });

    await updateUsageEvent(supabaseUrl, serviceRoleKey, requestId, {
      provider: result.provider,
      model: result.model,
      status: "succeeded",
      input_tokens: result.usage.input,
      output_tokens: result.usage.output,
      latency_ms: result.latencyMs,
      fallback_used: result.fallbackUsed,
      error_code: result.fallbackReason,
      completed_at: new Date().toISOString(),
    });

    return jsonResponse(req, {
      request_id: requestId,
      message: { role: "assistant", content: result.content },
      provider: result.provider,
      model: result.model,
      usage: result.usage,
      fallback_used: result.fallbackUsed,
      limits: reservation,
    });
  } catch (error) {
    if (serviceContext && userId) {
      await updateUsageEvent(
        serviceContext.supabaseUrl,
        serviceContext.serviceRoleKey,
        requestId,
        {
          status: "failed",
          error_code: error instanceof ProviderRequestError
            ? error.code
            : "GATEWAY_ERROR",
          completed_at: new Date().toISOString(),
        },
      ).catch(() => undefined);
    }

    if (error instanceof RequestValidationError) {
      return jsonResponse(
        req,
        { error: { code: "INVALID_REQUEST", message: error.message } },
        400,
      );
    }

    console.error("AI gateway request failed", {
      requestId,
      userId,
      errorCode: error instanceof ProviderRequestError
        ? error.code
        : "GATEWAY_ERROR",
    });
    return jsonResponse(
      req,
      {
        error: {
          code: "AI_UNAVAILABLE",
          message:
            "KuikChat AI is temporarily unavailable. Please try again shortly.",
        },
      },
      503,
    );
  }
});
