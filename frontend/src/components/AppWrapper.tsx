import React from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

const AppWrapper: React.FC<Props> = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default AppWrapper;