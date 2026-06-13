# KuikChat to Rev-Pro Integration Design

Status: planning only. Do not implement until Rev-Pro staging worker validation is green.

## Goals

- Route media intelligence requests from KuikChat to Rev-Pro's async media job system.
- Avoid request-time transcription inside KuikChat.
- Return transcripts, summaries, captions, and notes to the chat once Rev-Pro completes the job.
- Keep Rev-Pro worker execution outside the KuikChat request lifecycle.

## Media Job Creation

1. User sends a media intelligence intent from KuikChat:
   - `media.transcribe`
   - `media.summarize`
   - `media.caption`
   - `media.notes`
2. KuikChat backend validates the chat, user, and source message/file/link.
3. KuikChat calls the Rev-Pro job creation endpoint using `REVPRO_API_URL` and `REVPRO_API_KEY`.
4. Rev-Pro creates a `media_jobs` row with:
   - `source_app = kuikchat`
   - `external_reference = <kuikchat-message-or-job-reference>`
   - requested outputs
   - callback URL or polling metadata
5. Rev-Pro returns a job id and initial status.
6. KuikChat stores the Rev-Pro job id on the chat message or companion job record.

Expected KuikChat job metadata:

```json
{
  "provider": "revpro",
  "jobId": "uuid",
  "sourceMessageId": "message-id",
  "requestedOutputs": ["transcript", "summary"],
  "status": "queued"
}
```

## Job Status Tracking

KuikChat should support polling first, with webhooks/callbacks as a later optimization.

Status mapping:

```text
queued -> pending
claimed/downloading/extracting_audio/transcribing/summarizing -> processing
completed -> ready
failed/canceled/expired -> unavailable
```

The UI should show one compact processing card per job and avoid blocking chat input while Rev-Pro works.

## Transcript Delivery

When Rev-Pro reports completion:

1. KuikChat fetches the transcript result from Rev-Pro.
2. KuikChat stores a structured result reference, not a duplicate full processing artifact unless product policy requires local persistence.
3. The chat renders transcript text with source attribution and timestamp metadata when available.
4. Long transcripts should collapse by default with an expand action.

## Summary Delivery

Summary results should render separately from transcripts:

- short summary
- action items, if available
- chapters or timestamps, if available
- provider status/error metadata for failed jobs

KuikChat should allow the user to regenerate or request a different output only after the initial job lifecycle is proven stable.

## Chat UX For Completed Jobs

- Processing state: "Queued", "Processing", or current Rev-Pro lifecycle status.
- Success state: transcript/summary result card attached to the original message.
- Failure state: clear reason and retry action when retryable.
- Expired/canceled state: unavailable card with no retry unless Rev-Pro says the source can be resubmitted.

## Readiness Gates

- Rev-Pro `media-lifecycle-qa.mjs` passes against staging.
- Rev-Pro `media-worker-qa.mjs` passes against staging.
- Rev-Pro staging service-role key is valid and belongs to the staging project ref.
- Rev-Pro production guard no longer points production variables at staging.
- Worker temp directories and QA rows are cleaned after staging validation.
- KuikChat provider remains disabled when `REVPRO_API_URL` or `REVPRO_API_KEY` is missing.

## Non-Goals

- Do not call the legacy synchronous Rev-Pro transcription path from KuikChat.
- Do not run Whisper, yt-dlp, or media processing inside KuikChat.
- Do not implement Rev-Pro provider calls until staging worker validation is green.
