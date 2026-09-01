# Offline Map Pack (TEST_ONLY)

`gate0-lacrosse-v1.pmtiles` (602 KB) is a real, delivered PMTiles archive covering the corpus test area: three vector layers (`properties`, `flood-normal`, `flood-complex`) at zooms 10–16, derived from the same public-source data as `fixtures/corpus/` (Wisconsin open parcel data, FEMA NFHL — public domain). `manifest.json` pins its raw-byte sha256; `style.json` is a minimal MapLibre style for it. `manifest.example.json` remains the format reference.

Download paths (equivalent bytes — verify the digest either way):

- through the API: `GET /mobile/v1/map-pack` on the mock (the acceptance-script pin/download path);
- directly from this repository.

Rules:

- The client verifies the raw-byte sha256 against the manifest **before** presenting the pack as available offline.
- The pack is `authoritative: false`, `purpose: PRESENTATION`. Pack membership or rendering is never authorization or an authoritative area-of-interest boundary.
- Versioned filename is immutable: a new pack is a new file and manifest, never an overwrite.

This is a test handoff, not licensed production map content. The production provider, license, area-selection policy, retention, and update mechanism remain Floodcaster decisions. A contractor must not demonstrate offline caching with a provider license that forbids production offline use and imply that the result transfers.
