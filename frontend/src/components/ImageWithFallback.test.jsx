import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageWithFallback from './ImageWithFallback';
import { useDataSaver } from '../context/DataSaverContext';

vi.mock('../context/DataSaverContext', () => ({
  useDataSaver: vi.fn(),
}));

beforeEach(() => {
  useDataSaver.mockReset();
  useDataSaver.mockReturnValue({ shouldLoadHighRes: true });
});

describe('ImageWithFallback', () => {
  it('renders fallback initials when data saver blocks high-res imagery', () => {
    useDataSaver.mockReturnValue({ shouldLoadHighRes: false });

    render(
      <ImageWithFallback src="/art.jpg" alt="cover" fallbackText="alpha" />
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders image when high-res loads are allowed', () => {
    useDataSaver.mockReturnValue({ shouldLoadHighRes: true });

    render(
      <ImageWithFallback src="/art.jpg" alt="cover" fallbackText="beta" />
    );

    expect(screen.getByRole('img', { name: 'cover' })).toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
  });
});
