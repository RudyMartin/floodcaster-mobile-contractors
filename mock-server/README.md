# Local Contract Mock

Run from the repository root:

```bash
node mock-server/server.mjs
```

The server listens on `127.0.0.1:8787` by default. Set `FLOODCASTER_MOCK_PORT` to use another local port.

For `POST /mobile/v1/operations`, choose a synthetic outcome with `X-Floodcaster-Mock-Scenario`: `applied`, `verify-required`, `rejected`, `replay`, or `collision`.

For `GET /mobile/v1/determinations/DET-TEST-001`, send `X-Floodcaster-Mock-Determination-State: superseded` to exercise stale-cache handling.

This is a fixture server, not a Floodcaster backend implementation.
