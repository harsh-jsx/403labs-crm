import React from "react";
import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

function Crumb({ to, children }) {
  if (!to) {
    return <span className="font-medium text-slate-800">{children}</span>;
  }
  return (
    <Link
      to={to}
      className="text-slate-500 transition hover:text-indigo-600"
    >
      {children}
    </Link>
  );
}

export default function CrmShell({
  title,
  crumbs = [],
  onSave,
  onCancelTo = "/",
  children,
}) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm shadow-slate-200/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {crumbs.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                {crumbs.map((c, idx) => (
                  <React.Fragment key={`${c.label}-${idx}`}>
                    <Crumb to={c.to}>{c.label}</Crumb>
                    {idx < crumbs.length - 1 && (
                      <span className="text-slate-300">/</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              color="primary"
              className="font-semibold"
              onClick={onSave}
              isDisabled={!onSave}
            >
              Save
            </Button>
            <Link
              to={onCancelTo}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300/50"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="space-y-4 pb-12">{children}</div>
      </div>
    </div>
  );
}
