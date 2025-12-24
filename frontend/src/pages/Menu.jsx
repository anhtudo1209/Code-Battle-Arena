import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";
import { get } from "../services/httpClient";
import { Flame } from "lucide-react";
import "./Menu.css";

export default function Menu({ isOpen, menuPopupRef, onItemClick }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Check if user is admin when menu opens
    if (isOpen) {
      const checkAdmin = async () => {
        try {
          const data = await get("/auth/me");
          setIsAdmin(data.user?.role === "admin");
          setStreak(data.user?.daily_streak || 0);
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

  const handleAdmin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/admin");
  };

  const handleMatchTest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/match-test");
  };

  const handleMatchDemo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    navigate("/match-demo");
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

      <button className="menu-item" onClick={handleMatchTest}>
        Match Test
      </button>
      <button className="menu-item" onClick={handleMatchDemo}>
        Match Demo
      </button>
      {isAdmin && (
        <button className="menu-item admin" onClick={handleAdmin}>
          Admin
        </button>
      )}
      <a href="/Friends.html" className="menu-item">
        Friends
      </a>
      <a href="/Confession.html" className="menu-item">
        Confession
      </a>
      <button className="menu-item" onClick={() => { closeMenu(); navigate("/support"); }}>
        Support
      </button>
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
