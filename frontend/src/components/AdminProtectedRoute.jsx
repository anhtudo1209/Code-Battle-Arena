import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { get } from "../services/httpClient";

export default function AdminProtectedRoute({ children }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
      : null;

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    // Check if user is admin
    get("/auth/me")
      .then((data) => {
        setIsAdmin(data.user?.role === "admin");
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [accessToken]);

  if (!accessToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

