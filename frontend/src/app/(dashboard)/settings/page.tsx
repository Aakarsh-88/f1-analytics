import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Preferences for your F1 Analytics dashboard.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-[rgb(var(--text-primary))]">Dark mode</p>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Switch between the carbon-dark and light themes.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <dt className="text-[rgb(var(--text-secondary))]">Data source</dt>
            <dd>Historical F1 dataset (CSV import)</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[rgb(var(--text-secondary))]">Version</dt>
            <dd className="font-mono">0.1.0</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
