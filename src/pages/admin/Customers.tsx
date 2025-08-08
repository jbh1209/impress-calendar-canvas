
import { useEffect } from "react";

export default function CustomersPage() {
  useEffect(() => {
    document.title = "Admin Customers | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "View and manage customers in the admin area.");
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="text-muted-foreground">Customer management tools are coming soon.</p>
    </main>
  );
}
