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
      <div className="flex min-h-screen items-center justify-center bg-[#050506] text-sm text-zinc-400">
        Loading…
      </div>
    );
  }

  return children;
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </Router>
  );
};

export default App;
