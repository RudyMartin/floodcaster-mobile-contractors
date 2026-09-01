# Contractor FAQ

## 1. What is being built?

A bounded mobile-client POC. Floodcaster remains the authoritative decision and evidence platform; the phone is one governed client.

## 2. Is the existing SPA the product architecture?

No. The root React/Leaflet SPA is a sanitized workflow reference from `NextShiftConsulting/floodcaster-web` commit `8c58b678ff127e884153b7750e9da05a4de83920`.

## 3. Which framework must we use?

None is predetermined. Implement and measure one justified path—Capacitor, React Native/Expo, Flutter, PWA, or another credible approach—against the same contract and scenario.

## 4. Which map engine must we use?

The existing SPA uses Leaflet. The POC choice is open, but must support the required offline handoff, representative geospatial load, background/foreground recovery, and licensing disclosure.

## 5. Where does the data come from?

During the public POC, from the supplied synthetic fixtures and local mock server. Production mobile data will come through Floodcaster's governed HTTPS API, not directly from databases, Rust/Python internals, or third-party flood services.

## 6. Do contractors receive production APIs or data?

No. Use the draft OpenAPI contract, fixtures, and mock. A later private milestone may provide approved non-production endpoints.

## 7. Can the phone calculate or issue a flood determination?

No. It may request a server operation and display an issued result returned by Floodcaster. It may not manufacture, infer, or certify one.

## 8. What can the phone create?

A user-attested `FIELD_OBSERVATION`: notes, GPS fix and accuracy, confirmed property association, timestamps, and approved photo metadata. Its `determination_authority` remains `NONE` until a separate server-issued artifact exists.

## 9. What does offline mean for this POC?

Durable local access to the pinned test presentation data and the ability to create and queue field observations. It does not mean running the flood engine or carrying an unlimited production basemap region.

## 10. What must survive process death?

Queued observation payloads, their client-generated operation IDs, and the UI's honest state. Persist before showing a queued/submitted confirmation.

## 11. What happens when authentication expires offline?

Queued work remains. Sending waits for successful re-authentication; session clearing must not erase unsent user work.

## 12. How are conflicts resolved?

By the server. The client renders `APPLIED`, `VERIFY_REQUIRED`, or `REJECTED` and never declares its local state authoritative.

## 13. How should GPS be used?

GPS proposes a location/property. The user explicitly confirms the association, and the submitted record retains WGS84 coordinates, horizontal accuracy, and selection method.

## 14. How must issued and local artifacts look?

They must differ in label, structure, icon/accessibility semantics, provenance, and state—not color alone. The required side-by-side test is part of the milestone.

## 15. Are cached determinations authoritative forever?

No. They show last-known status and verification time. After reconnect, a server-reported supersession or revocation must demote the cached record.

## 16. Is MCP the mobile interface?

No. MCP (Model Context Protocol) is an interface AI agents use to reach Floodcaster; it does not affect the mobile client. Mobile and web use plain HTTPS/JSON. Both paths reach the same Floodcaster services — there is no separate backend for mobile.

## 17. Are paid plugins allowed?

Only if disclosed with license, current price model, platform dependency, and a production alternative. Trial-only functionality cannot be hidden in the demo.

## 18. What is the fixed-price deliverable?

Runnable code, tests, recording, measurements, dependency/license inventory, reuse matrix, risk register, and a completed assessment template. A proposal or scaffold alone is incomplete.

## 19. Is the listed $200 the whole app budget?

No. $200 is the fixed price for this milestone, and this milestone is exactly the ten deliverables in CONTRACTOR-BRIEF.md — no more, no less. The scope does not grow, and the price does not shrink. It is not the budget for the production application; production stages are scoped and priced separately after the POC, and deliverable 10 is your own estimate for that next stage.

## 20. When does the app go live?

Not at the public POC stage. The path is: contract/mock POC, private integration against non-production APIs, security/device validation, pilot distribution, then production release after Floodcaster acceptance and store/enterprise-distribution readiness.

## 21. Who owns backend changes?

Floodcaster. Contractors record needed contract changes as gaps; they do not alter flood analytics, certificate semantics, canonical schemas, authorization, or production infrastructure.

## 22. What devices do we need?

None in particular. A single physical phone, an emulator/simulator, or a sponsored remote session all qualify; just report exactly what you used (model or image, OS version, RAM, WebView/browser-engine version). Multi-device validation is Floodcaster's job at a later stage, on Floodcaster's hardware — it is not part of this milestone and not priced into it.

## 23. What if we have no suitable device at all?

Ask. Floodcaster will provide a sponsored remote real-device session (a commercial device cloud) at its own cost. Steps the remote environment cannot express are reported as environment limitations per the acceptance script, not counted as failures.

## 24. How do I ask questions, and what are the deadline and submission process?

Questions: open a GitHub issue on this repository — answers are public so every bidder sees the same information. Deadline: 14 calendar days from accepting the milestone. Submission and payment run through the Fiverr engagement: preferably a private GitHub repository shared with us, or — if you cannot use GitHub — a ZIP of all files attached to the Fiverr delivery. Include the completed assessment response template and paste SUBMISSION-FORM.md into the delivery message. Do not push work into this public repository.
