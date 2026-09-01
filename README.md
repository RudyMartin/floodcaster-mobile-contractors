# Floodcaster Mobile Client POC

> **PUBLIC BRIEFING SNAPSHOT — TEST DATA ONLY**
>
> Make this repository private before adding contractor work product, credentials, production endpoints, proprietary backend material, or non-public data.

## Why does this project exist?

Floodcaster is a platform that issues certified flood determinations — official, signed answers about flood risk for a property. The people who need those answers are often standing in a field, in bad weather, with no signal. They need to see official results offline, record what they observe, and trust that nothing they queued gets lost.

That creates one hard rule that shapes everything here: **the phone shows official results and collects observations, but only the Floodcaster server may issue a determination.** A user's field observation is valuable evidence — but it is their claim, not an official finding, until the server reviews it.

This POC exists to answer one question with evidence: which mobile approach handles that workflow best? Three contractors build the same scenario independently; the measured results decide. For you, it is also a paid, well-defined exercise in offline-first design, safe retry semantics, and authority-aware UI — patterns you will reuse long after this milestone, and the winning approach may lead to a longer engagement.

## What are you building?

One mobile client (your choice of stack) that can: look up a property, display its certified determination, save a map area for offline use, capture a field observation while offline, survive the app being killed and the login expiring, and submit safely when connectivity returns. Four reference screens in [docs/VISUAL-STATE-SHEET.md](docs/VISUAL-STATE-SHEET.md) define what each state must show — you own the visual design around those requirements.

## How does it work?

The happy path, end to end:

1. The app starts online and loads `/mobile/v1/bootstrap`.
2. The user searches for a property and opens it — the API returns its geometry and its determination.
3. The app shows the certified determination: certificate ID, issuer, engine, issued time, status — every value taken from the API response, never invented by the app.
4. The user pins the test area; the app downloads the offline map pack and verifies its checksum.
5. Connectivity drops. The map still works. The user records an observation (note, GPS, photo metadata) and confirms which property it belongs to.
6. The app saves the observation durably with a stable operation ID, then — and only then — shows it as queued.
7. Connectivity returns. The user logs in again; the queue is untouched. The app submits the operation.
8. The server acknowledges receipt, then separately reports its decision: `APPLIED`, `VERIFY_REQUIRED`, or `REJECTED`. The app displays that decision exactly as returned.

Try it right now — no reading required:

```bash
node scripts/dry-run.mjs        # Node.js 18+; boots the mock, proves all 16 API scenarios
node mock-server/server.mjs     # the local TEST_ONLY API on http://localhost:8787
npm ci && npm run dev           # the reference web app (a workflow example, not the required stack)
```

[docs/API-PROOF.md](docs/API-PROOF.md) shows what every API call returns, its payload size, and its measured response time — regenerate it yourself with `node scripts/generate-api-proof.mjs`.

## What happens when things fail?

Failure handling *is* the product. Each failure below has a defined correct behavior and a test that proves it:

| When this happens | Your app must | Proven by |
| --- | --- | --- |
| App is killed right after saving an observation | The observation and its operation ID are still there on relaunch | Acceptance script C4, C5, C7 |
| Login expires while offline | Queued work stays, clearly not sendable until re-login; nothing is deleted | Script C6; mock returns `401 AUTH_EXPIRED` |
| The same operation is sent twice | One application, not two — the server reports a replay of the original result | Script D4; `replay` scenario |
| Same operation ID reused with different content | Stop and surface the collision; never mint a new ID to hide it | Script D5; `collision` scenario (409) |
| Server rejects or defers the observation | Show the server's decision as-is; the app never overrides it | Script D6; `rejected` / `verify-required` scenarios |
| A cached determination is superseded | Visibly demote it — a stale result is never shown as current | Script E1–E2; superseded toggle |
| App is backgrounded and resumed repeatedly | The map recovers every time | Script F1 |
| The map layer is 3× normal size | Measure honestly; a documented failure point is a valid result | Script F2–F3; `flood-stress-3x` layer |

If a scenario surprises you, the fixture for it is in [fixtures/](fixtures/README.md) and the mock can reproduce it on demand.

## Tips, tricks, and traps

[docs/TIPS-TRICKS-TRAPS.md](docs/TIPS-TRICKS-TRAPS.md) collects the practical lessons — the mistakes that cost bidders their 14 days and the shortcuts that don't. Read it before writing code; it is short on purpose.

## Quick start for bidders

The practical facts:

- **Price:** $200, fixed, for exactly the ten deliverables in [CONTRACTOR-BRIEF.md](CONTRACTOR-BRIEF.md). Nothing is added or negotiated later inside this milestone.
- **Schedule:** **Day 2 after accepting** — orientation check-in on Fiverr: paste your dry-run output, restate in your own words what you are building and what the phone must never do, and ask your first questions (we reply within 24 hours; a wrong restatement caught on day 2 costs nothing). **Tuesdays and Fridays** — three-line status on Fiverr: done / next / blocked. **Friday Sept 11** — progress checkpoint: your workspace shows the dry-run passing and offline observation capture working. **Friday Sept 18** — final submission (end of day, your local time). **Friday Sept 25** — evaluation complete; results announced.
- **Questions:** ask in your Fiverr order conversation — it keeps the complete record tied to your engagement. Kit bugs or questions useful to everyone may also go to a [GitHub issue](../../issues); either way, answers that matter to all bidders are published in the FAQ.
- **Workspace:** when hired, you receive an invite to your own private workspace repository, pre-loaded with this kit (mock, fixtures, dry-run). Push your work there as you go — you and Floodcaster can see it; other contractors cannot. If you cannot use GitHub, a ZIP of all files attached to the Fiverr delivery is an accepted alternative.
- **Submission and payment:** through the Fiverr engagement. Final delivery = your workspace repository (or ZIP) containing the completed [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md), plus [SUBMISSION-FORM.md](SUBMISSION-FORM.md) pasted into the Fiverr delivery message. Never push contractor work into this public repository.
- **First command:** `node scripts/dry-run.mjs` (Node.js 18 or newer). If all 16 checks pass, your environment works. If it fails, the problem is the environment — not you.
- **Contract as JSON:** [contracts/floodcaster-mobile.openapi.json](contracts/floodcaster-mobile.openapi.json) (same content as the YAML).

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

## The full reading list

Read the sections above first; then these carry the binding detail:

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
11. [docs/TEST-CORPUS-SPEC.md](docs/TEST-CORPUS-SPEC.md) — the delivered representative test data
12. [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md) — required response format
13. [FAQ.md](FAQ.md) and [KNOWN-GAPS.md](KNOWN-GAPS.md)

The [infosec review pack](docs/infosec/INFOSEC-FLOW-INDEX.md) remains part of the briefing and is intentionally unchanged.

## What is fixed and what is open

| Fixed | Open for evidence-based recommendation |
| --- | --- |
| Floodcaster server is authoritative | React Native/Expo, Capacitor, Flutter, PWA, or another justified client stack |
| Mobile consumes issued determinations | Degree of reuse from the reference SPA |
| Mobile creates user-attested observations | Map renderer and durable local-storage implementation |
| HTTPS/JSON client contract | Packaging and native integration choices |
| Client never issues a determination | Production estimate after the bounded POC |

No open-source license is granted; good-faith assessment work is exactly what this material is published for. See [NOTICE.md](NOTICE.md).
