
import { ReactNode } from "react";

// Modern, full-width layout frame for editor settings
export default function TemplateSettingsPanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-zinc-50 to-zinc-100 py-0 md:py-8">
      <main className="flex flex-col max-w-5xl mx-auto w-full gap-10 px-0 md:px-10">
        {children}
      </main>
    </div>
  );
}
