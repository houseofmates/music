import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Announce page changes to screen readers
    const pageTitle = document.title;
    const announcement = `Navigated to ${pageTitle}`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    ariaLive.style.width = '1px';
    ariaLive.style.height = '1px';
    ariaLive.style.overflow = 'hidden';
    document.body.appendChild(ariaLive);
    ariaLive.textContent = announcement;

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(ariaLive);
    }, 1000);
  }, [location.pathname]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip links functionality
      if (event.key === 'h' && event.altKey) {
        event.preventDefault();
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
};

export default AccessibilityProvider;