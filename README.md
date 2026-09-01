# Floodcaster Mobile Client POC

> **PUBLIC BRIEFING SNAPSHOT — TEST DATA ONLY**
>
> Make this repository private before adding contractor work product, credentials, production endpoints, proprietary backend material, or non-public data.

Floodcaster is the authoritative flood-decision and evidence platform. The mobile app is one governed client of that platform. This repository tests whether a field user can safely consume an issued Floodcaster determination, work through connectivity loss, create a user-attested field observation, and submit it for server adjudication.

The phone must never manufacture, infer, restyle, or present a field observation as an issued Floodcaster determination.

The React/Leaflet application at the repository root is a sanitized reference snapshot of `NextShiftConsulting/floodcaster-web` at commit `8c58b678ff127e884153b7750e9da05a4de83920`. It demonstrates existing workflows; it is not the mandated mobile implementation stack.

## Start here

1. [CONTRACTOR-BRIEF.md](CONTRACTOR-BRIEF.md) — assignment and required deliverables
2. [PRODUCT-INVARIANTS.md](PRODUCT-INVARIANTS.md) — disqualifying boundaries
3. [POC-SCOPE.md](POC-SCOPE.md) — executable milestone scenario
4. [USER-FLOWS.md](USER-FLOWS.md) — online, offline, reconnect, and supersession flows
5. [API-BOUNDARY.md](API-BOUNDARY.md) — client-facing service boundary
6. [contracts/floodcaster-mobile.openapi.yaml](contracts/floodcaster-mobile.openapi.yaml) — draft POC contract
7. [fixtures/README.md](fixtures/README.md) — synthetic test cases
8. [mock-server/README.md](mock-server/README.md) — local API simulator
9. [docs/ACCEPTANCE-TEST-SCRIPT.md](docs/ACCEPTANCE-TEST-SCRIPT.md) — the deterministic numbered script every contractor runs
10. [docs/VISUAL-STATE-SHEET.md](docs/VISUAL-STATE-SHEET.md) — required fields and states for the four reference screens ([wireframes](docs/ui-states/))
11. [docs/TEST-CORPUS-SPEC.md](docs/TEST-CORPUS-SPEC.md) — what "representative" data means; corpus supplied by Floodcaster
12. [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md) — required response format
13. [FAQ.md](FAQ.md) and [KNOWN-GAPS.md](KNOWN-GAPS.md)

The existing [infosec review pack](docs/infosec/INFOSEC-FLOW-INDEX.md) remains part of the briefing and is intentionally unchanged by this architecture revision.

## Run the reference SPA

```bash
npm ci
npm run dev
```

Use only approved mock or test endpoints. The public snapshot defaults to `http://localhost:8787`.

## Run the contract mock

```bash
node mock-server/server.mjs
```

The mock serves only synthetic `TEST_ONLY` fixtures. It is not Floodcaster backend code and is not a production API.

Sanity-check your environment (boots the mock, walks every contract scenario, verifies layer digests):

```bash
node scripts/dry-run.mjs
```

## What is fixed and what is open

| Fixed | Open for evidence-based recommendation |
| --- | --- |
| Floodcaster server is authoritative | React Native/Expo, Capacitor, Flutter, PWA, or another justified client stack |
| Mobile consumes issued determinations | Degree of reuse from the reference SPA |
| Mobile creates user-attested observations | Map renderer and durable local-storage implementation |
| HTTPS/JSON client contract | Packaging and native integration choices |
| Client never issues a determination | Production estimate after the bounded POC |

No open-source license is granted. See [NOTICE.md](NOTICE.md).
