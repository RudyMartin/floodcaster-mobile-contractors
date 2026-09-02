# Local Contract Mock

Requires Node.js 18 or newer (uses ES modules and built-in `fetch`). Run from the repository root:

```bash
node mock-server/server.mjs
```

The server listens on `127.0.0.1:8787` by default. Set `FLOODCASTER_MOCK_PORT` to use another local port.

For `POST /mobile/v1/operations`, choose a synthetic outcome with `X-Floodcaster-Mock-Scenario`: `applied`, `verify-required`, `rejected`, `replay`, or `collision`.

For `GET /mobile/v1/determinations/DET-TEST-001`, send `X-Floodcaster-Mock-Determination-State: superseded` to exercise stale-cache handling.

Authentication simulation: `POST /mobile/v1/session` returns a `Bearer` token with an explicit `expires_at` (TTL via `FLOODCASTER_MOCK_SESSION_TTL_SECONDS`, default 300). `POST /mobile/v1/operations` requires the token and returns `401 AUTH_REQUIRED`/`AUTH_EXPIRED` otherwise. Send `X-Floodcaster-Mock-Session-State: expired` to force expiry deterministically — queued client work must survive the 401 unchanged.

Unified hazard example: obtain a session token, then call `GET /mobile/v1/hazards/nearby?lat=43.0731&lon=-89.4012&radius_km=100` with that Bearer token. The fixture returns flood, severe-weather, tropical-cyclone, and wildfire records through one schema together with activated Golden GeoData. Optional repeated `hazard_family` and `time_scope` parameters filter the deterministic response. Other coordinates return `400 TEST_LOCATION_NOT_AVAILABLE` because this mock is intentionally bounded to one test location.

Corpus endpoints: `GET /mobile/v1/properties?query=` searches the 90-property test corpus; `GET /mobile/v1/properties/{id}` returns any corpus read model; `GET /mobile/v1/layers` lists the flood presentation layers with pinned sha256 digests; `GET /mobile/v1/layers/{flood-normal|flood-complex|flood-stress-3x}` streams the GeoJSON.

This is a fixture server, not a Floodcaster backend implementation.
