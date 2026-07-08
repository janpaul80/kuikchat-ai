import type { ChatMessage, GatewayRequest } from "./types.ts";

export const AI_LIMITS = {
  maxMessages: 20,
  maxCharacters: 12_000,
  maxCharactersPerMessage: 4_000,
  maxOutputTokens: 800,
  providerTimeoutMs: 30_000,
  requestsPerHour: 30,
  requestsPerDay: 100,
} as const;

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export function parseGatewayRequest(value: unknown): GatewayRequest {
  if (!value || typeof value !== "object") {
    throw new RequestValidationError("Request body must be an object.");
  }

  const body = value as Record<string, unknown>;
  if (body.operation !== "chat") {
    throw new RequestValidationError("Only the chat operation is available.");
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new RequestValidationError("At least one message is required.");
  }

  if (body.messages.length > AI_LIMITS.maxMessages) {
    throw new RequestValidationError(
      `A maximum of ${AI_LIMITS.maxMessages} messages is allowed.`,
    );
  }

  if (!body.messages.every(isChatMessage)) {
    throw new RequestValidationError(
      "Messages must contain a valid role and text content.",
    );
  }

  const messages = body.messages.map((message) => ({
    role: message.role,
    content: message.content.trim(),
  }));

  if (messages.some((message) => message.content.length === 0)) {
    throw new RequestValidationError("Message content cannot be empty.");
  }

  if (
    messages.some((message) =>
      message.content.length > AI_LIMITS.maxCharactersPerMessage
    )
  ) {
    throw new RequestValidationError(
      `Each message is limited to ${AI_LIMITS.maxCharactersPerMessage} characters.`,
    );
  }

  const totalCharacters = messages.reduce(
    (total, message) => total + message.content.length,
    0,
  );
  if (totalCharacters > AI_LIMITS.maxCharacters) {
    throw new RequestValidationError(
      `The request is limited to ${AI_LIMITS.maxCharacters} characters.`,
    );
  }

  const conversation_id = typeof body.conversation_id === "string" ? body.conversation_id : undefined;

  return { operation: "chat", conversation_id, messages };
}
