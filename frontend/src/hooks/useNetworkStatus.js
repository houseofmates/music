import { useEffect, useState } from 'react';

const getNavigatorConnection = () => {
  if (typeof navigator === 'undefined') {
    return null;
  }
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

const readStatus = () => {
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

export default function useNetworkStatus() {
  const [status, setStatus] = useState(() => readStatus());

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
