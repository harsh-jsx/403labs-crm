import React from "react";

export default function FormSection({ title, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40">
      <div className="border-b border-slate-100 bg-slate-50/90 px-5 py-3 text-sm font-semibold text-slate-800">
        {title}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
