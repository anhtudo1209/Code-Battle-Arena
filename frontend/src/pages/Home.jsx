import React, { useState } from "react";
import {
  FaPlay,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaMedal,
} from "react-icons/fa";
import Stepper, { Step } from "../components/Stepper";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      {/* Background */}
      <div className="bg-overlay"></div>

      {/* Aurora Mystic Mist Background */}
      <div
        className="absolute inset-0 z-0 blur-3xl opacity-90"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 80%, rgba(6, 182, 212, 0.5) 0%, transparent 60%),
            radial-gradient(circle at 70% 90%, rgba(255, 140, 0, 0.35) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(238, 130, 238, 0.3) 0%, transparent 80%)
          `,
        }}
      />

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
            <div className="streak-days">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} className="day">{day}</div>
              ))}
            </div>
            <div className="streak-dots">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="dot"></div>
              ))}
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
            <a href="/practice" className="btn play-btn">
              PLAY
            </a>
          </div>
        </aside>

        {/* Main Section */}
        <main className="main-area">
          <p className="subtitle">
            Code Battle Arena is an online code battle game with multiple game
            modes.
          </p>

          <div className="battle-area">
            {/* Người - trái */}
            <div className="icon-wrap">
              <svg className="person-svg glowing" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                {/* head */}
                <circle cx="16" cy="12" r="8" fill="#7af2b2" />
                {/* torso + shield shape (silhouette) */}
                <path d="M4 28 L28 28 L40 56 L12 56 Z" fill="#34d399" />
                {/* left lower base to match icon shape */}
                <path d="M12 56 L2 72 L4 76 L18 62 Z" fill="#34d399"/>
                {/* raised arm and sword (to right upward) */}
                <path d="M26 24 L38 4 L42 6 L30 26 Z" fill="#06b6d4"/>
                <rect x="40" y="-6" width="4" height="28" transform="rotate(0 42 -6)" fill="#06b6d4" />
              </svg>
            </div>

            {/* Máy tính - trái */}
            <div className="icon-wrap">
              <svg className="monitor-svg glowing" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                {/* bezel */}
                <rect x="6" y="6" rx="8" ry="8" width="108" height="60" fill="#34d399" stroke="#06b6d4" strokeWidth="4"/>
                {/* inner screen (light) */}
                <rect x="14" y="14" rx="4" ry="4" width="92" height="44" fill="#ffffff"/>
                {/* bottom bezel strip */}
                <rect x="44" y="70" width="32" height="8" rx="3" fill="#34d399"/>
                {/* stand base */}
                <rect x="50" y="78" width="20" height="6" rx="3" fill="#06b6d4"/>
                {/* center button */}
                <circle cx="60" cy="74" r="2.5" fill="#7af2b2" />
              </svg>
            </div>

            {/* VS */}
            <div className="vs">VS</div>

            {/* Máy tính - phải (giống trái) */}
            <div className="icon-wrap">
              <svg className="monitor-svg glowing" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                <rect x="6" y="6" rx="8" ry="8" width="108" height="60" fill="#34d399" stroke="#06b6d4" strokeWidth="4"/>
                <rect x="14" y="14" rx="4" ry="4" width="92" height="44" fill="#ffffff"/>
                <rect x="44" y="70" width="32" height="8" rx="3" fill="#34d399"/>
                <rect x="50" y="78" width="20" height="6" rx="3" fill="#06b6d4"/>
                <circle cx="60" cy="74" r="2.5" fill="#7af2b2" />
              </svg>
            </div>

            {/* Người - phải (mirrored) */}
            <div className="icon-wrap">
              <svg className="person-svg mirrored glowing" viewBox="0 0 60 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
                <circle cx="44" cy="12" r="8" fill="#7af2b2" />
                <path d="M56 28 L32 28 L20 56 L48 56 Z" fill="#34d399" />
                <path d="M48 56 L58 72 L56 76 L42 62 Z" fill="#34d399"/>
                <path d="M34 24 L22 4 L18 6 L30 26 Z" fill="#06b6d4"/>
                <rect x="14" y="-6" width="4" height="28" transform="rotate(0 16 -6)" fill="#06b6d4" />
              </svg>
            </div>
          </div>

          <button className="btn start-btn">GET STARTED</button>

          {/* Tutorial Section */}
          <div className="tutorial-section" style={{
            marginTop: '50px',
            textAlign: 'center'
          }}>
            <h2 className="tutorial-title" style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#7af2b2'
            }}>How to Get Started</h2>
            <Stepper
              initialStep={1}
              onStepChange={(step) => {
                console.log(step);
              }}
              onFinalStepCompleted={() => console.log("All steps completed!")}
              backButtonText="Previous"
              nextButtonText="Next"
              style={{ maxWidth: '600px', margin: '0 auto' }}
            >
              <Step>
                <h3>Step 1: Register an Account</h3>
                <p>Create your account to access all features of Code Battle Arena.</p>
              </Step>
              <Step>
                <h3>Step 2: Choose Your Language</h3>
                <p>Select your preferred programming language and start coding.</p>
              </Step>
              <Step>
                <h3>Step 3: Join a Battle</h3>
                <p>Enter the arena and compete against other coders in real-time challenges.</p>
              </Step>
              <Step>
                <h3>Step 4: Climb the Leaderboard</h3>
                <p>Win battles to earn points and climb the global rankings.</p>
              </Step>
            </Stepper>
          </div>
        </main>
      </div>
    </div>
  );
}
