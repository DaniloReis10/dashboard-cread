import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Moodle Analytics heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Moodle Analytics/i);
  expect(headingElement).toBeInTheDocument();
});
