import React, { useMemo } from "react";
import "./Home.css";
import LiquidEther from "../components/LiquidEther";

export default function Home() {
  // Memoize LiquidEther to prevent re-renders
  const liquidEtherBackground = useMemo(() => (
    <LiquidEther
      colors={["#7af2b2", "#34d399", "#06b6d4"]}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    />
  ), []);

  return (
    <div className="home-page">
      {/* Background */}
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      {/* LiquidEther Background */}
      <div className="liquid-ether-wrapper">
        {liquidEtherBackground}
      </div>

      {/* Header */}
      <header className="header">
        <h1 className="logo">CODE BATTLE ARENA</h1>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="icon-btn">⚙️</div>
          <div className="icon-btn">☰</div>
        </div>
      </header>

      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="glass-card streak">
            <h2>0 Day Streak</h2>
            <p>Take a lesson today to start a new streak!</p>
            <div className="streak-dots">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="dot"></div>
              ))}
            </div>
          </div>

          <div className="glass-card leaderboard">
            <h2>LEADERBOARD</h2>
            <ul>
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>
                  NO.{i} Username{i}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card daily">
            <h2>DAILY CHALLENGE</h2>
            <p>Earn 10 Exp</p>
            <div className="progress-bar">
              <div className="progress"></div>
            </div>
            <button className="btn play-btn">PLAY</button>
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
