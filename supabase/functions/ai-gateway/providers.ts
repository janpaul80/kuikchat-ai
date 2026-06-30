import type { ChatMessage, ProviderResult, TokenUsage } from "./types.ts";

export interface ProviderConfig {
  name: "langdock" | "openrouter";
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface FailoverConfig {
  langdock: ProviderConfig;
  openrouter: ProviderConfig;
  langdockDisabled?: boolean;
  maxOutputTokens: number;
  timeoutMs: number;
  fetcher?: typeof fetch;
}

interface ProviderResponse {
  model?: string;
  choices?: Array<{
    message?: { content?: string };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export class ProviderRequestError extends Error {
  readonly provider: ProviderConfig["name"];
  readonly code: string;

  constructor(provider: ProviderConfig["name"], code: string) {
    super(`${provider} request failed`);
    this.name = "ProviderRequestError";
    this.provider = provider;
    this.code = code;
  }
}

function normalizeUsage(response: ProviderResponse): TokenUsage {
  return {
    input: Number.isInteger(response.usage?.prompt_tokens)
      ? response.usage?.prompt_tokens ?? null
      : null,
    output: Number.isInteger(response.usage?.completion_tokens)
      ? response.usage?.completion_tokens ?? null
      : null,
  };
}

async function requestProvider(
  provider: ProviderConfig,
  messages: ChatMessage[],
  maxOutputTokens: number,
  timeoutMs: number,
  fetcher: typeof fetch,
): Promise<Omit<ProviderResult, "fallbackUsed" | "fallbackReason">> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetcher(provider.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        "Content-Type": "application/json",
        ...(provider.name === "openrouter"
          ? { "HTTP-Referer": "https://kuikchat.io", "X-Title": "KuikChat" }
          : {}),
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content:
              "You are KuikChat AI. Give a helpful, accurate, concise answer. Do not claim to perform actions you did not perform.",
          },
          ...messages,
        ],
        ...(provider.name === "langdock"
          ? { max_completion_tokens: maxOutputTokens }
          : { max_tokens: maxOutputTokens }),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ProviderRequestError(provider.name, `HTTP_${response.status}`);
    }

    const payload = (await response.json()) as ProviderResponse;
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new ProviderRequestError(provider.name, "EMPTY_RESPONSE");
    }

    return {
      provider: provider.name,
      model: payload.model ?? provider.model,
      content,
      usage: normalizeUsage(payload),
      latencyMs: Date.now() - startedAt,
    };
  } catch (error) {
    if (error instanceof ProviderRequestError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ProviderRequestError(provider.name, "TIMEOUT");
    }
    throw new ProviderRequestError(provider.name, "NETWORK_ERROR");
  } finally {
    clearTimeout(timeout);
  }
}

export async function runWithFailover(
  messages: ChatMessage[],
  config: FailoverConfig,
): Promise<ProviderResult> {
  const fetcher = config.fetcher ?? fetch;
  let fallbackReason: string | null = null;

  if (!config.langdockDisabled) {
    try {
      const result = await requestProvider(
        config.langdock,
        messages,
        config.maxOutputTokens,
        config.timeoutMs,
        fetcher,
      );
      return { ...result, fallbackUsed: false, fallbackReason: null };
    } catch (error) {
      fallbackReason = error instanceof ProviderRequestError
        ? error.code
        : "LANGDOCK_ERROR";
    }
  } else {
    fallbackReason = "LANGDOCK_DISABLED";
  }

  const result = await requestProvider(
    config.openrouter,
    messages,
    config.maxOutputTokens,
    config.timeoutMs,
    fetcher,
  );
  return { ...result, fallbackUsed: true, fallbackReason };
}
