import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { Button } from './ui/button';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <h2 className="font-semibold">Oops! Something went wrong.</h2>
      {error?.message ? <div>{error.message}</div> : null}
      <div className="mb-2">Please try again.</div>
      <Button onClick={resetErrorBoundary}>Retry</Button>
    </div>
  );
};

export default ErrorFallback;
