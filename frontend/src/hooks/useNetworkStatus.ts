import { useEffect, useState } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  saveData: boolean;
  effectiveType: string;
}

const getNavigatorConnection = (): Navigator['connection'] | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }
  return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection || null;
};

const readStatus = (): NetworkStatus => {
  if (typeof navigator === 'undefined') {
    return {
      isOnline: true,
      saveData: false,
      effectiveType: 'unknown',
    };
  }

  const connection = getNavigatorConnection();

  return {
    isOnline: navigator.onLine,
    saveData: Boolean(connection?.saveData),
    effectiveType: connection?.effectiveType || 'unknown',
  };
};

export default function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(() => readStatus());

  useEffect(() => {
    const updateStatus = () => {
      setStatus(readStatus());
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const connection = getNavigatorConnection();
    connection?.addEventListener?.('change', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      connection?.removeEventListener?.('change', updateStatus);
    };
  }, []);

  return status;
}