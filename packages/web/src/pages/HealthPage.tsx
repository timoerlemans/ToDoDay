import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  services: {
    api: { status: 'ok' | 'error' };
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
}

interface HealthCheck {
  data: HealthStatus | null;
  error: string | null;
  loading: boolean;
  responseTime: number | null;
  lastCheck: Date | null;
}

export function HealthPage() {
  const [health, setHealth] = useState<HealthCheck>({
    data: null,
    error: null,
    loading: true,
    responseTime: null,
    lastCheck: null,
  });

  const checkHealth = async () => {
    setHealth(prev => ({ ...prev, loading: true, error: null }));
    const start = Date.now();

    try {
      const response = await fetch('/api/health');
      const responseTime = Date.now() - start;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HealthStatus = await response.json();
      setHealth({
        data,
        error: null,
        loading: false,
        responseTime,
        lastCheck: new Date(),
      });
    } catch (error) {
      setHealth({
        data: null,
        error: error instanceof Error ? error.message : 'Failed to connect to API',
        loading: false,
        responseTime: Date.now() - start,
        lastCheck: new Date(),
      });
    }
  };

  useEffect(() => {
    checkHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'ok' | 'error' | 'degraded' | undefined) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: 'ok' | 'error' | 'degraded' | undefined) => {
    switch (status) {
      case 'ok':
        return 'Operational';
      case 'degraded':
        return 'Degraded';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Health</h1>
            <p className="text-muted-foreground">
              Monitor the status of ToDoDay services
            </p>
          </div>
          <button
            onClick={checkHealth}
            disabled={health.loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {health.loading ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        {/* Overall Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-4 h-4 rounded-full ${health.error ? 'bg-red-500' : getStatusColor(health.data?.status)}`}
            />
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {health.error ? 'Connection Failed' : getStatusText(health.data?.status)}
              </h2>
              {health.lastCheck && (
                <p className="text-sm text-muted-foreground">
                  Last checked: {health.lastCheck.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {health.error && (
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-medium">Connection Error</p>
            <p className="text-sm text-destructive/80 mt-1">{health.error}</p>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid gap-4">
          {/* API Service */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.error ? 'bg-red-500' : getStatusColor(health.data?.services.api.status)
                  }`}
                />
                <div>
                  <h3 className="font-medium text-card-foreground">API Server</h3>
                  <p className="text-sm text-muted-foreground">
                    {health.error ? 'Unreachable' : getStatusText(health.data?.services.api.status)}
                  </p>
                </div>
              </div>
              {health.responseTime !== null && (
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">
                    {health.responseTime}ms
                  </p>
                  <p className="text-xs text-muted-foreground">Response time</p>
                </div>
              )}
            </div>
          </div>

          {/* Database Service */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    health.error ? 'bg-gray-500' : getStatusColor(health.data?.services.database.status)
                  }`}
                />
                <div>
                  <h3 className="font-medium text-card-foreground">Database</h3>
                  <p className="text-sm text-muted-foreground">
                    {health.error
                      ? 'Unknown'
                      : health.data?.services.database.error || getStatusText(health.data?.services.database.status)}
                  </p>
                </div>
              </div>
              {health.data?.services.database.responseTime !== undefined && (
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">
                    {health.data.services.database.responseTime}ms
                  </p>
                  <p className="text-xs text-muted-foreground">Query time</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Server Timestamp */}
        {health.data?.timestamp && (
          <div className="text-center text-sm text-muted-foreground">
            Server time: {new Date(health.data.timestamp).toLocaleString()}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-primary hover:underline text-sm"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
