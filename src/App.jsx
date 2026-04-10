import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Contacts from "./pages/Contacts";
import ContactsCreate from "./pages/ContactsCreate";
import Leads from "./pages/Leads";
import LeadsCreate from "./pages/LeadsCreate";
import Meetings from "./pages/Meetings";
import MeetingsCreate from "./pages/MeetingsCreate";
import Tasks from "./pages/Tasks";
import TasksCreate from "./pages/TasksCreate";
import { Toast } from "@heroui/react";
import { AdminAuthProvider, useAdminAuth } from "./hooks/useAdminAuth";

function ProtectedAdminRoute({ children }) {
  const { user, isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, isAdmin, navigate]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-400">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm font-medium text-slate-500">Loading workspace…</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

const App = () => {
  return (
    <Router>
      <AdminAuthProvider>
        <Toast.Provider />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <Home />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/contacts/create"
            element={
              <ProtectedAdminRoute>
                <ContactsCreate />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedAdminRoute>
                <Contacts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/leads/create"
            element={
              <ProtectedAdminRoute>
                <LeadsCreate />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedAdminRoute>
                <Leads />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/meetings/create"
            element={
              <ProtectedAdminRoute>
                <MeetingsCreate />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedAdminRoute>
                <Meetings />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/tasks/create"
            element={
              <ProtectedAdminRoute>
                <TasksCreate />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedAdminRoute>
                <Tasks />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
};

export default App;
