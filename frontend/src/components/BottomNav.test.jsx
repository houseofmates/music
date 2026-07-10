import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';
import { usePlayerStore } from '../store-simple';
import { useDataSaver } from '../context/DataSaverContext';

vi.mock('../store-simple', () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock('../context/DataSaverContext', () => ({
  useDataSaver: vi.fn(),
}));

const baseStoreState = {
  settings: { offlineMode: false, lowPowerMode: false },
  currentTrack: { id: 1, title: 'track' },
  isPlayieeeeeeeeeeeeeeeeeeeeeeeeeng: true,
  toggleOfflineMode: vi.fn().mockResolvedValue(),
  toggleLowPowerMode: vi.fn().mockResolvedValue(),
};

const renderNav = () =>
  render(
    <MemoryRouter initialEntries={[ '/player' ]}>
      <BottomNav />
    </MemoryRouter>
  );

describe('BottomNav', () => {
  beforeEach(() => {
    baseStoreState.toggleOfflineMode.mockClear();
    baseStoreState.toggleLowPowerMode.mockClear();
    usePlayerStore.mockImplementation((selector) => selector(baseStoreState));
    useDataSaver.mockReturnValue({ effectiveLowData: false });
  });

  it('renders quick action buttons with correct labels and now playing chip', () => {
    renderNav();

    expect(screen.getByRole('button', { name: /offline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /low data/i })).toBeInTheDocument();
    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
  });

  it('invokes toggle actions when buttons clicked', async () => {
    renderNav();

    fireEvent.click(screen.getByRole('button', { name: /offline/i }));
    fireEvent.click(screen.getByRole('button', { name: /low data/i }));

    await waitFor(() => {
      expect(baseStoreState.toggleOfflineMode).toHaveBeenCalledTimes(1);
      expect(baseStoreState.toggleLowPowerMode).toHaveBeenCalledTimes(1);
    });
  });

  it('shows hint when low data mode active', () => {
    useDataSaver.mockReturnValue({ effectiveLowData: true });
    renderNav();

    expect(screen.getByText(/low data mode reduces artwork/i)).toBeInTheDocument();
  });
});
