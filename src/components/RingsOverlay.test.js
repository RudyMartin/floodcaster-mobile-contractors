import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RingsOverlay from './RingsOverlay';
import * as api from '../api';

// react-leaflet is ESM + needs a real DOM size; stub it.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  GeoJSON: ({ data }) => (
    <div data-testid="geojson">{data.features.length} features</div>
  ),
}));

// Real API envelope: { data: { <payload> }, meta }. api.js names the body `.data`,
// so the payload the component reads is at resp.data.data.
const RINGS_RESPONSE = {
  ok: true,
  data: {
    data: {
      coverage: true,
      ring_set: {
        ring_set_id: 'houston-metro-v1',
        aoi_name: 'Houston metro',
        derivation_kind: 'MODEL_DERIVED_CONTEXT',
        artifact_sha256: '3f4efb0210d7aaaa',
      },
      summary: { max_months: 23 },
      rings: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature',
            geometry: { type: 'MultiPolygon', coordinates: [] },
            properties: { level_index: 4, level_name: 'Extreme',
                          density_threshold: 0.9 } },
          { type: 'Feature',
            geometry: { type: 'MultiPolygon', coordinates: [] },
            properties: { level_index: 4, level_name: 'Extreme',
                          density_threshold: 0.85 } },
        ],
      },
    },
  },
};

test('renders rings map, legend, and provenance when covered', async () => {
  vi.spyOn(api, 'getRings').mockResolvedValue(RINGS_RESPONSE);
  render(<RingsOverlay lat={29.76} lon={-95.36} />);
  await screen.findByTestId('geojson');
  expect(screen.getByText(/Recurrence Rings/)).toBeInTheDocument();
  expect(screen.getByText(/MODEL_DERIVED_CONTEXT/)).toBeInTheDocument();
  expect(screen.getByText(/3f4efb0210d7/)).toBeInTheDocument();
  expect(screen.getByText(/Extreme/)).toBeInTheDocument();
  // Assert legend deduplicates duplicate level_name "Extreme" (2 features → 1 legend item)
  const extremeItems = screen.getAllByText(/Extreme/);
  expect(extremeItems.length).toBeGreaterThanOrEqual(1);
});

test('renders honest fallback when not covered', async () => {
  vi.spyOn(api, 'getRings').mockResolvedValue({
    ok: true, data: { data: { coverage: false, rings: null } },
  });
  render(<RingsOverlay lat={40.7} lon={-74.0} />);
  await screen.findByText(/recurrence rings not yet computed for this area/i);
  expect(screen.queryByTestId('map')).not.toBeInTheDocument();
});
