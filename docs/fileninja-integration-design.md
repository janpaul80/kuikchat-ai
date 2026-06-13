# KuikChat to FileNinja Integration Design

Status: planning only. Do not implement until FileNinja production hardening is approved and completed.

## Goals

- Route professional or large-file chat attachments through FileNinja instead of KuikChat Supabase attachment buckets.
- Keep KuikChat messages free of raw Supabase Storage object URLs.
- Store a FileNinja delivery link and transfer metadata on the KuikChat message.
- Preserve the existing KuikChat attachment path for small inline media until the FileNinja provider is enabled.

## Secure Transfer Flow

1. User selects a document or large attachment in a KuikChat chat.
2. KuikChat classifies the intent as `file.transfer` with provider `fileninja`.
3. KuikChat backend calls the FileNinja internal transfer create endpoint using `FILENINJA_API_URL` and `FILENINJA_API_KEY`.
4. FileNinja creates a transfer with:
   - sender context from the KuikChat user
   - recipient context from the chat or conversation target
   - `source_app = kuikchat`
   - an external reference containing the KuikChat chat/message id
5. FileNinja returns transfer id, share token, public delivery URL, and file upload session metadata.
6. KuikChat creates a pending message that references the FileNinja transfer.
7. KuikChat updates the message once upload and completion succeed.

## Upload Session Flow

The browser should never upload directly to a public FileNinja bucket URL.

1. KuikChat asks FileNinja for a signed upload URL for each planned file.
2. Browser uploads the file using FileNinja's signed upload token.
3. KuikChat or FileNinja marks the file uploaded.
4. KuikChat calls FileNinja complete when all files are uploaded.
5. FileNinja returns the ready delivery URL.
6. KuikChat stores only FileNinja transfer metadata and the delivery URL.

Expected KuikChat message metadata:

```json
{
  "provider": "fileninja",
  "transferId": "uuid",
  "shareToken": "token",
  "deliveryUrl": "https://fileninja.cloud/d/token",
  "status": "ready",
  "fileCount": 1,
  "totalBytes": 12345,
  "expiresAt": "iso-date"
}
```

## Chat Attachment Experience

- Small images, voice clips, and ordinary chat media can continue using KuikChat's existing attachment buckets.
- Large documents and professional file delivery use FileNinja.
- The attachment drawer should show FileNinja only when configured and available.
- While uploading, the chat message should show a pending/progress state.
- On success, the message should render as a FileNinja delivery card with filename, size, expiry, and open/download action.
- On failure, the message should offer retry or remove, without creating a broken delivery link.

## Delivery Link Lifecycle

- KuikChat stores FileNinja delivery links as references, not as storage objects.
- FileNinja remains the source of truth for expiry, revocation, download authorization, and signed download URL generation.
- KuikChat should periodically refresh status for pending transfers.
- Expired or revoked links should render with a clear unavailable state.
- Revocation should be initiated against FileNinja first, then reflected in KuikChat message metadata.

## Readiness Gates

- FileNinja production bucket hardening is complete.
- FileNinja signed upload/download gate passes in production.
- FileNinja internal API authentication contract is documented.
- KuikChat provider remains disabled when `FILENINJA_API_URL` or `FILENINJA_API_KEY` is missing.
- No KuikChat message stores raw FileNinja Supabase Storage URLs.

## Non-Goals

- Do not replace KuikChat's normal image/voice attachment flow in this phase.
- Do not implement FileNinja provider calls until production hardening is approved.
- Do not expose FileNinja service credentials to the browser.
