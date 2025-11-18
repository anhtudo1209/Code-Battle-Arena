// src/components/Menu.jsx
import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "./Menu.css";

export default function Menu({ isOpen, menuPopupRef, onItemClick }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { 
      localStorage.removeItem('token'); 
    } catch (err) { 
      console.error('Error removing token:', err); 
    }
    onItemClick?.();
    navigate('/');
  };

  const handleHome = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onItemClick?.();
    navigate('/home');
  };

  const menu = (
    <div
      ref={menuPopupRef}
      className="menu-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <button className="menu-item">Friends</button>
      <button className="menu-item">Confession</button>
      <button className="menu-item">Support</button>
      <button
        className="menu-item logout"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  );

  return createPortal(menu, document.body);
}