import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

function ThrowingChild({ shouldThrow }) {
  if (shouldThrow) throw new Error('Test crash');
  return <p>Content OK</p>;
}

function renderBoundary(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    renderBoundary(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Content OK')).toBeInTheDocument();
  });

  it('shows fallback UI when child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderBoundary(
      <ErrorBoundary>
        <ThrowingChild shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
  });
});
