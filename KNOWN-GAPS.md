# Known Gaps and Decisions Still Required

These gaps are explicit so contractors do not invent production behavior.

| Gap | POC treatment | Production decision owner |
| --- | --- | --- |
| Final mobile framework | Compare one implemented path with measured evidence | Floodcaster |
| Ratified production OpenAPI and schemas | Use draft contract in `contracts/` | Floodcaster platform |
| Determination status-list/signature mechanism | Mock current and superseded states | Floodcaster certificate authority |
| Production offline map source and license | Use test handoff format only | Floodcaster/product/legal |
| Representative proprietary feature counts | Report synthetic baseline and 3× probe | Floodcaster data/platform |
| Device encryption, purge trigger, retention window | Demonstrate chosen durable-store controls; document limits | Floodcaster security/product |
| Production identity provider and token lifetimes | Simulate expiry; do not use production auth | Floodcaster identity/platform |
| Photo EXIF strip/preserve policy | Record dependency and recommendation; no real photos | Floodcaster privacy/product |
| Supported OS/device matrix | Name tested devices; propose production floor | Floodcaster product |
| Production background-location requirement | Not assumed by the POC | Floodcaster product |

The POC may expose a gap; it may not silently redefine an authoritative schema, certificate rule, or backend outcome to close it.
