
import { useEffect, useMemo, useState } from "react";
import { adminListOrders, type AdminOrder } from "@/services/adminOrderService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function StatusBadge({ status }: { status: string }) {
  const variant = status === "completed" ? "default" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const limit = 20;

  useEffect(() => {
    document.title = "Admin Orders | Impress Calendars";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Admin orders management: view and filter orders by status.");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminListOrders({ page, limit, status });
        setOrders(res.items);
        setTotal(res.total);
      } catch (e: any) {
        toast({ title: "Failed to load orders", description: e.message, variant: "destructive" });
      }
    })();
  }, [page, status]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <main className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-2 items-center">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={status ?? ""}
            onChange={(e) => setStatus(e.target.value || undefined)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </header>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id} onClick={() => setSelected(o)} className="cursor-pointer">
              <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
              <TableCell className="font-mono text-xs">{o.user_id.slice(0, 8)}…</TableCell>
              <TableCell>R{o.total_amount}</TableCell>
              <TableCell><StatusBadge status={o.status} /></TableCell>
              <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No orders found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <footer className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </footer>

      <Sheet open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Quick view of the selected order.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Order ID</div>
                  <div className="font-mono text-sm break-all">{selected.id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">User</div>
                  <div className="font-mono text-sm break-all">{selected.user_id}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Status</div>
                  <StatusBadge status={selected.status} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div>R{selected.total_amount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div>{new Date(selected.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div>{new Date(selected.updated_at).toLocaleString()}</div>
                </div>
              </div>
              {selected.pdf_url && (
                <a
                  href={selected.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  View PDF
                </a>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </main>
  );
}
