import React from "react";

export default function FormSection({ title, children }) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

