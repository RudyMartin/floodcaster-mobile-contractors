import { vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloodReport from './FloodReport';
import * as api from '../api';

// vitest requires the factory to return an object with a `default` key for a
// default-imported module (jest allowed a bare component). Semantics unchanged.
vi.mock('./RingsOverlay', () => ({
  default: () => <div data-testid="rings-overlay" />,
}));

test('report shows recurrence stat tiles when covered', async () => {
  // Stub every api call FloodReport makes on mount (flood.get for /lookup
  // and /zone, called via Promise.all) with minimal ok envelopes, plus
  // getRings (Task 1) for the recurrence section under test.
  vi.spyOn(api.flood, 'get').mockImplementation((path) => {
    if (path.startsWith('/lookup')) {
      return Promise.resolve({
        ok: true,
        data: { data: { radius_m: 1000, match: null } },
      });
    }
    if (path.startsWith('/zone')) {
      return Promise.resolve({ ok: true, data: { data: null } });
    }
    return Promise.resolve({ ok: false, data: null, error: { message: 'unexpected path' } });
  });
  vi.spyOn(api, 'getRings').mockResolvedValue({
    ok: true,
    data: {
      data: {
        coverage: true,
        ring_set: { aoi_name: 'Houston metro',
                    derivation_kind: 'MODEL_DERIVED_CONTEXT',
                    artifact_sha256: 'abc123def456' },
        summary: {
          max_months: 23, population_exposed: 1796902,
          structures_exposed: 536585, roads_at_risk_km: 1407.34,
        },
        rings: { type: 'FeatureCollection', features: [] },
      },
    },
  });
  render(<FloodReport lat={29.76} lon={-95.36} address="123 Main St" />);
  await screen.findByTestId('rings-overlay');

  const section = screen.getByTestId('report-recurrence');
  expect(within(section).getByText(/1,796,902/)).toBeInTheDocument();
  expect(within(section).getByText(/23/)).toBeInTheDocument();
  expect(within(section).getByText(/1,407/)).toBeInTheDocument();
});

test('report shows "not yet computed" message when rings coverage is false', async () => {
  vi.spyOn(api.flood, 'get').mockImplementation((path) => {
    if (path.startsWith('/lookup')) {
      return Promise.resolve({
        ok: true,
        data: { data: { radius_m: 1000, match: null } },
      });
    }
    if (path.startsWith('/zone')) {
      return Promise.resolve({ ok: true, data: { data: null } });
    }
    return Promise.resolve({ ok: false, data: null, error: { message: 'unexpected path' } });
  });
  vi.spyOn(api, 'getRings').mockResolvedValue({
    ok: true,
    data: { data: { coverage: false } },
  });
  render(<FloodReport lat={29.76} lon={-95.36} address="123 Main St" />);

  const section = await screen.findByTestId('report-recurrence');
  expect(within(section).getByText(/not yet computed/i)).toBeInTheDocument();
});

test('report omits recurrence section when getRings resolves ok:false, rest of report still renders', async () => {
  vi.spyOn(api.flood, 'get').mockImplementation((path) => {
    if (path.startsWith('/lookup')) {
      return Promise.resolve({
        ok: true,
        data: { data: { radius_m: 1000, match: null } },
      });
    }
    if (path.startsWith('/zone')) {
      return Promise.resolve({ ok: true, data: { data: null } });
    }
    return Promise.resolve({ ok: false, data: null, error: { message: 'unexpected path' } });
  });
  vi.spyOn(api, 'getRings').mockResolvedValue({ ok: false });
  render(<FloodReport lat={29.76} lon={-95.36} address="123 Main St" />);

  await screen.findByText(/No cached flood data/i);
  expect(screen.queryByTestId('report-recurrence')).not.toBeInTheDocument();
});

test('recurrence section renders even when primary lookup fails, independent of lookup outcome', async () => {
  vi.spyOn(api.flood, 'get').mockImplementation((path) => {
    if (path.startsWith('/lookup')) {
      return Promise.resolve({
        ok: false,
        data: null,
        error: { message: 'Lookup failed' },
      });
    }
    if (path.startsWith('/zone')) {
      return Promise.resolve({ ok: true, data: { data: null } });
    }
    return Promise.resolve({ ok: false, data: null, error: { message: 'unexpected path' } });
  });
  vi.spyOn(api, 'getRings').mockResolvedValue({
    ok: true,
    data: {
      data: {
        coverage: true,
        ring_set: { aoi_name: 'Houston metro',
                    derivation_kind: 'MODEL_DERIVED_CONTEXT',
                    artifact_sha256: 'abc123def456' },
        summary: {
          max_months: 23, population_exposed: 1796902,
          structures_exposed: 536585, roads_at_risk_km: 1407.34,
        },
        rings: { type: 'FeatureCollection', features: [] },
      },
    },
  });
  render(<FloodReport lat={29.76} lon={-95.36} address="123 Main St" />);

  const section = await screen.findByTestId('report-recurrence');
  expect(within(section).getByText(/1,796,902/)).toBeInTheDocument();
  expect(screen.getByText(/Lookup failed/i)).toBeInTheDocument();
});
