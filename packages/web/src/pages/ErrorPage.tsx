import { ErrorInfo } from 'react';

interface ErrorPageProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

export function ErrorPage({ error, errorInfo, onReset }: ErrorPageProps) {
  const isDevelopment = import.meta.env.DEV;

  const handleReportError = () => {
    // Log to console for now - could be integrated with error reporting service
    console.log('Error reported:', {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    alert('Error has been reported. Thank you for helping improve the app!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="text-6xl">
            <span role="img" aria-label="warning">!</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Don&apos;t worry, your data is safe.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          {onReset && (
            <button
              onClick={onReset}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors"
          >
            Go to home
          </button>
          <button
            onClick={handleReportError}
            className="px-6 py-2 border border-border text-foreground rounded-md font-medium hover:bg-accent transition-colors"
          >
            Report error
          </button>
        </div>

        {isDevelopment && error && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-destructive">
                Error Details (Development Only)
              </h2>
              <p className="text-sm text-muted-foreground">
                This information is only visible in development mode
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-foreground">Error Message:</h3>
              <pre className="bg-muted p-3 rounded-md text-sm text-destructive overflow-x-auto">
                {error.message}
              </pre>
            </div>

            {error.stack && (
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Stack Trace:</h3>
                <pre className="bg-muted p-3 rounded-md text-xs text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto">
                  {error.stack}
                </pre>
              </div>
            )}

            {errorInfo?.componentStack && (
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Component Stack:</h3>
                <pre className="bg-muted p-3 rounded-md text-xs text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
