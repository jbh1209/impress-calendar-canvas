import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-14 items-center gap-3 px-4">
        <SidebarTrigger />
        <div className="flex-1">
          <Input placeholder="Search admin…" className="h-9 max-w-md" aria-label="Search admin" />
        </div>
      </div>
    </header>
  );
}
