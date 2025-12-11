import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../pages/Menu";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuPopupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (!isMenuOpen) return;

      const btn = menuButtonRef.current;
      const isClickOnButton = btn && btn.contains(e.target);

      // Check if the click target is inside the menu popup
      if (menuPopupRef.current && menuPopupRef.current.contains(e.target)) {
        // Click is inside menu - let the menu item handlers deal with it
        return;
      }

      // Click is outside button and outside menu - close it
      if (!isClickOnButton) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, [isMenuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((s) => !s);
  };

  return (
    <header className="header">
      <h1
        className="logo"
        role="button"
        tabIndex={0}
        onClick={() => navigate("/home")}
        onKeyDown={(e) => {
          if (e.key === "Enter") navigate("/home");
        }}
      >
        CODE BATTLE ARENA
      </h1>
      <div className="header-right">
        <input type="text" placeholder="Search..." className="search-bar" />
        <button className="icon-btn" onClick={() => window.location.href = '/createroom.htm'}>
          Create Room
        </button>
        <button
          ref={menuButtonRef}
          className="icon-btn menu-btn"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>
      </div>
      <Menu
        isOpen={isMenuOpen}
        menuPopupRef={menuPopupRef}
        onItemClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
