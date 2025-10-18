import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading spinner', () => {
  render(<App />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});