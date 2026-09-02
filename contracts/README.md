# Draft POC Contracts

These files define a public, synthetic client test surface. They are marked `POC_CONTRACT_DRAFT`; they do not ratify production endpoints, certificate formats, signatures, authorization semantics, or canonical (official, single-source-of-truth) domain schemas.

The schemas intentionally keep field observations and issued determinations structurally separate. The client must not convert between them.

Production canonicalization, signing, status-list verification, and error-taxonomy decisions remain owned by Floodcaster and are listed as gaps.

## Unified hazard contract

Contract version `0.5.0-proposed` adds one mobile-facing operation for every supported hazard family:

`GET /mobile/v1/hazards/nearby`

The common event envelope preserves source authority while `details` carries typed flood, severe-weather, tropical-cyclone, wildfire, coastal, winter-weather, or other fields. An official alert, forecast, source observation, historical record, Floodcaster analysis, and user field observation are never interchangeable.

This remains a deterministic POC contract. It does not claim that live NOAA, FEMA, NASA, or other provider adapters are deployed.
