# Contractor Delivery and Assessment

Complete every section. Link claims to code, tests, recordings, or measured output.

## 1. Implemented path

- Framework/version:
- Map renderer/version:
- Local durable store:
- Tested devices and OS versions:
- Reproducible run/build commands:

## 2. Acceptance evidence

| Required scenario | Evidence link | Pass/fail | Limitation |
| --- | --- | --- | --- |
| Issued determination provenance | | | |
| Observation/determination side by side | | | |
| Offline durable queue | | | |
| Process-kill timing tests | | | |
| Auth expiry without data loss | | | |
| Stable-ID replay | | | |
| Rejection/verify-required rendering | | | |
| Superseded cached determination | | | |
| Background/foreground map recovery | | | |
| Baseline and 3× map load | | | |

## 2a. Automated tests (deliverable 4)

- Exact command to run the tests:
- What they cover — one line each for: queue durability, stable operation IDs, artifact-state rendering:
- Paste the final line of the test output (counts of pass/fail):
- Screen recording file/link (deliverable 5) and which scenario minutes cover the process-kill tests:

## 3. Measurements

Report device, OS, build mode, data size, method, median, worst observed value, and failure point for cold start, map interaction, cache/pin, offline reopen, and reconnect processing.

## 4. SPA reuse matrix

| Existing area | Reuse unchanged | Adapt | Rebuild | Omit | Evidence/reason |
| --- | --- | --- | --- | --- | --- |

## 5. Dependencies and licenses

List every direct dependency/plugin, version, license, paid/trial status, native maintenance owner, and offline-map restrictions.

## 6. Risks and contract gaps

Separate measured failures, platform constraints, assumptions, and decisions required from Floodcaster.

## 7. Recommendation

State whether this path should proceed, the evidence supporting that decision, and the smallest next private integration milestone.

## 8. Next-stage fixed price

Separate scope, deliverables, exclusions, calendar estimate, labor estimate, and fixed price. Do not roll production release into the POC price.
