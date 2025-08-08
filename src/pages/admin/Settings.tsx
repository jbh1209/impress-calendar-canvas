
import { useEffect, useState } from "react";
import { getAdminConfig, type PayfastConfig } from "@/services/adminConfigService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<PayfastConfig | null>(null);

  useEffect(() => {
    document.title = "Admin Settings | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Admin settings for payments and integrations.");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await getAdminConfig();
        setConfig(cfg);
      } catch (e: any) {
        toast({ title: "Failed to load settings", description: e.message, variant: "destructive" });
      }
    })();
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>PayFast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">Mode</label>
            <Input value={config?.payfast_mode ?? ""} readOnly />
            <p className="text-xs text-muted-foreground">Sandbox for testing, Live for production.</p>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">ITN Callback URL</label>
            <Input value={config?.itn_url ?? ""} readOnly />
            <p className="text-xs text-muted-foreground">Configure this URL in your PayFast dashboard ITN settings.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
