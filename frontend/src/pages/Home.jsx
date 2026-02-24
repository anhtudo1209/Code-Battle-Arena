import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrophy, FaFire } from "react-icons/fa6";
import Header from "../components/Header";
import PageTitle from "../components/PageTitle";
import { get } from "../services/httpClient";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [recentBattles, setRecentBattles] = useState([]);

  useEffect(() => {
    // Parallel fetch
    Promise.all([
      get("/auth/leaderboard").then((data) =>
        setLeaderboard(data.leaderboard || [])
      ),
      get("/auth/me")
        .then((data) => {
          setStreak(data.user?.daily_streak || 0);
          setMaxStreak(data.user?.max_streak || 0);
        })
        .catch(() => { }),
      get("/battle/recent")
        .then((data) => setRecentBattles(data.battles || []))
        .catch(() => { }),
    ]).catch((err) => console.error("Failed to load home data", err));
  }, []);

  const handleGetStarted = () => {
    navigate("/create-room", { state: { view: "find-match" } });
  };



  return (
    <div className="home-page">
      <PageTitle title="Home" />
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
          backgroundSize:
            "80px 80px, 40px 40px, 60px 60px, 80px 80px, 100% 100%",
          backgroundPosition: "0 0, 0 0, 0 0, 40px 40px, center",
        }}
      />

      <Header />

      <div className="content">
        <aside className="sidebar">
          <div className="glass-card streak">
            <h2>{streak} Day Streak</h2>
            <p>Take a lesson today to start a new streak!</p>
            <div className="streak-best">
              <FaTrophy className="streak-best-icon" />
              <span>Best: <strong>{maxStreak}</strong> day{maxStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="glass-card leaderboard">
            <h2>LEADERBOARD</h2>
            <ul>
              {leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-700/30 last:border-0"
                  >
                    <span className="font-bold flex items-center gap-2">
                      <span
                        className={`text-xs w-5 h-5 rounded-full flex items-center justify-center ${index === 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : index === 1
                            ? "bg-slate-300/20 text-slate-300"
                            : index === 2
                              ? "bg-amber-700/20 text-amber-600"
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
            <h2>DAILY CHALLENGE</h2>
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

          <button className="btn start-btn" onClick={handleGetStarted}>
            GET STARTED
          </button>

          <div className="recent-battles">
            <h2 className="recent-battles-title">
              <FaFire className="recent-battles-icon" />
              Recent Battles
            </h2>
            {recentBattles.length === 0 ? (
              <p className="recent-battles-empty">
                No battles yet — hit <strong>GET STARTED</strong> to play your first match!
              </p>
            ) : (
              <ul className="battle-list">
                {recentBattles.map((b) => (
                  <li key={b.id} className="battle-row">
                    <span className={`result-badge result-${b.result}`}>
                      {b.result.toUpperCase()}
                    </span>
                    <span className="battle-opponent">vs {b.opponent}</span>
                    <span className="battle-exercise">{b.exerciseId}</span>

                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
