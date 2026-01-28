export function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

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
              defaultValue="9"
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
              defaultValue="17"
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
            defaultValue="30"
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
              defaultValue="24h"
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
              defaultValue="system"
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
        className="py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
      >
        Save settings
      </button>
    </div>
  );
}
