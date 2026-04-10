import React from "react";

const inputBase =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export function FieldRow({ cols = 2, children }) {
  const colsClass =
    cols === 3
      ? "sm:grid-cols-3"
      : cols === 4
        ? "sm:grid-cols-4"
        : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>{children}</div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`${inputBase} ${props.className ?? ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`${inputBase} ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`${inputBase} min-h-[120px] resize-y ${props.className ?? ""}`}
    />
  );
}
