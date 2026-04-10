import React from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Button } from "@heroui/react";
import { auth } from "../firebase";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";

const navClass = ({ isActive }) =>
  [
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-300 hover:bg-white/5 hover:text-white",
  ].join(" ");

export default function Navbar() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 shadow-lg shadow-slate-950/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <NavLink
            to="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-white"
          >
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              403 Labs
            </span>
            <span className="text-slate-400"> CRM</span>
          </NavLink>
          <nav className="hidden flex-wrap items-center gap-1 sm:flex">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/contacts" className={navClass}>
              Contacts
            </NavLink>
            <NavLink to="/leads" className={navClass}>
              Leads
            </NavLink>
            <NavLink to="/meetings" className={navClass}>
              Meetings
            </NavLink>
            <NavLink to="/tasks" className={navClass}>
              Tasks
            </NavLink>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[200px] truncate text-xs text-slate-400 md:inline">
            {user?.email ?? ""}
          </span>
          <Button
            size="sm"
            className="border border-slate-700 bg-slate-900 text-slate-200"
            variant="flat"
            onClick={() => {
              signOut(auth);
              navigate("/login");
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
