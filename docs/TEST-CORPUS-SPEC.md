# Representative Test Corpus Specification

Floodcaster — not the contractor — defines what "representative" means. This document freezes that definition.

**Status: DELIVERED.** The corpus lives in `fixtures/corpus/` (La Crosse, Wisconsin test area) and is served by the mock at `/mobile/v1/properties` (search), `/mobile/v1/properties/{id}`, and `/mobile/v1/layers/{layer_name}`. `fixtures/corpus/corpus-manifest.json` pins per-asset feature counts, vertex statistics, sizes, CRS, sha256 digests, provenance, and licenses — performance findings cite those digests.

All corpus content is `TEST_ONLY`: public-source-derived (Wisconsin open parcel data, FEMA NFHL — public domain), never customer or production data. Property IDs and display addresses are synthetic; no parcel attributes beyond geometry are republished.

## Contents

| Asset | Specification |
| --- | --- |
| Properties | 50–100 property read models with parcel and/or building polygons, in the exact geometry formats the API serves |
| Normal flood layer | One presentation layer at typical feature density for a single neighborhood-scale area |
| Complex flood layer | One layer with realistically complex geometry: multipart polygons, holes, high vertex counts, overlapping zone boundaries |
| 3× stress layer | The complex layer scaled to three times its feature count — the required upper probe for `ACCEPTANCE-TEST-SCRIPT.md` step F3 |
| Raster sample | Included only if mobile must render raster surfaces; otherwise explicitly absent |
| Styles/legends | The style and legend information needed to interpret each layer |

## Formats and CRS

- API-served geometry: GeoJSON, WGS 84 (EPSG:4326), matching the schemas in `contracts/schemas/`.
- Offline map presentation: the pack format defined in `map-pack/` with its signed manifest.
- QA interoperability: a GeoPackage export accompanies the corpus so results can be independently inspected in QGIS; it is a derived artifact, never an authority source.
- Any source CRS other than EPSG:4326 is documented in the corpus manifest along with the transformation applied.

## Documentation shipped with the corpus

Each delivered corpus includes a manifest recording, per asset: feature count, vertex statistics (min/median/max per feature), file size, format, CRS, digest, and provenance (source and license for any public-source-derived content).

## Size budgets

Delivered assets respect hard size caps so no plausible device is excluded: offline map pack ≤ 50 MB installed; total corpus download ≤ 100 MB. If an asset cannot meet its cap, Floodcaster shrinks the test area — contractors are never asked to accommodate an oversized asset.

## Rules

1. Contractors do not substitute their own datasets for performance claims; F2/F3 measurements are valid only against this corpus (`flood-normal` is the F2 baseline; `flood-stress-3x` is the F3 probe).
2. Corpus membership is presentation data — it never implies authorization or an authoritative area-of-interest boundary.
3. If a delivered asset deviates from this spec, the deviation is documented in the manifest; contractors report against what was actually delivered.
