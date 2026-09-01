# Visual State Sheet

Four reference screens define the required information architecture for the two artifact classes and their states. Contractors own visual design; they do not own which fields appear, how artifacts are labeled, or which actions are available. Wireframes are in `docs/ui-states/` — they are field requirements, not styling mandates.

## Redundant distinctions (mandatory)

Certified and user-attested artifacts must be distinguishable without color — for accessibility, and because screenshots of these screens are used as proof (in your acceptance evidence, and potentially in real disputes):

| Dimension | Issued determination | Field observation |
| --- | --- | --- |
| Banner label | `CERTIFIED DETERMINATION` | `FIELD OBSERVATION — NOT A FLOODCASTER DETERMINATION` |
| Icon | Certificate | Notebook/camera |
| Primary ID | Certificate ID | Observation ID |
| Provenance | Issuer + engine digest | User + device |
| Timestamp | Issued time | Observed time |
| Status line | Verification status | Sync state |
| Styling | Solid/certified | Hatched or outlined |
| Editability | Read-only | Editable until submitted |

Every certified field shown must originate from — or be cryptographically bound to — the persisted engine-issued artifact. The client must not manufacture the engine name, issuance time, certificate ID, or determination value.

## Screen 1 — Current issued determination (`ui-states/1-issued-current.svg`)

Required fields: banner label; certificate icon; certificate ID; issuer identity; engine identity + digest/version; issued time; determination value(s) exactly as returned; status `CURRENT` with last-verified time.

Actions: view certificate detail; refresh status. Disabled/absent: edit, delete, re-issue, any control implying the client can alter the artifact.

## Screen 2 — Superseded or unverified determination (`ui-states/2-issued-superseded.svg`)

Same fields as screen 1, plus: status `SUPERSEDED` / `REVOKED` / `UNKNOWN` rendered as a demotion (visually subordinate, never styled as current); last-verified time; pointer to the replacement only if the server returned a distinct issued artifact.

Actions: refresh status; open replacement if present. Disabled/absent: anything presenting the stale value as current; client-side "restore".

## Screen 3 — Offline queued field observation (`ui-states/3-observation-queued.svg`)

Required fields: banner label; notebook icon; observation ID; operation ID; user + device provenance; observed time; GPS coordinates + horizontal accuracy; confirmed property; sync state `QUEUED OFFLINE`; evidence state `UNASSESSED`.

Actions: edit (until submitted); discard with confirmation. Disabled/absent: submit while offline or unauthenticated (visible but disabled, with reason); any determination-like status.

## Screen 4 — Acknowledged observation awaiting adjudication (`ui-states/4-observation-acknowledged.svg`)

Required fields: banner label; observation ID; operation ID; sync state `ACKNOWLEDGED`; domain outcome shown separately — `APPLIED`, `VERIFY_REQUIRED`, `REJECTED`, or explicitly pending. Acknowledgement means the server received the operation; it is never rendered as admitted or determined.

Actions: refresh outcome; view server response detail. Disabled/absent: edit (now read-only); resubmit-as-new (replay must reuse the operation ID).
