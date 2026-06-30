import { runWithFailover } from "./providers.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const baseConfig = {
  langdock: {
    name: "langdock" as const,
    endpoint: "https://langdock.test/chat",
    apiKey: "test-langdock-key",
    model: "gpt-test",
  },
  openrouter: {
    name: "openrouter" as const,
    endpoint: "https://openrouter.test/chat",
    apiKey: "test-openrouter-key",
    model: "openrouter/free",
  },
  maxOutputTokens: 100,
  timeoutMs: 1_000,
};

function completion(content: string, model: string) {
  return new Response(
    JSON.stringify({
      model,
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 4, completion_tokens: 2 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

Deno.test("uses Langdock when the primary provider succeeds", async () => {
  const result = await runWithFailover([{ role: "user", content: "Hello" }], {
    ...baseConfig,
    fetcher: () => Promise.resolve(completion("Primary", "gpt-test")),
  });
  assert(result.provider === "langdock", "expected Langdock");
  assert(
    result.fallbackUsed === false,
    "fallback should not be marked as used",
  );
});

Deno.test("falls back to OpenRouter when Langdock is unavailable", async () => {
  const calls: string[] = [];
  const result = await runWithFailover([{ role: "user", content: "Hello" }], {
    ...baseConfig,
    fetcher: (input) => {
      const url = String(input);
      calls.push(url);
      return Promise.resolve(
        url.includes("langdock.test")
          ? new Response("unavailable", { status: 503 })
          : completion("Fallback", "free-model"),
      );
    },
  });
  assert(calls.length === 2, "both providers should be called");
  assert(result.provider === "openrouter", "expected OpenRouter fallback");
  assert(result.fallbackUsed === true, "fallback should be marked as used");
  assert(
    result.fallbackReason === "HTTP_503",
    "fallback reason should be sanitized",
  );
});

Deno.test("operational circuit breaker skips Langdock", async () => {
  let calls = 0;
  const result = await runWithFailover([{ role: "user", content: "Hello" }], {
    ...baseConfig,
    langdockDisabled: true,
    fetcher: () => {
      calls += 1;
      return Promise.resolve(completion("Fallback", "free-model"));
    },
  });
  assert(calls === 1, "only OpenRouter should be called");
  assert(result.provider === "openrouter", "expected OpenRouter");
  assert(
    result.fallbackReason === "LANGDOCK_DISABLED",
    "expected circuit-breaker reason",
  );
});
