import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* Background */}
      <div className="bg-image"></div>
      <div className="bg-overlay"></div>

      {/* Header */}
      <header className="header">
        <h1 className="logo">CODE BATTLE ARENA</h1>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="icon-btn">⚙️</div>
          <div className="icon-btn">☰</div>
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

            {/* 🔹 Link PLAY styled like button */}
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
