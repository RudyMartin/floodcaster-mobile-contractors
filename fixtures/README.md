# Synthetic Fixtures

Every fixture is `TEST_ONLY`, uses fictitious identifiers, and is safe for the public contractor evaluation. The values are designed to exercise client state and provenance, not to represent an actual property or flood finding.

Key scenarios:

- `issued-determination.json` and `superseded-determination.json` test freshness/status handling.
- `field-observation.json` is user-attested and has no determination authority.
- `operation-*.json` separates transport acknowledgement from domain outcome.
- `operation-replay.json` and `operation-collision.json` test stable client operation IDs.
