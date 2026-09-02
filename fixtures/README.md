# Synthetic Fixtures

Every fixture is `TEST_ONLY`, uses fictitious identifiers, and is safe for the public contractor evaluation. The values are designed to exercise client state and provenance, not to represent an actual property or flood finding.

Key scenarios:

- `issued-determination.json` and `superseded-determination.json` test freshness/status handling.
- `field-observation.json` is user-attested and has no determination authority.
- `operation-*.json` separates transport acknowledgement from domain outcome.
- `operation-replay.json` and `operation-collision.json` test stable client operation IDs.
- `hazards-nearby.json` is the deterministic one-API example for flood, severe weather, tropical cyclone, and wildfire. It includes activated Golden GeoData and preserves each record's source authority. The NASA FIRMS fire record is a source observation, not an official alert.

`corpus/` holds the delivered representative test corpus (see `docs/TEST-CORPUS-SPEC.md`): 90 real-geometry properties and three flood presentation layers over a La Crosse, Wisconsin test area, with `corpus-manifest.json` pinning digests and provenance. `PROP-TEST-001` in `property.json` is anchored to the corpus seed parcel.
