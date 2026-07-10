import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataSaverProvider, useDataSaver } from './DataSaverContext';

const mockStoreState = {
  settings: {
    offlineMode: false,
    lowPowerMode: false,
  },
};

vi.mock('../store', () => ({
  usePlayerStore: (selector) => selector(mockStoreState),
}));

const mockNetworkStatus = {
  isOnline: true,
  saveData: false,
  effectiveType: '4g',
};

vi.mock('../hooks/useNetworkStatus', () => ({
  default: () => mockNetworkStatus,
}));

function Probe() {
  const context = useDataSaver();
  return (
    <div
      data-testid="probe"
      data-low={String(context.effectiveLowData)}
      data-highres={String(context.shouldLoadHighRes)}
    />
  );
}

const renderProbe = () =>
  render(
    <DataSaverProvider>
      <Probe />
    </DataSaverProvider>
  );

beforeEach(() => {
  mockStoreState.settings = {
    offlineMode: false,
    lowPowerMode: false,
  };
  mockNetworkStatus.isOnline = true;
  mockNetworkStatus.saveData = false;
  mockNetworkStatus.effectiveType = '4g';
});

describe('DataSaverContext', () => {
  it('treats forced offline as low data and blocks high-res assets', () => {
    mockStoreState.settings.offlineMode = true;

    renderProbe();

    const probe = screen.getByTestId('probe');
    expect(probe.dataset.low).toBe('true');
    expect(probe.dataset.highres).toBe('false');
  });

  it('considers slow connections as low data even when online', () => {
    mockNetworkStatus.isOnline = true;
    mockNetworkStatus.effectiveType = '2g';

    renderProbe();

    const probe = screen.getByTestId('probe');
    expect(probe.dataset.low).toBe('true');
    expect(probe.dataset.highres).toBe('false');
  });
});
