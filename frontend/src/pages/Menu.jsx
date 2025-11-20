import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import "./Menu.css";

export default function Menu({ isOpen, menuPopupRef, onItemClick }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const closeMenu = () => {
    onItemClick?.();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await logout(refreshToken);
    } catch (error) {
      console.error("Logout failed:", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    closeMenu();
    navigate("/");
  };

  const handleHome = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/home");
  };

  const menu = (
    <div
      ref={menuPopupRef}
      className="menu-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <button className="menu-item" onClick={handleHome}>
        Home
      </button>
      <button className="menu-item">Friends</button>
      <button className="menu-item">Confession</button>
      <button className="menu-item">Support</button>
      <button className="menu-item logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );

  return createPortal(menu, document.body);
}
