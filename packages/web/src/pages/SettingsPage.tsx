import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/api/hooks';

export function SettingsPage() {
  const { data: settingsData, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [workdayStart, setWorkdayStart] = useState(9);
  const [workdayEnd, setWorkdayEnd] = useState(17);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [timestampFormat, setTimestampFormat] = useState<'12h' | '24h'>('24h');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'system'>('system');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync form state with loaded settings
  useEffect(() => {
    if (settingsData?.data) {
      setWorkdayStart(settingsData.data.workdayStart);
      setWorkdayEnd(settingsData.data.workdayEnd);
      setDefaultDuration(settingsData.data.defaultDuration);
      setTimestampFormat(settingsData.data.timestampFormat);
      setColorScheme(settingsData.data.colorScheme);
    }
  }, [settingsData]);

  const handleSave = async () => {
    setMessage(null);

    if (workdayEnd <= workdayStart) {
      setMessage({ type: 'error', text: 'Workday end must be after workday start' });
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        workdayStart,
        workdayEnd,
        defaultDuration,
        timestampFormat,
        colorScheme,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-destructive/10 text-destructive'
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Workday</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="workday-start" className="text-sm font-medium">
              Start time
            </label>
            <select
              id="workday-start"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={workdayStart}
              onChange={(e) => setWorkdayStart(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="workday-end" className="text-sm font-medium">
              End time
            </label>
            <select
              id="workday-end"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={workdayEnd}
              onChange={(e) => setWorkdayEnd(Number(e.target.value))}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {i.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Defaults</h2>
        <div className="space-y-2">
          <label htmlFor="default-duration" className="text-sm font-medium">
            Default task duration (minutes)
          </label>
          <input
            id="default-duration"
            type="number"
            min="5"
            max="480"
            step="5"
            value={defaultDuration}
            onChange={(e) => setDefaultDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Display</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="time-format" className="text-sm font-medium">
              Time format
            </label>
            <select
              id="time-format"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={timestampFormat}
              onChange={(e) => setTimestampFormat(e.target.value as '12h' | '24h')}
            >
              <option value="24h">24-hour (14:30)</option>
              <option value="12h">12-hour (2:30 PM)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="color-scheme" className="text-sm font-medium">
              Color scheme
            </label>
            <select
              id="color-scheme"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as 'light' | 'dark' | 'system')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={updateSettingsMutation.isPending}
        className="py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {updateSettingsMutation.isPending ? 'Saving...' : 'Save settings'}
      </button>
    </div>
  );
}
