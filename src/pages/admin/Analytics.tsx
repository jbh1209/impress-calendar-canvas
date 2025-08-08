
import { useEffect } from "react";

export default function AnalyticsPage() {
  useEffect(() => {
    document.title = "Admin Analytics | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "View key analytics and reports for Impress Calendars.");
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="text-muted-foreground">Analytics dashboard is coming soon.</p>
    </main>
  );
}
