
import { ReactNode } from "react";

export default function TemplateSettingsPanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full flex justify-center items-start bg-gradient-to-br from-zinc-50 to-zinc-100 min-h-screen py-10">
      <section className="w-full max-w-2xl rounded-3xl shadow-xl bg-white border border-gray-100 px-8 py-10 flex flex-col gap-10 md:gap-12">
        {children}
      </section>
    </div>
  );
}
