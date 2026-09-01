# Local Contract Mock

Run from the repository root:

```bash
node mock-server/server.mjs
```

The server listens on `127.0.0.1:8787` by default. Set `FLOODCASTER_MOCK_PORT` to use another local port.

For `POST /mobile/v1/operations`, choose a synthetic outcome with `X-Floodcaster-Mock-Scenario`: `applied`, `verify-required`, `rejected`, `replay`, or `collision`.

For `GET /mobile/v1/determinations/DET-TEST-001`, send `X-Floodcaster-Mock-Determination-State: superseded` to exercise stale-cache handling.

Authentication simulation: `POST /mobile/v1/session` returns a `Bearer` token with an explicit `expires_at` (TTL via `FLOODCASTER_MOCK_SESSION_TTL_SECONDS`, default 300). `POST /mobile/v1/operations` requires the token and returns `401 AUTH_REQUIRED`/`AUTH_EXPIRED` otherwise. Send `X-Floodcaster-Mock-Session-State: expired` to force expiry deterministically — queued client work must survive the 401 unchanged.

This is a fixture server, not a Floodcaster backend implementation.
