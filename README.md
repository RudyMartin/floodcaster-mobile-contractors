# Floodcaster Mobile Client POC

> **PUBLIC BRIEFING SNAPSHOT — TEST DATA ONLY**
>
> Make this repository private before adding contractor work product, credentials, production endpoints, proprietary backend material, or non-public data.

Floodcaster is the authoritative flood-decision and evidence platform. The mobile app is one governed client of that platform. This repository tests whether a field user can safely consume an issued Floodcaster determination, work through connectivity loss, create a user-attested field observation, and submit it for server adjudication.

The phone must never manufacture, infer, restyle, or present a field observation as an issued Floodcaster determination.

The React/Leaflet application at the repository root is a sanitized reference snapshot of `NextShiftConsulting/floodcaster-web` at commit `8c58b678ff127e884153b7750e9da05a4de83920`. It demonstrates existing workflows; it is not the mandated mobile implementation stack.

## Quick start for bidders

The practical facts, before the reading list:

- **Price:** $200, fixed, for exactly the ten deliverables in [CONTRACTOR-BRIEF.md](CONTRACTOR-BRIEF.md). Nothing is added or negotiated later inside this milestone.
- **Deadline:** 14 calendar days from the day you accept the milestone.
- **Questions:** open a GitHub issue on this repository. Questions and answers are public so every bidder sees the same information.
- **Submission and payment:** through the Fiverr engagement. Preferred: deliver your code as a private GitHub repository shared with us. If you cannot use GitHub, a ZIP of all files attached to the Fiverr delivery is fine. Either way, include the completed [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md) and paste [SUBMISSION-FORM.md](SUBMISSION-FORM.md) into the Fiverr delivery message. Never push contractor work into this public repository.
- **First command:** `node scripts/dry-run.mjs` (Node.js 18 or newer). If all 16 checks pass, your environment works. If it fails, the problem is the environment — not you.

### Plain-English glossary

| Term | Meaning here |
| --- | --- |
| determination | A flood finding issued by the Floodcaster server. The phone displays it; the phone never creates one. |
| certificate | The server's signed proof attached to a determination (who issued it, when, from which engine). |
| field observation | A note/photo/GPS record a user creates on the phone. It is the user's claim, not a flood finding. |
| artifact | Any one of the objects above, as a stored JSON record. |
| read model | A read-only JSON view of something (like a property) that the API serves to clients. |
| adjudication | The server's review of a submitted observation. The server decides; the phone shows the decision. |
| domain outcome | The server's decision about your submission: `APPLIED`, `VERIFY_REQUIRED`, or `REJECTED`. Separate from "the network request worked". |
| provenance | Where a piece of data came from: who created it, on which device, when. |
| attested | Claimed and signed-for by the user ("I saw this"), but not verified by the server yet. |
| superseded | Replaced by a newer determination. A superseded result must not be shown as current. |
| digest | A SHA-256 checksum. Used to prove a file or record was not changed. |
| idempotent replay | Sending the same operation twice causes one result, not two. The stable operation ID makes this work. |
| fixture | A fake-but-realistic JSON test record served by the mock server. All are marked `TEST_ONLY`. |
| CRS | Coordinate reference system. All API geometry here is WGS 84 (EPSG:4326) — standard GPS lat/lon. |
| MCP | Model Context Protocol — an interface for AI agents. It exists in our ecosystem; **it does not affect your mobile client at all.** |

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
