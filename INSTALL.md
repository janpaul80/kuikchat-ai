# KuikChat Legal Stub Pages — /cookies and /gdpr

These fix the dead footer links flagged in the security scan.

## Copy these files (keep paths):
- src/app/(marketing)/cookies/page.tsx
- src/app/(marketing)/gdpr/page.tsx

Both reuse BubbleHero (same animation, page-specific copy) + a simple legal body.

## After copying:
1. Build to confirm all footer links resolve:
   npx tsc --noEmit
   npm run build
2. Run dev and click every footer link - none should 404:
   npm run dev

## Note
These are STARTER legal texts. Have them reviewed by legal counsel before public launch.
The /privacy and /terms pages already exist; these add /cookies and /gdpr so the
footer has no dead links.
