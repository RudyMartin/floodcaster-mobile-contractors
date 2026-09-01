import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EvidenceCert from './EvidenceCert';

test('sample cert is badged Preview and disclaims it is not real', () => {
  render(<EvidenceCert />);
  expect(screen.getByText(/preview/i)).toBeInTheDocument();
  // Text is split across elements, so check for parts
  expect(screen.getByText(/sample layout/i)).toBeInTheDocument();
  expect(screen.getByText(/not a real certificate/i)).toBeInTheDocument();
});
