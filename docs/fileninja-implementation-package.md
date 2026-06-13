# KuikChat to FileNinja Implementation Package

Status: planning package only. Do not implement until FileNinja production hardening is complete and approved.

## Architecture Overview

KuikChat will use FileNinja as the provider for secure professional file delivery while preserving KuikChat's existing Supabase attachment path for normal chat media.

The integration has three boundaries:

- KuikChat client: selects a file, shows upload progress, renders the delivery card.
- KuikChat server: verifies chat membership, creates FileNinja transfers, stores message/attachment metadata, never exposes provider secrets.
- FileNinja server: owns transfer rows, upload sessions, signed upload URLs, signed download URLs, expiry, revocation, and delivery pages.

Primary runtime flow:

```text
KuikChat chat UI
  -> KuikChat integration API
  -> FileNinja internal transfer create
  -> FileNinja signed upload URL
  -> browser uploads to FileNinja signed URL
  -> KuikChat/FileNinja complete transfer
  -> KuikChat message stores FileNinja delivery metadata
```

KuikChat must not store or render raw FileNinja Supabase Storage object URLs.

## API Contract

Environment:

```text
FILENINJA_API_URL=https://fileninja.cloud
FILENINJA_API_KEY=<server-only internal key>
FILENINJA_PROVIDER_ENABLED=false initially
FILENINJA_MAX_INLINE_BYTES=<threshold for normal KuikChat attachment path>
```

KuikChat internal intent endpoint already exists:

```http
POST /api/integrations/intent
```

Initial request body from client to KuikChat:

```json
{
  "provider": "fileninja",
  "kind": "file.transfer",
  "chatId": "uuid",
  "fileName": "contract.pdf",
  "fileSize": 12345678,
  "mimeType": "application/pdf",
  "metadata": {
    "replyToId": "optional-message-id"
  }
}
```

KuikChat to FileNinja create transfer request:

```json
{
  "sourceApp": "kuikchat",
  "externalReference": "kuikchat:<chat-id>:<message-id-or-client-id>",
  "sender": {
    "userId": "kuikchat-user-id",
    "email": "optional-user-email",
    "displayName": "optional-display-name"
  },
  "recipient": {
    "chatId": "kuikchat-chat-id"
  },
  "files": [
    {
      "name": "contract.pdf",
      "size": 12345678,
      "contentType": "application/pdf"
    }
  ],
  "message": "optional chat context"
}
```

Expected FileNinja create response:

```json
{
  "transferId": "uuid",
  "shareToken": "token",
  "publicUrl": "https://fileninja.cloud/d/token",
  "status": "uploading",
  "files": [
    {
      "fileId": "uuid",
      "uploadSessionId": "uuid",
      "fileIndex": 0,
      "storageKey": "server-owned-key",
      "name": "contract.pdf",
      "size": 12345678
    }
  ]
}
```

KuikChat to FileNinja upload URL request:

```http
POST /api/transfers/{transferId}/upload-url
```

Body:

```json
{
  "fileId": "uuid"
}
```

Expected upload URL response:

```json
{
  "transferId": "uuid",
  "fileId": "uuid",
  "uploadSessionId": "uuid",
  "storageKey": "server-owned-key",
  "signedUploadUrl": "https://...",
  "token": "signed-upload-token",
  "expiresIn": 7200,
  "maxBytes": 12345678,
  "contentType": "application/pdf"
}
```

KuikChat to FileNinja complete request:

```http
POST /api/transfers/{transferId}/complete
```

Expected complete response:

```json
{
  "transferId": "uuid",
  "shareToken": "token",
  "publicUrl": "https://fileninja.cloud/d/token",
  "status": "ready",
  "completedAt": "iso-date",
  "files": [
    {
      "fileIndex": 0,
      "name": "contract.pdf",
      "size": 12345678
    }
  ]
}
```

KuikChat provider result:

```json
{
  "provider": "fileninja",
  "kind": "file.transfer",
  "status": "accepted",
  "message": "Transfer created",
  "metadata": {
    "transferId": "uuid",
    "shareToken": "token",
    "deliveryUrl": "https://fileninja.cloud/d/token",
    "uploadSessionId": "uuid",
    "fileId": "uuid"
  }
}
```

## Database Impact

Preferred first slice: avoid new tables and store FileNinja state in existing `messages.metadata` and `message_attachments.metadata`.

Message:

```json
{
  "type": "file",
  "body": "Secure file: contract.pdf",
  "metadata": {
    "provider": "fileninja",
    "status": "ready",
    "transferId": "uuid",
    "shareToken": "token",
    "deliveryUrl": "https://fileninja.cloud/d/token",
    "expiresAt": "iso-date",
    "fileCount": 1,
    "totalBytes": 12345678
  }
}
```

Attachment:

```json
{
  "type": "file",
  "url": "https://fileninja.cloud/d/token",
  "filename": "contract.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 12345678,
  "metadata": {
    "provider": "fileninja",
    "transferId": "uuid",
    "fileId": "uuid",
    "uploadSessionId": "uuid",
    "status": "ready"
  }
}
```

Possible later table if message metadata becomes too dense:

```text
integration_jobs
- id
- provider
- kind
- chat_id
- message_id
- user_id
- provider_resource_id
- status
- metadata
- created_at
- updated_at
```

No schema migration is required for the first implementation slice unless the team wants queryable integration job state from day one.

## Chat Attachment UX

Entry points:

- Existing `Document` action remains normal KuikChat attachment for small files.
- `Secure File` becomes enabled when FileNinja is configured and the feature flag is on.
- Large document selection may route to FileNinja automatically after confirmation.

States:

```text
selecting -> creating transfer -> uploading -> completing -> ready
selecting -> creating transfer -> failed
uploading -> failed/retryable
ready -> expired/revoked later
```

Ready card should show:

- filename
- size
- provider badge: FileNinja
- expiry, if available
- open/download action
- retry/remove actions only for failed pending messages

The user should never see raw storage keys, signed upload tokens, service keys, or Supabase object URLs.

## Upload Flow

1. Client selects secure file.
2. Client sends file metadata to KuikChat integration endpoint.
3. KuikChat verifies membership in `chat_members`.
4. KuikChat creates a pending chat message or client-side optimistic placeholder.
5. KuikChat server creates FileNinja transfer.
6. Client requests or receives upload URL metadata.
7. Client uploads file directly to FileNinja signed upload URL.
8. Client notifies KuikChat server that upload completed.
9. KuikChat server calls FileNinja complete.
10. KuikChat updates the message to ready and inserts/updates attachment metadata.

Implementation note: keep FileNinja API credentials server-side. The browser may receive signed upload URL/token only after KuikChat has verified chat membership and transfer ownership.

## Delivery Link Flow

Delivery link source of truth is FileNinja:

```text
KuikChat stores deliveryUrl -> FileNinja /d/{shareToken}
FileNinja /d route -> signed download URL generation
FileNinja storage -> private bucket object
```

KuikChat should:

- render FileNinja delivery cards from message metadata
- open delivery links in a new tab or in-app browser view
- refresh status only through FileNinja API
- mark expired/revoked links as unavailable if FileNinja reports that state

KuikChat should not:

- fetch the underlying object from FileNinja storage directly
- store signed download URLs
- cache signed download URLs beyond a single user action

## Security Model

Server-side only:

- `FILENINJA_API_KEY`
- FileNinja internal transfer create/status/complete calls
- chat membership and authorization checks

Client-visible:

- FileNinja delivery URL
- temporary signed upload URL/token scoped to one planned object
- user-safe transfer/file metadata

Controls:

- provider disabled unless `FILENINJA_PROVIDER_ENABLED=true`
- require authenticated KuikChat user
- require chat membership before transfer creation
- limit max file size per plan
- validate MIME type and file extension on both KuikChat and FileNinja sides
- rate limit transfer creation per user/chat
- include `source_app=kuikchat` and external references for auditability
- do not store service-role keys or provider API keys in client bundles

Failure handling:

- if transfer creation fails, remove optimistic message
- if upload fails, keep retryable pending message
- if complete fails, retry completion before asking user to re-upload
- if FileNinja reports revoked/expired, render unavailable state

## Rollout Plan

Phase 0: readiness

- FileNinja production hardening complete.
- FileNinja signed upload/download gate passes in production.
- FileNinja internal API auth contract finalized.
- KuikChat FileNinja provider remains disabled by default.

Phase 1: internal staging

- Enable FileNinja provider in KuikChat staging.
- Upload one small PDF and one larger document through FileNinja.
- Confirm no raw FileNinja storage URLs are stored.
- Confirm delivery card opens FileNinja link.
- Confirm failed upload retry behavior.

Phase 2: limited production beta

- Enable for internal/admin users only.
- Cap file size and transfer count.
- Monitor FileNinja events and KuikChat errors.
- Keep fallback to normal KuikChat attachment flow.

Phase 3: broader rollout

- Enable for eligible plans.
- Add plan limits and billing hooks.
- Add transfer revocation/status refresh UI.

## Slice Breakdown

Slice FN-KC-1: Provider contract and server client

- Add FileNinja server client.
- Implement typed request/response objects.
- Keep feature flag disabled by default.
- Add unit tests for config and disabled provider behavior.

Slice FN-KC-2: Transfer creation and pending message

- Wire `file.transfer` intent to FileNinja create transfer.
- Store pending message metadata.
- Do not upload bytes yet.

Slice FN-KC-3: Signed upload flow

- Add browser upload to FileNinja signed URL.
- Add progress and retry state.
- Keep credentials server-side.

Slice FN-KC-4: Complete transfer and delivery card

- Call FileNinja complete.
- Store ready delivery metadata.
- Render FileNinja card in chat.

Slice FN-KC-5: Status, expiry, and revocation

- Add status refresh.
- Render expired/revoked states.
- Add optional sender revocation action.

Slice FN-KC-6: Rollout controls

- Add per-plan file limits.
- Add rate limiting.
- Add monitoring and QA checklist.

## QA Checklist

- Provider disabled when env vars are missing.
- Non-member cannot create a transfer in a chat.
- Small normal attachment still uses KuikChat existing path.
- Secure file creates FileNinja transfer.
- Signed upload succeeds.
- FileNinja complete succeeds.
- KuikChat message renders delivery card.
- Delivery link opens and downloads through FileNinja signed download path.
- Failed upload is retryable.
- No raw `/storage/v1/object/public/` FileNinja URLs are stored.
- No provider API key appears in browser source or network responses.
