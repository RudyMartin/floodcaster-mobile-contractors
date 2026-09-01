# User Flows

## Retrieve and recognize an issued determination

1. Client retrieves a property read model from the HTTPS API.
2. Client retrieves the referenced issued determination and certificate.
3. UI renders an `ISSUED DETERMINATION` artifact using only returned certified fields.
4. Status is shown as `CURRENT`, `SUPERSEDED`, `REVOKED`, or `UNKNOWN`; unknown is not rendered as current.

## Create an observation offline

1. User selects a property; GPS may propose but not silently decide it.
2. User confirms the property and records an observation.
3. Client generates an operation ID and durably persists the observation.
4. Only then may the UI show `QUEUED OFFLINE`.
5. The artifact remains labeled `FIELD OBSERVATION — NOT A FLOODCASTER DETERMINATION`.

## Reconnect and adjudicate

1. Client restores a valid authenticated session without deleting queued work.
2. Client sends the same operation ID and observation payload.
3. Server returns an acknowledgement and a separate domain outcome.
4. Client marks the transport acknowledged, then renders `APPLIED`, `VERIFY_REQUIRED`, or `REJECTED` as the server decision.
5. A retry with the same operation ID is displayed as a replay, not a second application.
6. Any operation-ID collision is stopped and surfaced; the client does not generate a new ID to mask it.

## Handle a superseded cached determination

1. Client may display the cached artifact offline with its last-known status and verification time.
2. On reconnect, client refreshes authoritative status.
3. If superseded or revoked, the cached result is visibly demoted and cannot be shown as current.
4. A replacement is displayed only if returned as a distinct issued artifact.
