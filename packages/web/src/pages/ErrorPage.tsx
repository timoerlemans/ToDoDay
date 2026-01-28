import { ErrorInfo, useState } from 'react';

interface ErrorPageProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset?: () => void;
}

export function ErrorPage({ error, errorInfo, onReset }: ErrorPageProps) {
  const isDevelopment = import.meta.env.DEV;
  const [copied, setCopied] = useState(false);

  const getDebugInfo = () => {
    return `Error Details (Development Only)

This information is only visible in development mode
Error Message:

${error?.message ?? 'No error message'}

Stack Trace:

${error?.stack ?? 'No stack trace'}

Component Stack:

${errorInfo?.componentStack ?? 'No component stack'}

Debug Info:
- Timestamp: ${new Date().toISOString()}
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
`;
  };

  const handleCopyError = async () => {
    const debugInfo = getDebugInfo();
    try {
      await navigator.clipboard.writeText(debugInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReportError = () => {
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
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-destructive">
                  Error Details (Development Only)
                </h2>
                <p className="text-sm text-muted-foreground">
                  This information is only visible in development mode
                </p>
              </div>
              <button
                onClick={handleCopyError}
                className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
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
