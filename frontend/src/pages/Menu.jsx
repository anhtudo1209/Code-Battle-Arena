// src/components/Menu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService"; // chỉnh path nếu khác
import "./Menu.css";

export default function Menu({ isOpen }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await logout(refreshToken); // gọi API backend
    } catch (error) {
      console.error("Logout failed:", error);
    }

    // Xoá token local
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Điều hướng về login
    navigate("/");
  };

  return (
    <div
      className="menu-popup"
      onClick={(e) => e.stopPropagation()} // click trong menu không tắt
    >
      <button className="menu-item">Home</button>
      <button className="menu-item">Friends</button>
      <button className="menu-item">Confession</button>
      <button className="menu-item">Support</button>
      <button className="menu-item logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}
