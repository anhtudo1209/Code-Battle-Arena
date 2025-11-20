import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (!accessToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
}

