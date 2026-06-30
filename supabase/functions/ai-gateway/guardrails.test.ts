import {
  AI_LIMITS,
  parseGatewayRequest,
  RequestValidationError,
} from "./guardrails.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test("accepts and trims a valid chat request", () => {
  const request = parseGatewayRequest({
    operation: "chat",
    messages: [{ role: "user", content: "  Hello  " }],
  });
  assert(request.messages[0].content === "Hello", "message was not trimmed");
});

Deno.test("rejects requests above the total character limit", () => {
  let rejected = false;
  try {
    parseGatewayRequest({
      operation: "chat",
      messages: Array.from({ length: 4 }, () => ({
        role: "user",
        content: "x".repeat(AI_LIMITS.maxCharactersPerMessage),
      })),
    });
  } catch (error) {
    rejected = error instanceof RequestValidationError;
  }
  assert(rejected, "oversized request should be rejected");
});
