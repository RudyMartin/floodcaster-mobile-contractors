import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DecisionTrace from './DecisionTrace';

test('traces are badged Preview and disclaimed as sample', () => {
  render(<DecisionTrace />);
  expect(screen.getByText(/preview/i)).toBeInTheDocument();
  expect(screen.getByText(/sample decision traces/i)).toBeInTheDocument();
});
