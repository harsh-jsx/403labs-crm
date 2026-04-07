import React from "react";
import { Button } from "@heroui/react";
import { Link } from "react-router-dom";

function Crumb({ to, children }) {
  if (!to) {
    return <span className="text-zinc-700">{children}</span>;
  }
  return (
    <Link
      to={to}
      className="text-zinc-500 hover:text-zinc-800 transition-colors"
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
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {crumbs.length > 0 && (
              <div className="mb-1 flex items-center gap-2 text-sm">
                {crumbs.map((c, idx) => (
                  <React.Fragment key={`${c.label}-${idx}`}>
                    <Crumb to={c.to}>{c.label}</Crumb>
                    {idx < crumbs.length - 1 && (
                      <span className="text-zinc-400">›</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="text-lg font-semibold text-zinc-900">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button color="primary" onClick={onSave}>
              Save
            </Button>
            <Button as={Link} to={onCancelTo} variant="flat">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10">{children}</div>
    </div>
  );
}

