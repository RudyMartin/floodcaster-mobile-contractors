// api-types.ts -- TypeScript types for the Floodcaster API response envelope.
//
// This is the FIRST incremental TypeScript file (R-007 F2). The rest of the app
// stays .js (tsconfig allowJs:true, checkJs:false); new files may be typed .ts/.tsx.
// It is intentionally NOT wired into any existing component yet -- future
// incremental adoption will import these types. Its job here is to typecheck and
// prove the toolchain works.
//
// It encodes the exact envelope that the R-003 bug got wrong. The api.js client
// returns `{ ok, status, error, data, headers }` where `data` is the RAW HTTP JSON
// body, and the server wraps its payload one MORE level deep as `{ data: T, meta }`
// (per the global API response format). So the real payload lives at
// `resp.data.data`, NOT `resp.data`. R-003 read `resp.data` and got the wrapper.

/** The structured error object the client surfaces (see api.js). */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * The full result object returned by every api.js request().
 *
 * @typeParam T - the server payload type (the thing at resp.data.data).
 *
 * `data` is the raw HTTP JSON body. On success the server sends the standard
 * envelope `{ data: T, meta }`, so `data.data` is the actual payload. `data` is
 * `null` on any failure (network error, timeout, non-2xx, missing key).
 */
export interface ApiEnvelope<T> {
  ok: boolean;
  status: number;
  error: ApiError | null;
  data: { data: T; meta?: unknown } | null;
  headers: Record<string, string | null>;
}

/**
 * Safely unwrap the server payload from an ApiEnvelope.
 *
 * Returns `resp.data.data` when present, else `null`. THIS is the
 * `resp.data.data` unwrap that R-003 got wrong (it read `resp.data`, the
 * wrapper, instead of `resp.data.data`, the payload).
 */
export function unwrap<T>(resp: ApiEnvelope<T>): T | null {
  return resp.data?.data ?? null;
}

// ---------------------------------------------------------------------------
// Payload interfaces for the real /rings and /certificates responses.
// Shapes taken from the live envelopes exercised in the component tests
// (FloodReport.rings.test.js, RingsOverlay.test.js, CertHistory.test.js).
// ---------------------------------------------------------------------------

/** Metadata about a computed recurrence ring set (D5 Rings of Risk). */
export interface RingSet {
  ring_set_id?: string;
  aoi_name?: string;
  derivation_kind?: string;
  artifact_sha256?: string;
}

/** Aggregate exposure summary for an area with ring coverage. */
export interface RingsSummary {
  max_months: number;
  population_exposed: number;
  structures_exposed: number;
  roads_at_risk_km: number;
}

/** A GeoJSON FeatureCollection (rings geometry). */
export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: unknown[];
}

/**
 * Payload of GET /rings (the T in ApiEnvelope<RingsData>).
 * When `coverage` is false, the ring_set/summary/rings fields are absent.
 */
export interface RingsData {
  coverage: boolean;
  ring_set?: RingSet;
  summary?: RingsSummary;
  rings?: GeoJSONFeatureCollection | null;
}

/** One certificate record in a location's history (D6). */
export interface Certificate {
  certificate_id: string;
  cert_kind: string;
  decision: string;
  verdict: string | null;
  issued_at: string;
  anchor_ref: string | null;
  cert_sha256: string;
  distance_m: number;
}

/** Payload of GET /certificates/lookup (the T in ApiEnvelope<CertHistory>). */
export interface CertHistory {
  count: number;
  certificates: Certificate[];
}
