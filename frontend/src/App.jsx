import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import ThemeSwitch from "./components/ThemeToggle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/home" element={<><ThemeSwitch /><Home /></>} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </BrowserRouter>
  );
}
