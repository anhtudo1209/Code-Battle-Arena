import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../services/httpClient";
import { Users, MessageSquare, HelpCircle, Menu as MenuIcon } from "lucide-react";
import Menu from "../pages/Menu";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarAnimal, setAvatarAnimal] = useState("alligator");
  const [avatarColor, setAvatarColor] = useState("green");
  const [displayName, setDisplayName] = useState("");
  const menuButtonRef = useRef(null);
  const menuPopupRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await get("/auth/me");
        if (data.user) {
          setAvatarAnimal(data.user.avatar_animal || "alligator");
          setAvatarColor(data.user.avatar_color || "green");
          setDisplayName(data.user.display_name || data.user.username || "D");
        }
      } catch (err) {
        console.error("Failed to load avatar:", err);
      }
    };
    fetchProfile();
  }, []);

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
    <nav className="header">
      {/* --- BACKGROUND LAYERS (Hacker Style) --- */}

      {/* 1. Grid Background */}
      <div className="hk-grid-bg">
        <div className="hk-grid-line"></div>
        <div className="hk-grid-line"></div>
        <div className="hk-grid-line"></div>
        <div className="hk-grid-line"></div>
      </div>

      {/* 2. Neon Frame (Bottom Border Flicker) */}
      <div className="hk-neon-frame"></div>

      {/* 3. Scan Bars (Sweep across the nav) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
         <div className="hk-scan-bar" style={{ animationDelay: '0s' }}></div>
         <div className="hk-scan-bar" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="content-layer flex items-center">

          {/* LEFT: Logo Area */}
          <div className="relative flex items-center gap-4 group/logo">
             {/* Circuit Traces localized to Logo */}
             <div className="absolute -inset-4 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="hk-circuit-trace"></div>
                <div className="hk-circuit-trace"></div>
                <div className="hk-circuit-trace"></div>
             </div>

             <div className="h-8 w-1 bg-[#0bdca8] rounded-full shadow-[0_0_10px_#0bdca8] group-hover/logo:animate-pulse"></div>

             <div className="flex flex-col">
                 <h1
                   className="text-2xl font-display font-black text-[#e8fff6] tracking-widest uppercase italic drop-shadow-[0_0_5px_rgba(11,220,168,0.5)] cursor-pointer"
                   role="button"
                   tabIndex={0}
                   onClick={() => navigate("/home")}
                   onKeyDown={(e) => {
                     if (e.key === "Enter") navigate("/home");
                   }}
                 >
                     CODE BATTLE <span className="text-[#0bdca8] group-hover/logo:text-white transition-colors">ARENA</span>
                 </h1>
             </div>
          </div>

      </div>

      {/* RIGHT: Menu Items - Positioned absolutely to the right edge */}
      <div className="absolute right-4 top-0 h-full flex items-center justify-end gap-8">

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#e8fff6]">
              <button
                onClick={() => navigate("/friends")}
                className="flex items-center gap-2 hover:text-[#0bdca8] transition-all hover:tracking-widest duration-300 uppercase px-2 py-1 bg-transparent"
              >
                <span className="flex items-center gap-2">
                    <Users size={16} />
                    Friends
                </span>
              </button>

              <button
                onClick={() => navigate("/confession")}
                className="flex items-center gap-2 hover:text-[#0bdca8] transition-all hover:tracking-widest duration-300 uppercase px-2 py-1 bg-transparent"
              >
                <span className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    Confession
                </span>
              </button>

              <button
                onClick={() => navigate("/support")}
                className="flex items-center gap-2 hover:text-[#0bdca8] transition-all hover:tracking-widest duration-300 uppercase px-2 py-1 bg-transparent"
              >
                <span className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    Support
                </span>
              </button>
          </div>

          {/* User / Hamburger */}
          <div className="flex items-center gap-4 pl-8 border-l border-[#0bdca8]/20 relative">
             <div
               ref={menuButtonRef}
               onClick={toggleMenu}
               className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer"
               style={{
                 backgroundColor: (() => {
                   const colors = [
                     { name: "red", hex: "#E53935" },
                     { name: "orange", hex: "#FB8C00" },
                     { name: "yellow", hex: "#FDD835" },
                     { name: "green", hex: "#43A047" },
                     { name: "purple", hex: "#8E24AA" },
                     { name: "teal", hex: "#00897B" },
                   ];
                   return colors.find((c) => c.name === avatarColor)?.hex || "#43A047";
                 })(),
               }}
               aria-expanded={isMenuOpen}
             >
               <img
                 src={`https://ssl.gstatic.com/docs/common/profile/${avatarAnimal}_lg.png`}
                 alt="Avatar"
                 className="w-8 h-8 object-contain"
               />
             </div>

             <button
               className="p-2 hover:bg-[#0bdca8]/10 rounded transition-colors text-[#0bdca8] md:hidden border border-[#0bdca8]/30"
               onClick={() => navigate("/create-room", { state: { view: "find-match" } })}
             >
                 ▶ PLAY
             </button>
          </div>
      </div>
      <Menu
        isOpen={isMenuOpen}
        menuPopupRef={menuPopupRef}
        onItemClick={() => setIsMenuOpen(false)}
      />
    </nav>
  );
}
