import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaTrophy,
  FaFire,
  FaCheckCircle,
  FaMedal,
} from "react-icons/fa";
import Stepper, { Step } from "../components/Stepper";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import { get } from "../services/httpClient";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Parallel fetch
    Promise.all([
      get("/auth/leaderboard").then((data) =>
        setLeaderboard(data.leaderboard || [])
      ),
      get("/auth/me")
        .then((data) => setStreak(data.user?.daily_streak || 0))
        .catch(() => {}),
    ]).catch((err) => console.error("Failed to load home data", err));
  }, []);

  const handleGetStarted = () => {
    navigate("/create-room", { state: { view: "find-match" } });
  };

  return (
    <div className="home-page">
      <PageTitle title="Home" />

      <Header />

      <div className="content">
        <aside className="sidebar">
          <div className="glass-card streak">
            <h2
              style={{
                color: "#34d399",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              {streak} DAY STREAK
            </h2>
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
            <h2
              style={{
                color: "#34d399",
                textTransform: "uppercase",
                fontWeight: "800",
              }}
            >
              LEADERBOARD
            </h2>
            <ul>
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-700/30 last:border-0"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <span
                        className={`text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : index === 1
                            ? "bg-slate-300/20 text-slate-300"
                            : index === 2
                            ? "bg-amber-700/20 text-amber-600"
                            : index === 3 || index === 4
                            ? "bg-slate-600/30 text-slate-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {player.username}
                    </span>
                    <span className="text-emerald-400 text-sm font-mono">
                      {player.rating}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 text-sm text-center py-2">
                  Loading...
                </li>
              )}
            </ul>
          </div>

          <div className="glass-card daily">
            <h2
              style={{
                color: "#34d399",
                textTransform: "uppercase",
                fontWeight: "800",
              }}
            >
              DAILY CHALLENGE
            </h2>
            <p className="mb-4 text-slate-400 text-sm">
              Solve a random problem!
            </p>

            <button
              onClick={() => navigate("/challenge")}
              className="btn play-btn w-full"
            >
              PLAY
            </button>
          </div>
        </aside>

        <main className="main-area" style={{ marginBottom: "20px" }}>
          <div
            className="tutorial-section"
            style={{
              marginTop: "530px",
              marginBottom: "0px",
              marginLeft: "350px",
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
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.9)",
                textTransform: "uppercase",
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
                <h3 style={{ color: "#43ff9bff" }}>
                  Step 1: Register an Account
                </h3>
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
