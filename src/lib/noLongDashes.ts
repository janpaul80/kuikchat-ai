/**
 * KuikChat - long-dash guard
 * Path: src/lib/noLongDashes.ts
 *
 * RULE: text WE generate (UI strings and especially Hermes output) must never
 * contain a long dash (em or en). It reads as AI-written; we want it human.
 * NEVER run this on a user's own typed message without explicit opt-in.
 */
const LONG_DASH = /[\u2014\u2013]/g;
export function stripLongDashes(input: string): string {
  return input
    .replace(/\s+[\u2014\u2013]\s+/g, ", ")
    .replace(/(?<=\S)[\u2014\u2013](?=\S)/g, "-")
    .replace(LONG_DASH, "-");
}
export function hasLongDash(input: string): boolean { return LONG_DASH.test(input); }
export function sanitizeHermesOutput(text: string): string {
  const cleanDashes = stripLongDashes(text);
  return cleanDashes.replace(/\p{Extended_Pictographic}/gu, '');
}
