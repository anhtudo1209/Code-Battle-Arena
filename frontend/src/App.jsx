import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import ThemeSwitch from "./components/ThemeToggle";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <>
                <ThemeSwitch />
                <Home />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
