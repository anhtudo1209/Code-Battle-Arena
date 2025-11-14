// src/components/Menu.jsx
import React from "react";
import "./Menu.css";

export default function Menu({ isOpen }) {
  // ⚠️ phải là isOpen (chữ o, không phải số 0)
  if (!isOpen) return null;

  return (
    <div
      className="menu-popup"
      onClick={(e) => e.stopPropagation()}   // click trong menu không tắt
    >
      <button className="menu-item">Home</button>
      <button className="menu-item">Friends</button>
      <button className="menu-item">Confession</button>
      <button className="menu-item">Support</button>
      <button className="menu-item logout">Log out</button>
    </div>
  );
}