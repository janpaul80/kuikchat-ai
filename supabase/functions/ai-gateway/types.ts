export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface GatewayRequest {
  operation: "chat";
  messages: ChatMessage[];
}

export interface TokenUsage {
  input: number | null;
  output: number | null;
}

export interface ProviderResult {
  provider: "langdock" | "openrouter";
  model: string;
  content: string;
  usage: TokenUsage;
  latencyMs: number;
  fallbackUsed: boolean;
  fallbackReason: string | null;
}

export interface RateLimitReservation {
  allowed: boolean;
  hour_remaining: number;
  day_remaining: number;
}
