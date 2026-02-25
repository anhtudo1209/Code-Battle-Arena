import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { get } from "../services/httpClient";
import "./Menu.css";

export default function Menu({ isOpen, menuPopupRef, onItemClick }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin when menu opens
    if (isOpen) {
      const checkAdmin = async () => {
        try {
          const data = await get("/auth/me");
          setIsAdmin(data.user?.role === "admin");
        } catch (error) {
          setIsAdmin(false);
        }
      };
      checkAdmin();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const closeMenu = () => {
    onItemClick?.();
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

    try {
      await logout(refreshToken);
    } catch (error) {
      console.error("Logout failed:", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    closeMenu();
    navigate("/");
  };

  const handleHome = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/home");
  };

  const handleAdmin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/admin");
  };



  const menu = (
    <div
      ref={menuPopupRef}
      className="menu-popup"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Home Button Removed */}

      {isAdmin && (
        <button className="menu-item admin" onClick={handleAdmin}>
          Admin
        </button>
      )}

      {/* Friends, Confession, Support Moved to Header */}

      <button className="menu-item" onClick={() => { closeMenu(); navigate("/settings"); }}>
        Settings
      </button>
      <button className="menu-item logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );

  return createPortal(menu, document.body);
}
