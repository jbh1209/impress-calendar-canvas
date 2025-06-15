
import { ReactNode } from "react";

// Visual wrapper for each section/block in the template editor
export default function SectionPanel({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 sm:px-8 py-8 flex flex-col gap-4 relative">
      <header className="mb-2">
        <h2 className="font-bold text-lg md:text-xl text-slate-900 tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
