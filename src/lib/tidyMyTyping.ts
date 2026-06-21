/**
 * KuikChat - optional "Tidy my typing" (OPT-IN, default OFF)
 * Path: src/lib/tidyMyTyping.ts
 * Only tidies a user's OWN outgoing message if THEY enabled it in Settings.
 * We never silently edit someone's words.
 */
import { stripLongDashes } from "./noLongDashes";
export function tidyOutgoing(text: string, tidyEnabled: boolean): string {
  return tidyEnabled ? stripLongDashes(text) : text;
}
