# Contractor Brief

## Purpose

Review the included Floodcaster SPA and determine the most credible path to the Mobile MVP1 proof of concept. This is an assessment milestone, not authorization to implement or redesign the Floodcaster estate.

## What you have

- A runnable React 19 + Vite + Leaflet reference SPA.
- Its client API wrapper, response types, UI components, tests, and public-safe assets.
- The target mobile boundary and known gaps.
- A response template for a comparable fixed-price recommendation.

## What we need from you

1. Run and inspect the application.
2. Produce a component-by-component reuse matrix: REUSE, ADAPT, or REBUILD.
3. Evaluate a responsive Svelte PWA using MapLibre GL JS.
4. Define focused feasibility probes for GPS/map performance, camera capture, offline PMTiles in OPFS, IndexedDB journal/sync, secure local handling, and Cognito Authorization Code + PKCE.
5. Identify the minimum mock/test API surface needed for those probes.
6. Recommend the first fixed-price milestone with deliverables, acceptance evidence, schedule, assumptions, and exclusions.

## Delivery expectations

- Source and documentation through a contractor branch and pull request.
- Reproducible build/run instructions.
- A short recorded or live demonstration of the POC.
- Evidence tied to the agreed browser/device matrix.
- No unapproved dependency or architecture substitutions.

## Stop conditions

Stop and raise a question before work would require:

- a backend, canonical-contract, authorization, certificate, or infrastructure change;
- production credentials, customer data, internal service keys, or private repositories;
- inventing an unresolved API or schema;
- treating the client, PMTiles, GeoPackage, Cognito, or an MCP tool as execution authority;
- representing a transport/system failure as a domain determination.
