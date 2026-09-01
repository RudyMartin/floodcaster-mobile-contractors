# Contractor FAQ

> **PUBLIC BRIEFING SNAPSHOT — ASSESSMENT ONLY**
>
> This FAQ answers contractor-scoping questions for Floodcaster Mobile MVP1. It distinguishes the included reference SPA from the target POC. Where a production detail is not frozen, the answer says so rather than inventing an interface or requirement.

## Current system and target at a glance

| Concern | Included reference SPA | Mobile MVP1 target |
|---|---|---|
| UI framework | React 19 + Vite | Responsive Svelte PWA |
| Map engine | Leaflet / React-Leaflet | MapLibre GL JS |
| Map delivery | Online tile layer plus API-returned features | One immutable PMTiles pack for a selected Bologna AOI |
| Offline map | Not implemented | Exact PMTiles bytes stored in OPFS and verified by SHA-256 |
| Offline work | Not implemented | IndexedDB operation journal |
| Authentication | API-key/localStorage patterns in the snapshot | Amazon Cognito User Pool, Authorization Code + PKCE |
| Authoritative decision | Backend-owned | Rust `floodcaster-platform` through documented HTTPS/JSON APIs |

## 1. What framework is the existing SPA built with?

The included runnable snapshot uses **React 19, Vite, JavaScript, and a small amount of TypeScript for API types**. It was copied from the existing `floodcaster-web` SPA as assessment evidence.

The target Mobile MVP1 implementation is a **responsive Svelte PWA**. Contractors must identify React logic, assets, API behavior, tests, and workflows that can be reused or adapted; React components should not be assumed to transfer unchanged to Svelte.

## 2. Which mapping and geospatial libraries are currently used?

The reference SPA uses **Leaflet 1.9.4** through **React-Leaflet 5**. Its visible basemap is an online OpenStreetMap tile layer.

The Mobile MVP1 target uses **MapLibre GL JS** with an immutable **PMTiles** delivery pack. The current Leaflet implementation is evidence of existing behavior, not the required target engine.

## 3. What geospatial formats and layers are currently consumed?

The reference SPA currently demonstrates:

- online raster map tiles;
- GeoJSON `FeatureCollection` polygons for recurrence-ring overlays;
- JSON building-level records displayed as point/circle markers;
- bounding-box rectangles;
- a simulated `.tif`/`.tiff` flood-depth upload flow; and
- CSV batch input.

The current building-results request is capped at **500 records** in the copied client. That is a UI/API snapshot limit, not the production mobile performance target.

The Mobile MVP1 POC is intentionally narrower: one selected Bologna AOI, one immutable PMTiles pack, and the features needed for the `FIELD_REVIEWED` workflow. Raw GeoTIFF rendering, nationwide offline regions, generic time-series playback, and unrestricted layer catalogs are not first-POC requirements.

The final PMTiles byte size and feature count are **not frozen yet**. A representative pack must be supplied or approved before implementation performance is accepted. The technical assessment should recommend measurable baseline and stress tiers; a useful feature-count envelope is the current 500-feature view, a several-thousand-feature representative case, and an approximately 50,000-feature stress case. Contractors must report actual pack bytes, feature counts, zoom range, load time, pan/zoom behavior, memory, and storage use rather than assume a layer is "small."

## 4. What does offline mean for Mobile MVP1?

Offline means **full use of one previously downloaded and verified selected-area pack**, not nationwide or arbitrary-region offline maps.

The PWA must be able to:

1. download the approved PMTiles pack while online;
2. verify the digest over the exact raw bytes;
3. store the pack in OPFS;
4. reopen the application and map while disconnected;
5. record one `FIELD_REVIEWED` operation under previously issued Floodcaster offline authority;
6. retain that operation in an IndexedDB journal; and
7. submit it for authoritative server reconciliation after connectivity returns.

The offline client records a claim. It does not declare the operation `APPLIED` and does not mutate authoritative PostGIS state.

## 5. Is there a preferred offline-map provider or licensing model?

The frozen technical direction is **MapLibre GL JS + PMTiles**. PMTiles and its manifest are delivered through the approved Floodcaster edge path; the browser does not receive AWS credentials.

No proprietary map SDK or paid provider is mandated for the first POC. The contractor must identify the license and redistribution terms for every basemap, tile, glyph, sprite, and data dependency. A production provider decision remains separate from this assessment.

## 6. What synchronizes when connectivity returns?

For Mobile MVP1, synchronization is deliberately limited to:

- the locally recorded `FIELD_REVIEWED` operation;
- its operation identifier, canonical content/digest, observed time, feature/base revision, pack reference, and authority evidence required by the approved contract;
- retry/idempotency state kept locally; and
- the returned reconciliation result and certificate/receipt references when applicable.

Submission is batch-capable and each operation receives an independent result. Replaying the same operation must not mutate authoritative state twice. Reusing an operation ID with different content must reject fail-closed.

This is not a generic bidirectional synchronization platform.

## 7. Which capabilities are required for the first milestone?

The **$200 first milestone is the bounded assessment milestone**, not the complete cross-platform geospatial POC.

Required assessment outputs are:

1. run and inspect the included SPA;
2. provide a component-by-component `REUSE`, `ADAPT`, or `REBUILD` matrix;
3. propose the Svelte/MapLibre POC architecture;
4. define focused probes and acceptance evidence for responsive UI, GPS/map behavior, camera, OPFS PMTiles, IndexedDB journal/reconnect, secure local handling, Cognito PKCE, and typed API mocks;
5. recommend a phone/tablet/desktop browser-device matrix;
6. identify dependencies, licenses, risks, assumptions, and unresolved decisions; and
7. provide a realistic fixed-price, schedule, and exclusions for the implementation POC.

A working shell or narrow spike may be added only if explicitly agreed within that milestone. The implementation POC is separately scoped and priced.

## 8. What are the must-haves for the later implementation POC?

The implementation POC must prove:

- one responsive Svelte codebase on phone, tablet, and desktop;
- current GPS position, accuracy, permission denial, stale-position, and error states;
- MapLibre rendering of the representative Bologna PMTiles pack;
- pan/zoom/touch performance measured on the agreed device matrix;
- camera permission, capture, cancellation, and local attachment handling;
- PMTiles download, exact-byte digest verification, OPFS storage, and offline reopen;
- an IndexedDB operation journal that records without mutating canonical content during retries;
- disconnect, reconnect, replay, and operation-ID collision behavior;
- Cognito Authorization Code + PKCE and secure handling of tokens/offline authority;
- typed HTTPS/JSON mocks or approved test endpoints; and
- reproducible builds, documented dependencies, limitations, and evidence.

Continuous background GPS, push delivery, native app-store packaging, generic synchronization, production deployment, and full production hardening are not first-POC acceptance requirements. They may be assessed as Phase 2 feasibility items.

## 9. Which existing SPA components are most important to preserve?

Preserve **behavior and evidence**, not necessarily React component source. Highest-priority assessment areas are:

- the API wrapper and response/error handling;
- API types and test cases;
- address/AOI selection and map interaction behavior;
- building/feature display and status styling;
- evidence, certificate, and decision-status presentation;
- explicit loading, unavailable, and system-error states; and
- reusable public-safe assets and representative fixtures.

Pricing, billing, generic certification playgrounds, broad batch processing, and simulated raster upload are not first mobile-field-workflow priorities.

## 10. Are Mobile MVP1 APIs already available for offline sync and reconnect testing?

The reference SPA contains existing online endpoints and a runnable HTTP client wrapper. Those endpoints are **not** the Mobile MVP1 sync contract and must not be copied mechanically.

The approved target boundary identifies:

- `GET /mobile/v1/bootstrap`;
- `POST /mobile/v1/operations`; and
- `GET /mobile/v1/certificates/{certificate_id}`.

The public briefing repository does not currently provide an approved live Mobile MVP1 endpoint or complete wire schema for contractor use. Use typed mocks until an approved non-production endpoint and contract are supplied. Do not invent unresolved request fields, responses, or status codes.

## 11. Is Capacitor the preferred approach?

The current target is a responsive **Svelte PWA**, because Mobile MVP1 is designed to prove a narrow browser-based offline workflow before authorizing native packaging.

Capacitor may be evaluated as a **Phase 2 shell or risk-mitigation option** if measured PWA limits around filesystem behavior, background execution, secure storage, camera, or device integration justify it. The assessment should show the evidence and added plugin/maintenance risk; it should not replace the frozen POC target by preference alone.

## 12. Is continuous background GPS required?

No. Continuous background tracking is **not** a first-POC requirement.

The POC needs foreground location acquisition, displayed horizontal accuracy, permission/error handling, and current-position map display. The contractor should document iOS/Android background-location constraints, likely battery impact, and whether a later native shell would be required, but should not build continuous tracking in the $200 assessment or first implementation POC unless separately authorized.

## 13. What authentication does the current SPA use, and what is the target?

The copied SPA shows API-key and localStorage patterns. Those patterns are a known gap and are not the Mobile MVP1 solution.

The target uses the existing **Amazon Cognito User Pool** with **Authorization Code + PKCE (S256)** as a public browser client. The PWA sends a Cognito **access token** to `/mobile/v1/*`. It has no client secret and no AWS/IAM credentials. Floodcaster separately issues the signed, bounded offline authority artifact; Cognito identity is not domain authorization.

## 14. Which push-notification provider is used?

None is frozen or required for Mobile MVP1. Push notifications are a Phase 2 feasibility topic. The contractor may compare appropriate web/native options and restrictions, but a provider integration is not part of the first assessment or implementation acceptance gate.

## 15. What is required for photos?

The first implementation POC should prove permission handling, one capture/attach flow, cancellation, and durable local handling while offline.

The canonical media-upload contract is not yet supplied. Exact compression, annotations, EXIF policy, upload-queue schema, and server storage behavior remain assessment questions. Contractors should recommend them without silently adding fields to the canonical `FIELD_REVIEWED` payload. Device-derived time/location metadata must be treated as claims and kept distinct from server-authoritative values.

## 16. What iOS, Android, browsers, and devices must be supported?

No production OS floor or certified device list is frozen during briefing. Because the target is a PWA, the first assessment must recommend a browser-device matrix covering at least:

- one recent real iPhone/iOS Safari device;
- one recent real Android/Chrome device;
- one tablet class; and
- desktop Chrome plus one additional supported desktop browser.

The proposal should state exact OS/browser versions, whether tests are on hardware or emulators, and any OPFS, storage-quota, camera, GPS, or service-worker limitations. Final support floors will be chosen from that evidence.

## 17. Will a representative dataset or test API be provided?

Yes, implementation performance must be tested against an approved public-safe or non-production Bologna fixture, not only synthetic toy data. During the $200 assessment, contractors may use the included sample data and typed mocks to define the test plan.

Before implementation acceptance, Floodcaster will supply or approve the representative PMTiles pack, manifest/digest, operation fixtures, and mock or non-production API behavior required by the agreed milestone. Production credentials, private keys, customer data, and unrestricted backend access will not be provided.

## 18. What GitHub workflow is expected?

Use a contractor-specific branch and pull request. Keep changes limited to authorized paths and the agreed milestone. Provide clean-checkout build/run instructions, dependency and license inventory, test evidence, and a short recorded or live demonstration when implementation is authorized.

Do not commit credentials, production URLs containing sensitive data, customer data, private keys, or proprietary backend material to this public briefing repository.

## 19. What is the primary success criterion?

For the **assessment milestone**, success is a defensible reuse/rebuild decision and an evidence-based fixed-price implementation plan that exposes the major mobile/geospatial risks before broader spending.

For the **implementation POC**, the core proof is:

> A user can reopen the selected-area map offline, record one `FIELD_REVIEWED` operation under previously issued authority, reconnect, and receive an authoritative Rust reconciliation result without duplicate or unauthorized state mutation.

The mandatory outcomes and adversarial behavior are `APPLIED`, `VERIFY_REQUIRED`, `REJECTED`, replay without a second mutation, operation-ID collision rejection, and zero authoritative mutation for invalid, stale, or unverifiable inputs.

## 20. What timeline and budget apply?

Target **3–5 business days** for the first assessment after repository access and clarification of any blocking question.

The listed **$200 budget applies only to that bounded assessment milestone**. It is not the budget for the complete geospatial implementation POC described above. The contractor should use the assessment to propose a realistic separate fixed price and schedule for implementation, with explicit assumptions, deliverables, device coverage, and exclusions.

## 21. May the mobile client call Rust, Python, or MCP directly?

No. The browser/mobile application calls documented **HTTPS/JSON APIs**.

- Rust `floodcaster-platform` owns authoritative reconciliation and state mutation.
- Python remains behind the backend boundary or in approved build/data tooling.
- MCP is not a Mobile MVP1 dependency.
- The client, Cognito, PMTiles, GeoPackage, and transport success are not execution authority.

If a requested POC step appears to require a backend, canonical-contract, authorization, certificate, or infrastructure change, stop and raise the question before implementation.
