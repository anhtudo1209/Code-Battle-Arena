import React, { useEffect, useRef, useState } from "react";
import {
  FaPlay,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaMedal,
} from "react-icons/fa";
import Stepper, { Step } from "../components/Stepper";
import Header from "../components/Header";
import "./Home.css";
import Menu from "./Menu";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef(null);
  const menuPopupRef = useRef(null);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuTrigger = menuContainerRef.current;
      const menuPopup = menuPopupRef.current;

      if (
        menuTrigger &&
        !menuTrigger.contains(event.target) &&
        (!menuPopup || !menuPopup.contains(event.target))
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="home-page">
      <div className="bg-overlay"></div>

      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(45deg, rgba(0,255,128,0.09) 0, rgba(0,255,128,0.09) 1px, transparent 1px, transparent 20px),
           repeating-linear-gradient(-45deg, rgba(255,0,128,0.10) 0, rgba(255,0,128,0.10) 1px, transparent 1px, transparent 30px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 80px),
            radial-gradient(circle at 60% 40%, rgba(0,255,128,0.05) 0, transparent 60%)
          `,
          backgroundSize: "80px 80px, 40px 40px, 60px 60px, 80px 80px, 100% 100%",
          backgroundPosition: "0 0, 0 0, 0 0, 40px 40px, center"
        }}
      />

      <header className="header home-header">
        <h1 className="logo">CODE BATTLE ARENA</h1>
        <div className="header-right">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="icon-btn">⚙️</div>
          <div className="home-menu-container" ref={menuContainerRef}>
            <button className="icon-btn menu-trigger" onClick={toggleMenu}>
              ☰
            </button>
            <Menu
              isOpen={isMenuOpen}
              menuPopupRef={menuPopupRef}
              onItemClick={() => setIsMenuOpen(false)}
            />
          </div>
        </div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <div className="glass-card streak">
            <h2>0 Day Streak</h2>
            <p>Take a lesson today to start a new streak!</p>
            <div className="streak-days">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, i) => (
                  <div key={i} className="day">
                    {day}
                  </div>
                )
              )}
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

        <main className="main-area">
          <p className="subtitle">
            Code Battle Arena is an online code battle game with multiple game
            modes.
          </p>

          <div className="battle-area">
            <div className="icon-wrap">
              <img
                src="/assets/img/human.png"
                alt="warrior icon"
                className="person-svg glowing"
                style={{
                  height: "120px",
                  width: "auto",
                  filter: "drop-shadow(0 0 10px rgba(122, 242, 178, 0.8))",
                }}
              />
            </div>

            <div className="icon-wrap">
              <svg
                className="monitor-svg glowing"
                viewBox="0 0 120 90"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden
              >
                <rect
                  x="6"
                  y="6"
                  rx="8"
                  ry="8"
                  width="108"
                  height="60"
                  fill="#34d399"
                  stroke="#06b6d4"
                  strokeWidth="4"
                />
                <rect
                  x="14"
                  y="14"
                  rx="4"
                  ry="4"
                  width="92"
                  height="44"
                  fill="#ffffff"
                />
                <rect
                  x="44"
                  y="70"
                  width="32"
                  height="8"
                  rx="3"
                  fill="#34d399"
                />
                <rect
                  x="50"
                  y="78"
                  width="20"
                  height="6"
                  rx="3"
                  fill="#06b6d4"
                />
                <circle cx="60" cy="74" r="2.5" fill="#7af2b2" />
              </svg>
            </div>

            <div className="vs">VS</div>

            <div className="icon-wrap">
              <svg
                className="monitor-svg glowing"
                viewBox="0 0 120 90"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden
              >
                <rect
                  x="6"
                  y="6"
                  rx="8"
                  ry="8"
                  width="108"
                  height="60"
                  fill="#34d399"
                  stroke="#06b6d4"
                  strokeWidth="4"
                />
                <rect
                  x="14"
                  y="14"
                  rx="4"
                  ry="4"
                  width="92"
                  height="44"
                  fill="#ffffff"
                />
                <rect
                  x="44"
                  y="70"
                  width="32"
                  height="8"
                  rx="3"
                  fill="#34d399"
                />
                <rect
                  x="50"
                  y="78"
                  width="20"
                  height="6"
                  rx="3"
                  fill="#06b6d4"
                />
                <circle cx="60" cy="74" r="2.5" fill="#7af2b2" />
              </svg>
            </div>

            <div className="icon-wrap">
              <img
                src="/assets/img/human.png"
                alt="warrior icon"
                className="person-svg mirrored glowing"
                style={{
                  height: "120px",
                  width: "auto",
                  transform: "scaleX(-1)",
                  filter: "drop-shadow(0 0 10px rgba(122, 242, 178, 0.8))",
                }}
              />
            </div>
          </div>

          <button className="btn start-btn">GET STARTED</button>

          <div
            className="tutorial-section"
            style={{
              marginTop: "50px",
              textAlign: "center",
            }}
          >
            <h2
              className="tutorial-title"
              style={{
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "#7af2b2",
              }}
            >
              How to Get Started
            </h2>
            <Stepper
              initialStep={1}
              onStepChange={(step) => {
                console.log(step);
              }}
              onFinalStepCompleted={() => console.log("All steps completed!")}
              backButtonText="Previous"
              nextButtonText="Next"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              <Step>
                <h3>Step 1: Register an Account</h3>
                <p>
                  Create your account to access all features of Code Battle
                  Arena.
                </p>
              </Step>
              <Step>
                <h3>Step 2: Choose Your Language</h3>
                <p>
                  Select your preferred programming language and start coding.
                </p>
              </Step>
              <Step>
                <h3>Step 3: Join a Battle</h3>
                <p>
                  Enter the arena and compete against other coders in real-time
                  challenges.
                </p>
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