# POC Scope

## Assessment question

How much of the existing browser SPA can support a mobile-first Floodcaster field workflow, and what must be rebuilt to prove the governed offline reconciliation path?

## Target POC

- One responsive Svelte PWA for phone, tablet, and desktop.
- One Bologna area of interest.
- MapLibre GL JS with one immutable PMTiles delivery pack.
- Offline PMTiles stored in OPFS.
- IndexedDB operation journal.
- One offline-recorded operation: FIELD_REVIEWED.
- Amazon Cognito User Pool using Authorization Code + PKCE.
- Floodcaster-issued offline authority.
- Server-side Rust reconciliation through documented HTTPS APIs.
- Outcomes: APPLIED, VERIFY_REQUIRED, or REJECTED.

## Required feasibility probes

| Probe | Evidence expected |
|---|---|
| Responsive field UI | Phone, tablet, and desktop captures from one codebase |
| GPS and map | Accuracy/error states plus representative pan/zoom performance |
| Camera | Capture/attach flow with permission denial and cancellation handling |
| Offline map | Download, raw-byte digest verification, OPFS availability, reopen offline |
| Offline journal | Record, retry without mutation, reconnect, replay/collision behavior via mocks |
| Secure handling | Threat analysis for tokens, offline authority, local data, and logout/revocation |
| API boundary | Typed client and mock contract; no direct Rust/Python/MCP invocation |

## Assessment deliverables

1. Reuse/adapt/rebuild matrix.
2. Proposed POC architecture.
3. Technical spike plan and acceptance tests.
4. Device/browser test matrix.
5. Risks and unresolved decisions.
6. Fixed-price milestone proposal.

## Excluded from this phase

- Product implementation.
- Native iOS/Android, React Native, or Expo.
- Backend or database changes.
- Production deployment or credentials.
- Canonical schema, signature, certificate, receipt, or policy changes.
- MCP dependency.
- Generic synchronization platform.
- Fabricated RSCT R/S/N/kappa values.
