# API Boundary

## Decision

Do not convert Rust or Python internals into MCP calls for Mobile MVP1. The contractor-facing boundary is HTTPS/JSON.

| Concern | Required boundary |
|---|---|
| Existing SPA calls | Client wrapper in src/api.js |
| Mobile identity | Cognito access token to /mobile/v1/* |
| Offline authorization | Floodcaster-signed offline authority artifact |
| Operation submission | POST /mobile/v1/operations, batch-capable with independent per-operation results |
| Authoritative decision | Rust floodcaster-platform |
| Data mutation | Governed server transaction only |
| Python processing | Backend/build-time only; never browser subprocess execution |
| MCP | Out of scope for Mobile MVP1 |

## Existing reference endpoints

The copied SPA contains calls for /health, /demo/session, /geocode, /certify, /certify/geo, /certify/pair, /lookup, /zone, /rings, /certificates/lookup, /run, /status/{id}, /jobs/{id}, /jobs/{id}/buildings, /v1/signup, /v1/account, /v1/billing/checkout, and /v1/certificate.

These endpoints describe the existing SPA only. They do not define the Mobile MVP1 contract and must not be copied mechanically into the target client.

## Public briefing safety

- The repository defaults to http://localhost:8787.
- Use mocks or an explicitly approved test endpoint.
- Never commit tokens, API keys, Cognito secrets, customer data, AWS details, or production URLs that carry sensitive query material.
- A browser OAuth client must not have a client secret or IAM credentials.
- Treat HTTP failures separately from APPLIED, VERIFY_REQUIRED, or REJECTED.

## Unresolved interface rule

If an exact /mobile/v1 request, response, status-code, or schema is not provided, record it as a question. Do not invent it and do not infer it from the existing SPA.
