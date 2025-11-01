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
