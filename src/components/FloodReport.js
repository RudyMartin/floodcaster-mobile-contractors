// C4+D3+D4 — Flood report card with FEMA zone determination
import { useState, useEffect } from 'react';
import { flood, getRings } from '../api';
import RingsOverlay from './RingsOverlay';
import CertHistory from './CertHistory';

export default function FloodReport({ lat, lon, address }) {
  const [data, setData] = useState(null);
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ringsResp, setRingsResp] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setRingsResp(null);
      return;
    }
    let alive = true;
    getRings(Number(lat), Number(lon)).then((r) => { if (alive) setRingsResp(r); });
    return () => { alive = false; };
  }, [lat, lon]);

  useEffect(() => {
    if (lat == null || lon == null) {
      setData(null);
      setZone(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    setZone(null);

    // Fetch lookup and zone in parallel
    // Gated reads (ADR-074 R-016 T2): attach a short-lived demo token (or the
    // user's own key). Non-breaking while the routes are still open.
    Promise.all([
      flood.get(`/lookup?lat=${lat}&lon=${lon}&radius=1000`, { demo: true }),
      flood.get(`/zone?lat=${lat}&lon=${lon}`, { demo: true }),
    ]).then(([lookupResp, zoneResp]) => {
      if (cancelled) return;
      setLoading(false);
      if (lookupResp.ok) {
        setData(lookupResp.data?.data || null);
      } else {
        setError(lookupResp.error?.message || 'Lookup failed');
      }
      if (zoneResp.ok) {
        setZone(zoneResp.data?.data || null);
      }
    });

    return () => { cancelled = true; };
  }, [lat, lon]);

  if (!lat && !lon) return null;

  // API envelope is { data: {...}, meta }; the rings payload lives at resp.data.data
  // (consistent with the lookup/zone reads above).
  const ringsData = ringsResp?.ok ? ringsResp.data?.data || null : null;
  const recurrenceSection = ringsData?.coverage ? (
    <section className="report-recurrence" data-testid="report-recurrence">
      <h3>Historical Flood Recurrence</h3>
      <div className="flood-report-grid">
        <ReportStat
          label="Max flooded months (2014–2024)"
          value={String(ringsData.summary.max_months)}
          severity={recurrenceSeverity(ringsData.summary.max_months)}
        />
        <ReportStat
          label="Population in risk rings"
          value={ringsData.summary.population_exposed.toLocaleString()}
          severity="none"
        />
        <ReportStat
          label="Structures in risk rings"
          value={ringsData.summary.structures_exposed.toLocaleString()}
          severity="none"
        />
        <ReportStat
          label="Roads at risk (km)"
          value={ringsData.summary.roads_at_risk_km.toLocaleString()}
          severity="none"
        />
      </div>
      <RingsOverlay lat={lat} lon={lon} />
    </section>
  ) : ringsResp?.ok && ringsData && !ringsData.coverage ? (
    <section className="report-recurrence" data-testid="report-recurrence">
      <h3>Historical Flood Recurrence</h3>
      <p className="rings-no-coverage">
        Recurrence layer not yet computed for this area.
      </p>
    </section>
  ) : null;

  if (loading) {
    return (
      <div className="flood-report">
        <div className="flood-report-loading">
          <div className="status-dot checking" style={{ display: 'inline-block' }} />
          <span>Looking up flood data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flood-report">
        <div className="cert-error">
          <span className="verdict fail">ERROR</span>
          <span>{error}</span>
        </div>
        {recurrenceSection}
      </div>
    );
  }

  if (!data) {
    if (!recurrenceSection) return null;
    return (
      <div className="flood-report">
        {recurrenceSection}
      </div>
    );
  }

  const match = data.match;

  return (
    <div className="flood-report">
      <div className="flood-report-header">
        <h4>Flood Risk Profile</h4>
        {match && (
          <span className="flood-report-distance">
            {match.distance_m < 50 ? 'At location' : `${Math.round(match.distance_m)}m away`}
          </span>
        )}
      </div>

      {address && (
        <div className="flood-report-address">{address}</div>
      )}

      {zone && zone.flood_zone && (
        <div className={`zone-badge zone-badge-${zone.in_sfha ? 'sfha' : 'minimal'}`}>
          <div className="zone-badge-header">
            <span className="zone-badge-zone">Zone {zone.flood_zone}</span>
            <span className={`zone-badge-sfha ${zone.in_sfha ? 'sfha-yes' : 'sfha-no'}`}>
              {zone.in_sfha ? 'SFHA' : 'Not in SFHA'}
            </span>
          </div>
          {zone.zone_subtype && (
            <div className="zone-badge-subtype">{zone.zone_subtype}</div>
          )}
          <div className="zone-badge-details">
            {zone.static_bfe != null && (
              <span>BFE: {zone.static_bfe} ft</span>
            )}
            {zone.dfirm_id && (
              <span>DFIRM: {zone.dfirm_id}</span>
            )}
          </div>
        </div>
      )}

      {zone && !zone.flood_zone && (
        <div className="zone-badge zone-badge-none">
          <span className="zone-badge-zone">No NFHL Data</span>
          <div className="zone-badge-subtype">Outside FEMA-mapped area</div>
        </div>
      )}

      {!match ? (
        <div className="flood-report-empty">
          <p>No cached flood data within {data.radius_m}m of this location.</p>
          <p className="flood-report-hint">
            Run a flood analysis for this area to generate data.
          </p>
        </div>
      ) : (
        <>
          <div className="flood-report-grid">
            <ReportStat
              label="Flood Depth"
              value={match.depth_ft != null ? `${match.depth_ft.toFixed(1)} ft` : '-'}
              severity={depthSeverity(match.depth_ft)}
            />
            <ReportStat
              label="Building Loss"
              value={match.bldg_loss_usd != null ? formatUSD(match.bldg_loss_usd) : '-'}
              severity={lossSeverity(match.bldg_loss_usd)}
            />
            <ReportStat
              label="Content Loss"
              value={match.cont_loss_usd != null ? formatUSD(match.cont_loss_usd) : '-'}
              severity={lossSeverity(match.cont_loss_usd)}
            />
            <ReportStat
              label="Struct Damage"
              value={match.dmg_pct_struct != null ? `${(match.dmg_pct_struct * 100).toFixed(1)}%` : '-'}
              severity={dmgSeverity(match.dmg_pct_struct)}
            />
          </div>

          {(match.jrc_occurrence_mean != null || match.deltares_depth_ft_rp100 != null) && (
            <div className="flood-report-section">
              <h5>Historical / Reference Data</h5>
              <div className="flood-report-detail-grid">
                {match.jrc_occurrence_mean != null && (
                  <div className="flood-report-detail">
                    <span className="detail-label">JRC Water Occurrence</span>
                    <span className="detail-value">{match.jrc_occurrence_mean.toFixed(1)}%</span>
                    <span className="detail-desc">Mean satellite-observed water presence (1984-2020)</span>
                  </div>
                )}
                {match.jrc_pct_ever_wet != null && (
                  <div className="flood-report-detail">
                    <span className="detail-label">Ever Wet</span>
                    <span className="detail-value">{match.jrc_pct_ever_wet.toFixed(0)}%</span>
                    <span className="detail-desc">Fraction of nearby pixels ever observed as water</span>
                  </div>
                )}
                {match.deltares_depth_ft_rp100 != null && (
                  <div className="flood-report-detail">
                    <span className="detail-label">Reference Depth (RP-100)</span>
                    <span className="detail-value">{match.deltares_depth_ft_rp100.toFixed(1)} ft</span>
                    <span className="detail-desc">Deltares modeled depth at 100-year return period</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flood-report-meta">
            {match.occ_type && <span>Type: {match.occ_type}</span>}
            {match.num_stories && <span>Stories: {match.num_stories}</span>}
            {match.year_built && <span>Built: {match.year_built}</span>}
            {match.sq_ft != null && <span>Area: {match.sq_ft.toLocaleString()} sq ft</span>}
          </div>

          <div className="flood-report-source">
            Source: job {match.source_job_id}
          </div>
        </>
      )}

      {recurrenceSection}

      <CertHistory lat={lat} lon={lon} />
    </div>
  );
}

function ReportStat({ label, value, severity }) {
  return (
    <div className={`report-stat report-stat-${severity}`}>
      <span className="report-stat-label">{label}</span>
      <span className="report-stat-value">{value}</span>
    </div>
  );
}

function formatUSD(v) {
  if (v == null) return '-';
  return '$' + v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function depthSeverity(ft) {
  if (ft == null || ft <= 0) return 'none';
  if (ft < 1) return 'low';
  if (ft < 3) return 'medium';
  return 'high';
}

function lossSeverity(usd) {
  if (usd == null || usd <= 0) return 'none';
  if (usd < 10000) return 'low';
  if (usd < 50000) return 'medium';
  return 'high';
}

function dmgSeverity(pct) {
  if (pct == null || pct <= 0) return 'none';
  if (pct < 0.05) return 'low';
  if (pct < 0.2) return 'medium';
  return 'high';
}

function recurrenceSeverity(months) {
  if (months == null || months <= 0) return 'none';
  if (months < 3) return 'low';
  return 'high';
}
