import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertHistory from './CertHistory';
import * as api from '../api';

test('lists certificates with decision and anchor state', async () => {
  vi.spyOn(api, 'getCertificateHistory').mockResolvedValue({
    ok: true,
    data: {
      data: {
        count: 1,
        certificates: [{
          certificate_id: 'cert-abc-123456789',
          cert_kind: 'rsct_geo',
          decision: 'EXECUTE',
          verdict: null,
          issued_at: '2026-07-07T12:00:00+00:00',
          anchor_ref: null,
          cert_sha256: 'deadbeef',
          distance_m: 12.5,
        }],
      },
    },
  });
  render(<CertHistory lat={29.76} lon={-95.36} />);
  expect(await screen.findByText(/cert-abc-1234/)).toBeInTheDocument();
  expect(screen.getByText('EXECUTE')).toBeInTheDocument();
  expect(screen.getByText(/not anchored/i)).toBeInTheDocument();
});

test('empty history is stated, not hidden', async () => {
  vi.spyOn(api, 'getCertificateHistory').mockResolvedValue({
    ok: true, data: { data: { count: 0, certificates: [] } },
  });
  render(<CertHistory lat={40.7} lon={-74.0} />);
  expect(await screen.findByText(/no certificates issued for this location/i)).toBeInTheDocument();
});
