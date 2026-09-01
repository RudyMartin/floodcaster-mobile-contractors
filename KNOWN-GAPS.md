# Known Gaps

| Gap | Current evidence | Contractor assessment need |
|---|---|---|
| Framework | React SPA | Identify logic/assets worth porting to Svelte; do not assume component reuse |
| Mapping | Leaflet and online tiles | Prove MapLibre + immutable PMTiles performance and offline behavior |
| Offline storage | No certified OPFS pack flow | Download, hash, state machine, quota/eviction/error behavior |
| Journal/sync | No governed IndexedDB operation journal | Prove immutable operation content, retry, replay, collision mocks |
| Identity | API-key patterns and localStorage | Design Cognito PKCE and separate Floodcaster offline authority |
| GPS | Not a governed field workflow | Permissions, precision, stale position, denial, and fallback UX |
| Camera | Not implemented | Permission, capture, cancellation, metadata, offline attachment constraints |
| Secure local handling | Not established | Threat model tokens, authority artifacts, local records, logout, revocation |
| Mobile API | Existing SPA endpoints only | Define only from approved /mobile/v1 contracts; use mocks until supplied |
| Reconciliation | Not in the SPA | Keep Rust server authoritative; client never declares APPLIED |
| Browser/device support | Not certified | Recommend an explicit phone/tablet/desktop browser matrix |
| Accessibility | Not assessed for field POC | Include keyboard, contrast, touch target, status, and error-state review |

## Important interpretation

A successful reference-SPA build proves only that the starting snapshot is runnable. It does not prove Mobile MVP1 feasibility, offline durability, secure storage, governed reconciliation, or production readiness.
