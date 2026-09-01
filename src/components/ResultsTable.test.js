// P2.5 — Results Display tests. Real source: GET /jobs/{id} + /jobs/{id}/buildings.
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResultsTable from './ResultsTable';
import * as api from '../api';

const BUILDINGS = [
  { building_id: 'B-1', depth_ft: 3.2, dmg_pct_struct: 0.18, dmg_pct_content: 0.32, bldg_loss_usd: 45200, cont_loss_usd: 22100 },
  { building_id: 'B-2', depth_ft: 1.5, dmg_pct_struct: 0.08, dmg_pct_content: 0.15, bldg_loss_usd: 18700, cont_loss_usd: 8900 },
];

test('renders real building rows from getJobBuildings', async () => {
  vi.spyOn(api, 'getJob').mockResolvedValue({ ok: true, data: { data: { total_buildings: 2, total_loss_usd: 94900, max_depth_ft: 3.2, mean_dmg_pct: 0.13 } } });
  vi.spyOn(api, 'getJobBuildings').mockResolvedValue({ ok: true, data: { data: BUILDINGS } });
  render(<ResultsTable jobId="job-xyz" />);
  expect(await screen.findByText('B-1')).toBeInTheDocument();
  expect(screen.getByText(/\$45,200/)).toBeInTheDocument();
  expect(screen.queryByText(/mock data/i)).not.toBeInTheDocument();
});

test('honest-empty when the job has no buildings', async () => {
  vi.spyOn(api, 'getJob').mockResolvedValue({ ok: true, data: { data: { total_buildings: 0 } } });
  vi.spyOn(api, 'getJobBuildings').mockResolvedValue({ ok: true, data: { data: [] } });
  render(<ResultsTable jobId="job-empty" />);
  expect(await screen.findByText(/no building results for this job/i)).toBeInTheDocument();
});

test('no jobId renders a preview badge, not fake numbers as real', () => {
  render(<ResultsTable />);
  expect(screen.getByText(/preview/i)).toBeInTheDocument();
});
