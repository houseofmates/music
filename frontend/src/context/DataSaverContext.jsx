import React, { createContext, useContext, useMemo } from 'react';
import { usePlayerStore } from '../store';
import useNetworkStatus from '../hooks/useNetworkStatus';

const DataSaverContext = createContext({
  isOnline: true,
  saveData: false,
  effectiveType: 'unknown',
  offlineForced: false,
  lowPowerMode: false,
  effectiveLowData: false,
  shouldLoadHighRes: true,
  shouldPrefetchImages: true,
});

export function DataSaverProvider({ children }) {
  const settings = usePlayerStore((state) => state.settings);
  const network = useNetworkStatus();

  const value = useMemo(() => {
    const offlineForced = Boolean(settings?.offlineMode);
    const lowPowerMode = Boolean(settings?.lowPowerMode);
    const isOnline = Boolean(network?.isOnline);
    const saveData = Boolean(network?.saveData);
    const effectiveType = network?.effectiveType || 'unknown';
    const slowConnection = ['slow-2g', '2g'].includes(effectiveType);

    const effectiveLowData = offlineForced || lowPowerMode || saveData || slowConnection || !isOnline;

    return {
      isOnline,
      saveData,
      effectiveType,
      offlineForced,
      lowPowerMode,
      effectiveLowData,
      shouldLoadHighRes: !effectiveLowData,
      shouldPrefetchImages: !effectiveLowData && isOnline,
    };
  }, [settings?.offlineMode, settings?.lowPowerMode, network?.isOnline, network?.saveData, network?.effectiveType]);

  return <DataSaverContext.Provider value={value}>{children}</DataSaverContext.Provider>;
}

export const useDataSaver = () => useContext(DataSaverContext);
