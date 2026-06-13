# FN-KC-1 Implementation Plan

Status: planning for immediate execution after FileNinja production hardening. Keep disabled with `FILENINJA_PROVIDER_ENABLED=false`.

## Objective

Add the FileNinja provider contract, server client, configuration, and feature flag plumbing without exposing FileNinja functionality to users.

This slice must not upload bytes, create real chat delivery cards, or enable the attachment drawer entry by default.

## Feature Flag

Required behavior:

```text
FILENINJA_PROVIDER_ENABLED=false -> provider reports unavailable, no FileNinja API calls are made.
FILENINJA_PROVIDER_ENABLED=true + valid config -> provider may call FileNinja server-side.
Missing FILENINJA_API_URL or FILENINJA_API_KEY -> provider reports unconfigured.
```

Recommended env vars:

```text
FILENINJA_PROVIDER_ENABLED=false
FILENINJA_API_URL=https://fileninja.cloud
FILENINJA_API_KEY=<server-only key>
FILENINJA_MAX_INLINE_BYTES=52428800
```

## Scope

Implement:

- typed FileNinja config loader
- feature flag status in provider availability
- server-only FileNinja client module
- request/response types for transfer create, upload URL, complete, status
- provider disabled/unconfigured tests
- no-op or dry-run-safe provider path when disabled

Do not implement:

- browser upload to FileNinja
- message delivery card
- attachment drawer enablement for users
- transfer completion flow
- FileNinja status refresh
- Rev-Pro integration

## Proposed Files

Likely KuikChat files:

```text
src/lib/integrations/config.ts
src/lib/integrations/types.ts
src/lib/integrations/fileninja/client.ts
src/lib/integrations/fileninja/provider.ts
src/app/api/integrations/intent/route.ts
```

Optional tests/scripts depending on repo test setup:

```text
src/lib/integrations/fileninja/*.test.ts
```

## Provider Contract

`createTransfer` should accept the existing `FileTransferIntent` and return an `IntegrationResult`.

Disabled response:

```json
{
  "provider": "fileninja",
  "kind": "file.transfer",
  "status": "unavailable",
  "message": "FileNinja provider is disabled."
}
```

Unconfigured response:

```json
{
  "provider": "fileninja",
  "kind": "file.transfer",
  "status": "unavailable",
  "message": "Set FILENINJA_API_URL and FILENINJA_API_KEY to enable FileNinja."
}
```

Configured-but-not-yet-uploading response for FN-KC-1:

```json
{
  "provider": "fileninja",
  "kind": "file.transfer",
  "status": "accepted",
  "message": "FileNinja transfer provider is configured.",
  "metadata": {
    "featureSlice": "FN-KC-1",
    "uploadEnabled": false
  }
}
```

If the team prefers zero external calls in FN-KC-1, keep even configured mode as a dry-run capability check. Real transfer creation can start in FN-KC-2.

## Server Client Contract

Create a server-only client wrapper with methods:

```text
createTransfer(input)
createUploadUrl(transferId, fileId)
completeTransfer(transferId)
getTransferStatus(transferId)
```

Client rules:

- read config only server-side
- send API key only in server-to-server requests
- time out requests
- parse JSON safely
- return typed errors without exposing provider secrets
- include `source_app=kuikchat` and external references in create requests later

## Security Requirements

- `FILENINJA_API_KEY` must never be returned to the browser.
- Provider must not run unless the user is authenticated and chat membership is verified by the existing integration endpoint.
- Provider must not make external calls while disabled.
- Do not store raw FileNinja storage keys or signed upload tokens in messages in FN-KC-1.
- Log provider errors without logging secrets.

## Acceptance Criteria

FN-KC-1 is complete when:

```text
FILENINJA_PROVIDER_ENABLED=false returns disabled/unavailable status.
Missing API URL/key returns unconfigured status.
Configured provider has typed server client available.
No browser-visible functionality is enabled.
No FileNinja API key appears in client bundle or responses.
Existing KuikChat media/document attachments still work unchanged.
No Rev-Pro code path is touched.
```

## QA Checklist

Manual:

```text
GET /api/integrations/intent shows FileNinja unavailable when disabled.
POST file.transfer intent returns 503/unavailable when disabled.
Attachment drawer Secure File remains disabled.
Normal document/media upload path is unchanged.
```

Code review:

```text
No provider key in client component.
No NEXT_PUBLIC_ FileNinja secret.
No FileNinja upload byte path in FN-KC-1.
No raw Supabase FileNinja storage URL dependency.
```

## Handoff To FN-KC-2

FN-KC-2 can begin when:

```text
FileNinja production hardening is complete.
FN-KC-1 provider/config/client contract is merged.
Server-side FileNinja API contract is confirmed.
Feature flag remains off by default.
```
