# Architecture Boundary

## Two states must not be confused

| Layer | Existing reference snapshot | Mobile MVP1 target |
|---|---|---|
| UI | React 19 SPA | Responsive Svelte PWA |
| Map | Leaflet | MapLibre GL JS |
| Online client | Existing Floodcaster HTTP wrapper | Typed /mobile/v1 client |
| Offline map | Not implemented | Immutable PMTiles in OPFS |
| Offline work | Not implemented | IndexedDB operation journal |
| Identity | Stored API-key patterns in reference code | Cognito User Pool, Authorization Code + PKCE, access token |
| Domain authority | Backend services | Rust floodcaster-platform reconciliation boundary |
| Authoritative state | Backend-owned | Aurora/PostGIS |
| MCP | Not needed for the SPA | Explicitly not a Mobile MVP1 dependency |

## Runtime boundary

The mobile/browser client records claims and submits them. It does not make an authoritative determination and it never mutates authoritative spatial state directly.

Rust owns verification of identity mapping, delegated authority, integrity, policy, area membership, revision, replay/idempotency, certificate issuance, receipt persistence, and the authoritative PostGIS transaction.

Python may remain behind the backend boundary or in governed build/data tooling. Language choice is invisible to the client because the client consumes HTTPS/JSON contracts.

## Authority distinctions

- Cognito answers who authenticated.
- Floodcaster answers what the principal may do.
- Signed offline authority delegates bounded offline scope.
- PMTiles proves presentation provenance, never authorization.
- The browser records FIELD_REVIEWED; it cannot set APPLIED.
- APPLIED, VERIFY_REQUIRED, and REJECTED are domain outcomes.
- Transport, database, cryptographic service, and program failures surface separately as system errors.
