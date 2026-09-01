# Contractor Brief

## Assignment

Build a bounded, runnable mobile-client POC against the supplied draft contract and synthetic fixtures. You are testing a client of Floodcaster, not rebuilding Floodcaster and not proposing a second source of truth.

Select one implementation path and justify it with measured results. The client framework is not predetermined.

## Required milestone deliverable

Your fixed-price milestone is complete only when the repository contains:

1. runnable source for one iOS/Android-capable client path;
2. a reproducible build/run procedure on a named device or simulator;
3. the complete acceptance scenario in [POC-SCOPE.md](POC-SCOPE.md);
4. automated tests for queue durability, stable operation IDs, and artifact-state rendering;
5. a short screen recording showing the required scenario and process-kill tests;
6. measurements for cold start, map interaction, cache size, and reconnect behavior using the supplied fixture scale;
7. a dependency and license inventory, including paid or trial plugins;
8. a reuse matrix for the supplied SPA: reuse unchanged, adapt, rebuild, or omit;
9. a risk register naming platform restrictions and unproven assumptions; and
10. a fixed-price estimate for the next production stage, separated from this POC.

A proposal, wireframe, architecture memo, generated scaffold, or happy-path demo alone is not an accepted deliverable.

## Required implementation behavior

- Render issued determinations only from the server response defined by the contract.
- Display certificate ID, issuer/engine identity, engine digest/version, issuance time, and verification/status state for an issued determination.
- Render field observations with explicit user/device provenance (which account created it, on which device — an account identifier is sufficient; no personal name is required), observed time, and sync state.
- Distinguish observation and determination artifacts by text, iconography, structure, and accessibility semantics; color alone is insufficient.
- Persist an offline action and its client-generated operation ID before showing a submitted/queued confirmation.
- Preserve queued work across process termination, device restart where the chosen path supports it, and authentication expiry.
- Treat GPS as a proposed property match. Require explicit user confirmation and retain horizontal accuracy and CRS (coordinate reference system — WGS 84 / EPSG:4326 throughout this contract).
- Send observations for server adjudication (the server reviews and decides). Never let the client resolve a conflict or issue a determination itself.

## Outside contractor authority

The contractor does not own or change flood analytics, Rust/Python services, RSCT/certificate semantics, canonical production schemas, authorization authority, PostGIS authority, customer data, or production infrastructure.

Questions that require a production contract decision must be recorded as a contract gap. Do not invent backend behavior to make the demo pass.

## Disqualifying findings

- Any locally created object is shown as certified or determination-shaped.
- The client constructs certified metadata from configuration or display constants.
- A queued action can disappear after the UI confirms it.
- Reconnect can apply the same operation twice because the operation ID changes.
- The client treats itself as authoritative in a conflict.
- The POC depends on production credentials, production data, or undocumented backend access.

Use [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md) for the detailed evidence and paste [SUBMISSION-FORM.md](SUBMISSION-FORM.md) into the Fiverr delivery message. Deadline, question channel, and delivery options are in the README quick start.
