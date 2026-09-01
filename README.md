# Floodcaster Mobile Contractor Briefing

> **PUBLIC BRIEFING SNAPSHOT — ASSESSMENT ONLY**
>
> This repository is intentionally public during contractor briefing. It must be made private before implementation begins or before adding contractor work product, credentials, production access details, proprietary backend material, or non-public data.

This repository is the complete starting point for the Floodcaster mobile POC assessment. Start here; do not search other Floodcaster repositories unless specifically instructed.

The included application is a sanitized reference snapshot of the existing React/Leaflet SPA from `NextShiftConsulting/floodcaster-web` at commit `8c58b678ff127e884153b7750e9da05a4de83920`. It is evidence of what exists today—not the mandated implementation stack.

## First assignment

Assess the reference SPA and return:

1. what can be reused unchanged;
2. what can be adapted;
3. what must be rebuilt for the target Svelte PWA;
4. the recommended first fixed-price POC milestone; and
5. risks, assumptions, dependencies, and evidence for the estimate.

Do not implement product changes during this briefing assessment unless a separate milestone is authorized.

## Run the reference SPA

```bash
npm ci
npm run dev
```

The public snapshot defaults to a local API origin. Copy `.env.example` to `.env.local` and set `VITE_API_BASE` only to an approved mock or test endpoint. Do not add production credentials.

Verification:

```bash
npm test
npm run typecheck
npm run build
```

## Read next

1. [CONTRACTOR-BRIEF.md](CONTRACTOR-BRIEF.md)
2. [POC-SCOPE.md](POC-SCOPE.md)
3. [ARCHITECTURE.md](ARCHITECTURE.md)
4. [API-BOUNDARY.md](API-BOUNDARY.md)
5. [KNOWN-GAPS.md](KNOWN-GAPS.md)
6. [ASSESSMENT-RESPONSE-TEMPLATE.md](ASSESSMENT-RESPONSE-TEMPLATE.md)

## Non-negotiable boundary

The browser/mobile application calls documented HTTPS/JSON APIs. It does not invoke Rust or Python directly.

- Rust `floodcaster-platform` owns authoritative reconciliation and state mutation.
- Python is limited to approved build-time, data-preparation, verification, or backend processing.
- MCP is not a Mobile MVP1 dependency.
- The contractor must not change backend APIs, canonical contracts, authorization authority, certificate semantics, or production infrastructure during assessment.

No open-source license is granted. See [NOTICE.md](NOTICE.md).
