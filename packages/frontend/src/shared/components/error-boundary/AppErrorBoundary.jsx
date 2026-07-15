import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

const AppErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
      onError={(error, info) => {
        console.error('Unhandled error:', error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;
