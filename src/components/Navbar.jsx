import React from "react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Button } from "@heroui/react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
export default function Navbar() {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-zinc-900">
            403 Labs
          </Link>
          <div className="hidden items-center gap-4 text-sm sm:flex">
            <Link className="text-zinc-600 hover:text-zinc-900" to="/">
              Dashboard
            </Link>
            <Link
              className="text-zinc-600 hover:text-zinc-900"
              to="/contacts/create"
            >
              Contacts
            </Link>
            <Link
              className="text-zinc-600 hover:text-zinc-900"
              to="/leads/create"
            >
              Leads
            </Link>
            <Link
              className="text-zinc-600 hover:text-zinc-900"
              to="/meetings/create"
            >
              Meetings
            </Link>
            <Link
              className="text-zinc-600 hover:text-zinc-900"
              to="/tasks/create"
            >
              Tasks
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-500 sm:inline">
            {user?.email ?? ""}
          </span>
          <Button
            size="sm"
            variant="flat"
            onClick={() => {
              signOut(auth);
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
