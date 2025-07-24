import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard header', () => {
  render(<App />);
  const heading = screen.getByText(/Moodle Analytics/i);
  expect(heading).toBeInTheDocument();
});
