# Product Invariants

These are acceptance gates, not design preferences.

## 1. Only Floodcaster issues determinations

An issued determination is a persisted engine-issued artifact returned by the governed service boundary. The client may cache and render it, but may not create, reinterpret, restyle, or upgrade any local object into one.

Certified fields must come from the issued artifact:

- determination and certificate identifiers;
- issuer and engine identity;
- engine version and digest;
- issuance time;
- artifact digest; and
- current verification/status state.

## 2. A field observation is user-attested evidence

Do not collapse authority into one field. Model the separate authority dimensions — the user IS the authority on what they claim to have observed, and has NO authority to issue a determination:

| Field | Required value before server adjudication |
| --- | --- |
| `artifact_class` | `FIELD_OBSERVATION` |
| `created_by` | authenticated mobile user |
| `attestation_authority` | `USER` |
| `determination_authority` | `NONE` |

An observation can contain a photo, note, GPS fix, accuracy, timestamp, and confirmed property association. It is not a flood finding.

## 3. State dimensions remain separate

Do not overload one `status` field.

| Dimension | Example values |
| --- | --- |
| `sync_state` | `DRAFT`, `PERSISTED_LOCAL`, `QUEUED`, `SENDING`, `ACKNOWLEDGED`, `RETRYABLE_ERROR` |
| `evidence_state` | `UNASSESSED`, `ADMITTED`, `REJECTED` |
| `determination_state` | `NOT_ISSUED`, `ISSUED` |
| server `domain_outcome` | `APPLIED`, `VERIFY_REQUIRED`, `REJECTED` |

Transport acknowledgement does not mean the evidence was admitted or a determination was issued.

## 4. Offline confirmation follows durable persistence

The client generates an operation ID once and durably stores the action before it displays a queued/submitted confirmation. The operation ID survives retries, process death, authentication expiry, and reconnect. Server replay is authoritative.

## 5. GPS proposes; the user confirms

The client must not silently assign the nearest building. Submission records the selected property, selection method, explicit confirmation, WGS84 coordinates, and horizontal accuracy.

## 6. Cached data is non-authoritative presentation material

Offline map data and cached determinations carry freshness/status information. A client that cannot establish current status must say so. Reconnect must detect a server-reported supersession or revocation without silently presenting the prior record as current.

## 7. The API is the client boundary

Mobile and web clients use documented HTTPS APIs. AI agents may separately use MCP (Model Context Protocol — irrelevant to the mobile client), but every path reaches the same Floodcaster services; there is no separate backend for mobile. No client directly invokes Rust, Python, a database, or certificate internals.
