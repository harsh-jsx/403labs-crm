import React from "react";

export function FieldRow({ cols = 2, children }) {
  const colsClass =
    cols === 3
      ? "sm:grid-cols-3"
      : cols === 4
        ? "sm:grid-cols-4"
        : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 gap-3 ${colsClass}`}>
      {children}
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-600">
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
      className={`w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${props.className ?? ""}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full min-h-[110px] resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${props.className ?? ""}`}
    />
  );
}

