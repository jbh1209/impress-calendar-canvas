
import { useEffect, useMemo, useState } from "react";
import { adminListCustomers, type AdminCustomer } from "@/services/adminCustomerService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const limit = 20;

  useEffect(() => {
    document.title = "Admin Customers | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Browse customers and view details in a slide-over.");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminListCustomers({ page, limit });
        setCustomers(res.items);
      } catch (e: any) {
        toast({ title: "Failed to load customers", description: e.message, variant: "destructive" });
      }
    })();
  }, [page]);

  const hasMore = useMemo(() => customers.length === limit, [customers.length]);

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customers</h1>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last sign in</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id} onClick={() => setSelected(c)} className="cursor-pointer">
              <TableCell className="font-medium">{c.email}</TableCell>
              <TableCell>{c.created_at ? new Date(c.created_at).toLocaleString() : "—"}</TableCell>
              <TableCell>{c.last_sign_in_at ? new Date(c.last_sign_in_at).toLocaleString() : "—"}</TableCell>
            </TableRow>
          ))}
          {customers.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">No customers found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <footer className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button variant="outline" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </footer>

      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <SheetContent side="right" className="w-[420px] sm:w-[520px]">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>Quick view of the selected customer.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div>
                <div className="text-xs text-muted-foreground">Email</div>
                <div className="font-medium">{selected.email}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div>{selected.created_at ? new Date(selected.created_at).toLocaleString() : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last sign in</div>
                  <div>{selected.last_sign_in_at ? new Date(selected.last_sign_in_at).toLocaleString() : "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">ID</div>
                <div className="font-mono text-xs break-all">{selected.id}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
