import React, { useState } from "react";
import "./Home.css";

// Menu Component
function Menu({ isOpen }) {
  console.log("Menu render - isOpen:", isOpen);
  
  if (!isOpen) return null;

  return (
    <div
      className="menu-popup"
      onClick={(e) => {
        console.log("Click inside menu");
        e.stopPropagation();
      }}
    >
      <button className="menu-item" onClick={() => console.log("Home clicked")}>
        Home
      </button>
      <button className="menu-item" onClick={() => console.log("Friends clicked")}>
        Friends
      </button>
      <button className="menu-item" onClick={() => console.log("Confession clicked")}>
        Confession
      </button>
      <button className="menu-item" onClick={() => console.log("Support clicked")}>
        Support
      </button>
      <button className="menu-item logout" onClick={() => console.log("Logout clicked")}>
        Log out
      </button>
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    console.log("Toggle menu clicked - current state:", isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    console.log("Closing menu from outside click");
    setIsMenuOpen(false);
  };

  return (
    <div className="home-page" onClick={closeMenu}>
      {/* Background */}
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      {/* Header */}
      <header className="header">
        <h1 className="logo">CODE BATTLE ARENA</h1>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="icon-btn">⚙️</div>
          <button className="icon-btn" onClick={toggleMenu}>
            ☰
          </button>
          {/* Menu Popup */}
          <Menu isOpen={isMenuOpen} />
        </div>
      </header>

      {/* Content */}
      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="glass-card streak">
            <h2>0 Day Streak</h2>
            <p>Take a lesson today to start a new streak!</p>
            <div className="streak-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>

          <div className="glass-card leaderboard">
            <h2>LEADERBOARD</h2>
            <ul>
              <li>NO.1 Username1</li>
              <li>NO.2 Username2</li>
              <li>NO.3 Username3</li>
              <li>NO.4 Username4</li>
            </ul>
          </div>

          <div className="glass-card daily">
            <h2>DAILY CHALLENGE</h2>
            <p>Earn 10 Exp</p>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>

            <a href="/practice" className="btn play-btn">PLAY</a>
          </div>
        </aside>

        {/* Main Section */}
        <main className="main-area">
          <p className="subtitle">
            Code Battle Arena is an online code battle game with multiple game
            modes.
          </p>

          <div className="battle-area">
            <div className="monitor">
              <div className="code-line"></div>
              <div className="code-line short"></div>
              <div className="code-line"></div>
              <div className="code-line short"></div>
            </div>

            <div className="vs">VS</div>

            <div className="monitor">
              <div className="code-line"></div>
              <div className="code-line short"></div>
              <div className="code-line"></div>
              <div className="code-line short"></div>
            </div>
          </div>

          <button className="btn start-btn">GET STARTED</button>
        </main>
      </div>
    </div>
  );
}