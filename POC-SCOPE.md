# Mobile POC Scope

## Milestone question

Can the selected client approach safely support Floodcaster's field workflow and authority boundary on iOS and Android, with enough evidence to estimate a production implementation?

## Required acceptance scenario

The POC must demonstrate all of the following against the supplied mock contract:

1. Search/select the synthetic property and render its server-derived geometry.
2. Retrieve an issued determination and show certificate ID, issuer/engine, digest/version, issuance time, and status.
3. Pin the supplied test area for offline presentation.
4. Go offline and create a field observation containing a note, GPS coordinates, horizontal accuracy, property confirmation, and optional test photo metadata.
5. Show the observation beside the issued determination with unmistakably different artifact labels and structure.
6. Terminate the app process immediately after submit at several timing points; queued work and the same operation ID survive.
7. Let authentication expire while offline; queued work remains locally present and cannot be sent until re-authentication.
8. Reconnect and submit. Render transport state separately from the server domain outcome.
9. Retry the same operation and demonstrate idempotent replay rather than duplicate application.
10. Refresh a cached determination after the mock reports it superseded; the prior result is no longer presented as current.
11. Background/foreground repeatedly and demonstrate map recovery.

## Performance probe

Use a representative synthetic layer at the supplied baseline scale, then repeat at three times the feature count. Report the device, OS, renderer, feature count, interaction frame-rate or latency method, memory behavior, and failure point. Do not report “smooth” without measurements.

## Out of scope

- flood-model execution on device;
- local determination issuance;
- changes to Rust/Python services or certificate semantics;
- production authentication, customer data, production endpoints, or App Store submission;
- a complete offline basemap region (the repository supplies only a handoff format, not licensed production map content);
- final production framework selection without measured POC evidence.

## Acceptance

Floodcaster accepts the milestone after the required code, tests, recording, measurements, dependency/license inventory, and completed response template are delivered and reproducible. Missing platform limitations must be stated; hidden substitutions are not acceptable.
