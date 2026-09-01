# Architecture

Floodcaster is the product authority. Mobile is one client experience.

```mermaid
flowchart TB
    subgraph P["Floodcaster platform"]
        D["Authoritative data"] --> E["Flood analytics and Rust decision services"]
        E --> C["RSCT certification and registry"]
        C --> G["Governed domain boundary"]
    end
    G --> A["HTTPS API"]
    G --> M["MCP"]
    A --> W["Web and mobile clients"]
    M --> X["Agents"]
```

## Artifact lifecycle

```mermaid
stateDiagram-v2
    [*] --> LocalObservation: User records evidence
    LocalObservation --> Queued: Durable local write
    Queued --> Submitted: HTTPS operation
    Submitted --> Admitted: Server adjudication
    Submitted --> Rejected: Server adjudication
    Submitted --> VerifyRequired: Server adjudication
    Admitted --> IssuedDetermination: Engine command and certification
```

`IssuedDetermination` is not a client transition. It is a server-owned outcome returned as a distinct artifact.

## Repository roles

| Area | Role |
| --- | --- |
| Root React/Leaflet SPA | Existing client reference and reuse evidence |
| `contracts/` | Draft client-facing POC interface |
| `fixtures/` | Synthetic scenarios for comparable tests |
| `mock-server/` | Local simulator for the draft contract |
| `map-pack/` | Test-only offline-pack handoff format |
| `docs/infosec/` | Existing security review pack; unchanged |

Framework selection is downstream of these boundaries. A contractor may recommend Capacitor, React Native, Flutter, a PWA, or another approach, but the recommendation must satisfy the same contract and acceptance tests.
