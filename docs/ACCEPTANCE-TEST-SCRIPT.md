# Deterministic Acceptance Test Script

Every contractor runs this exact numbered script against the supplied mock server and fixtures. Results are comparable only if the steps, order, and evidence are identical. Record evidence per step in the response template; a step without evidence is not passed.

Conventions:

- Property under test: `PROP-TEST-001`. Determination under test: `DET-TEST-001`.
- "Kill" means force-stop the OS process (not background, not in-app close).
- "Offline" means OS-level airplane mode or equivalent network kill, not a mocked flag inside the app.
- Timestamps in evidence use the device clock; state the timezone once.
- Screen recordings must show the device status bar (connectivity state visible).
- Before starting, run `node scripts/dry-run.mjs` — it boots the mock and proves every contract scenario this script depends on. A failing dry run means the environment, not your client, is broken.

## Part A — Online retrieval and recognition

| # | Action | Required evidence |
| --- | --- | --- |
| A1 | Launch the app online against the mock server. | Recording of cold start; time from tap to interactive. |
| A2 | Search for and open `PROP-TEST-001`; render its server-derived geometry on the map. | Screenshot of property with geometry visible. |
| A3 | Open its issued determination `DET-TEST-001` and certificate. | Screenshot showing certificate ID, issuer/engine identity, digest/version, issuance time, and `CURRENT` status — all sourced from the API payload, none client-manufactured. |
| A4 | Show the issued-determination screen against `docs/VISUAL-STATE-SHEET.md` screen 1. | Side-by-side screenshot; note any required field not shown. |

## Part B — Offline preparation

| # | Action | Required evidence |
| --- | --- | --- |
| B1 | Pin/download the supplied test map area while online. | Screenshot of completed pin; reported stored size; manifest digest verified. |
| B2 | Enable airplane mode. | Status bar visible in all subsequent Part B–D evidence. |
| B3 | Pan/zoom the pinned area offline. | Recording; note tiles or layers that fail to render. |

## Part C — Offline observation capture and durability

| # | Action | Required evidence |
| --- | --- | --- |
| C1 | Create a field observation on `PROP-TEST-001`: note, GPS coordinates, horizontal accuracy, explicit property confirmation, optional test photo metadata. | Screenshot of the completed form before save. |
| C2 | Save. The UI may show `QUEUED OFFLINE` only after durable local persistence; record the generated operation ID. | Screenshot showing observation ID, operation ID, `QUEUED OFFLINE` sync state, and the `FIELD OBSERVATION — NOT A FLOODCASTER DETERMINATION` label. |
| C3 | Show the observation beside the issued determination. | Screenshot demonstrating the redundant distinctions in `docs/VISUAL-STATE-SHEET.md` (labels, icons, styling — not color alone). |
| C4 | **Kill point 1:** kill the app within 2 seconds of tapping save. Relaunch offline. | Screenshot showing the observation present with the same operation ID. |
| C5 | **Kill point 2:** kill the app while the observation list is open. Relaunch offline. | Same as C4. |
| C6 | Let (or force) the authentication session to expire while still offline. | Screenshot showing queued work still present locally, clearly not sendable, with no data loss and no silent discard. |
| C7 | **Kill point 3:** kill the app after auth expiry. Relaunch offline. | Screenshot: observation and operation ID unchanged. |

## Part D — Reconnect, adjudication, replay, collision

| # | Action | Required evidence |
| --- | --- | --- |
| D1 | Disable airplane mode; re-authenticate. Queued work must survive re-authentication untouched. | Recording of the re-auth flow; operation ID unchanged. |
| D2 | Submit the queued observation with the unchanged operation ID. | Screenshot showing transport state (`ACKNOWLEDGED`) rendered separately from the server domain outcome. |
| D3 | Render the domain outcome exactly as returned (`APPLIED`, `VERIFY_REQUIRED`, or `REJECTED`). | Screenshot; the client displays, never infers, the outcome. |
| D4 | Resubmit the same operation ID (mock returns the replay fixture). | Screenshot showing the result presented as a replay of the original disposition, not a second application. |
| D5 | Trigger the collision fixture (same operation ID, different digest). | Screenshot showing the collision surfaced and stopped; the client does not mint a new ID to mask it. |
| D6 | Trigger the rejected and verification-required fixtures. | Screenshots of each rendered per the visual state sheet, with zero implied mutation. |

## Part E — Staleness and supersession

| # | Action | Required evidence |
| --- | --- | --- |
| E1 | Switch the mock to report `DET-TEST-001` superseded. Refresh. | Screenshot showing the cached determination visibly demoted — no longer presented as current — per visual state sheet screen 2. |
| E2 | Go offline again and reopen the (now superseded) cached determination. | Screenshot showing last-known status and last-verified time; `UNKNOWN`/stale is never rendered as `CURRENT`. |

## Part F — Lifecycle and performance

| # | Action | Required evidence |
| --- | --- | --- |
| F1 | Background/foreground the app 10 times with the map open, mixing quick and >30s backgrounds. | Recording demonstrating map recovery each time; note any blank-map or re-download events. |
| F2 | Load the supplied baseline test layer. Measure interaction. | Device, OS, renderer, feature count, frame-rate or latency method and numbers, memory behavior. "Smooth" without measurement is not evidence. |
| F3 | Repeat F2 at the supplied 3× stress layer. | Same measurements; state the failure point if one occurs. |

## Test environment

No device coverage is required for this milestone. Run the script on whatever you have — a single physical phone, an emulator/simulator, or a Floodcaster-sponsored remote real-device session (see the FAQ) are all acceptable. Broader device validation is Floodcaster's responsibility in a later stage, on Floodcaster's hardware.

What matters is full disclosure, not the hardware: report exactly what you used — device model or emulator image, OS version, total RAM, and WebView/browser-engine version where applicable. Undisclosed substitution, not modest hardware, is what invalidates a result.

Any step your environment cannot express (for example, true airplane mode or OS force-stop on a remote session) is reported as a named environment limitation, not a failure — and never silently skipped or substituted.

## Reporting

- One row per step in the response template: pass/fail, evidence link, deviations.
- State the test environment (per above) once, at the top of the report.
