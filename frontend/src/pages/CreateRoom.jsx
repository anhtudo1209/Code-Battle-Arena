import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { get, post } from "../services/httpClient";
import { logout } from "../services/authService";
import { Search, PlusCircle, Users, LogOut } from "lucide-react";
import Header from "../components/Header";
import "./CreateRoom.css";

const COLOR_MAP = {
  red: "#E53935",
  orange: "#FB8C00",
  yellow: "#FDD835",
  green: "#43A047",
  purple: "#8E24AA",
  teal: "#00897B",
};

export default function CreateRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarView, setSidebarView] = useState("create-room");
  const [activeTab, setActiveTab] = useState("practice");

  // Handle navigation state from Home page
  useEffect(() => {
    if (location.state?.view) {
      setSidebarView(location.state.view);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Match demo states
  const [queue, setQueue] = useState(null);
  const [battle, setBattle] = useState(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [acceptCountdown, setAcceptCountdown] = useState(null);
  const [preBattleRating, setPreBattleRating] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultPopupData, setResultPopupData] = useState(null);
  const [queueStartTime, setQueueStartTime] = useState(null);
  const [queueTimer, setQueueTimer] = useState(0);
  const [battleTimer, setBattleTimer] = useState(0);
  const battleStartTimeRef = useRef(null);
  const shownResultBattleId = useRef(null);

  // --- Initial Load ---
  const loadUser = async () => {
    try {
      const data = await get("/auth/me");
      setUser(data.user);
    } catch (e) {
      console.error("loadUser", e);
    }
  };

  const loadStatus = async () => {
    try {
      const s = await get("/battle/status");
      setQueue(s);
      if (s.status === "matched") {
        const b = await get("/battle/active");
        setBattle(b);
        if (b.exercise?.starterCode && !code) setCode(b.exercise.starterCode);

        if (b.battle?.status === "pending") {
          setSidebarView("find-match");
          if (b.battle?.createdAt) {
            const createdTime = new Date(b.battle.createdAt).getTime();
            if (!isNaN(createdTime) && createdTime > 0) {
              const now = Date.now();
              const elapsed = Math.floor((now - createdTime) / 1000);
              const remaining = Math.max(0, 20 - elapsed);
              if (elapsed <= 25) setAcceptCountdown(remaining);
            }
          }
        } else if (b.battle?.status === "active") {
          setSidebarView("find-match");
        }
      } else if (s.status === "queued") {
        setSidebarView("find-match");
      }
    } catch (e) { }
  };

  useEffect(() => {
    loadUser();
    loadStatus();
  }, []);

  // --- Timers & Polling ---
  useEffect(() => {
    let intervalId = null;
    if (queueStartTime && queue?.status === "queued") {
      intervalId = setInterval(() => {
        setQueueTimer(Math.floor((Date.now() - queueStartTime) / 1000));
      }, 1000);
    } else {
      setQueueTimer(0);
    }
    return () => clearInterval(intervalId);
  }, [queueStartTime, queue?.status]);

  useEffect(() => {
    let intervalId = null;
    if (battle?.battle?.status === "active") {
      const MAX_BATTLE_TIME = 1200;
      if (!battleStartTimeRef.current) battleStartTimeRef.current = Date.now();
      const updateTimer = () => {
        const elapsed = Math.floor(
          (Date.now() - battleStartTimeRef.current) / 1000
        );
        setBattleTimer(Math.max(0, MAX_BATTLE_TIME - elapsed));
      };
      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    } else {
      battleStartTimeRef.current = null;
      setBattleTimer(0);
    }
    return () => clearInterval(intervalId);
  }, [battle?.battle?.status]);

  useEffect(() => {
    if (queue?.status !== "queued") return;
    const interval = setInterval(async () => {
      try {
        const s = await get("/battle/status");
        setQueue(s);
        if (s.status === "matched") {
          setQueueStartTime(null);
          const b = await get("/battle/active");
          setBattle(b);
          if (b.exercise?.starterCode && !code) setCode(b.exercise.starterCode);
          if (b.battle?.status === "pending") setAcceptCountdown(20);
        }
      } catch (e) { }
    }, 2000);
    return () => clearInterval(interval);
  }, [queue?.status]);

  useEffect(() => {
    let interval = null;
    if (battle?.battle?.status === "pending") {
      interval = setInterval(async () => {
        try {
          const b = await get("/battle/active");
          setBattle(b);
          if (b.exercise?.starterCode && !code) setCode(b.exercise.starterCode);
          if (
            b.battle?.status === "active" &&
            preBattleRating === null &&
            user?.rating != null
          ) {
            setPreBattleRating(user.rating);
          }
          if (b.battle?.status !== "pending") setAcceptCountdown(null);
        } catch (e) { }
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [battle?.battle?.status, preBattleRating, user?.rating, code]);

  useEffect(() => {
    let interval = null;
    if (battle?.battle?.status === "active") {
      interval = setInterval(async () => {
        try {
          const b = await get("/battle/active");
          const prevStatus = battle?.battle?.status;
          setBattle(b);
          if (prevStatus === "active" && b.battle?.status === "completed") {
            await showBattleResult(b.battle);
          }
        } catch (e) { }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [battle?.battle?.status]);

  useEffect(() => {
    if (battle?.battle?.status === "pending") {
      const interval = setInterval(() => {
        setAcceptCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [battle?.battle?.status]);

  // --- Handlers ---
  const withBusy = async (fn) => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = () =>
    withBusy(async () => {
      const res = await post("/battle/join-queue", {});
      setQueueStartTime(Date.now());
      setQueue({
        status: "queued",
        rating: res.rating,
        searchDifficulty: res.searchDifficulty,
      });
      if (user?.rating) setPreBattleRating(user.rating);
    });

  const handleLeave = () =>
    withBusy(async () => {
      await post("/battle/leave-queue", {});
      setQueue({ status: "none" });
      setBattle(null);
      setQueueStartTime(null);
    });

  const handleAccept = async () => {
    if (!battle?.battle?.id) return;
    try {
      await post(`/battle/${battle.battle.id}/accept`, {});
      const b = await get("/battle/active");
      setBattle(b);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleResign = async () => {
    if (!battle?.battle?.id) return;
    if (!window.confirm("Confirm resign?")) return;
    try {
      await post(`/battle/${battle.battle.id}/resign`, {});
      const b = await get("/battle/active");
      setBattle(b);
      if (b.battle?.status === "completed") await showBattleResult(b.battle);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSubmit = async () => {
    if (!battle?.battle?.id) return;
    setSubmitting(true);
    setError("");
    setInfo("Submitting...");
    try {
      await post("/battle/submit", {
        battleId: battle.battle.id,
        exerciseId: battle.battle.exerciseId,
        code,
      });
      setInfo("Submission sent!");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showBattleResult = async (battleData) => {
    if (!battleData || !user || shownResultBattleId.current === battleData.id)
      return;
    const me = await get("/auth/me");
    setUser(me.user);
    const winnerId = battleData.winnerId;
    const outcome = winnerId
      ? winnerId === me.user.id
        ? "win"
        : "loss"
      : "draw";
    const delta =
      preBattleRating != null ? me.user.rating - preBattleRating : 0;
    setResultPopupData({ outcome, delta });
    setShowResultPopup(true);
    shownResultBattleId.current = battleData.id;
  };

  const handleContinue = () => {
    setShowResultPopup(false);
    setBattle(null);
    setQueue({ status: "none" });
    setCode("");
    setSidebarView("find-match");
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await logout(refreshToken);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  // --- Renderers ---
  return (
    // THAY ĐỔI CHÍNH: Flex-col để Header nằm trên cùng
    <div className="flex flex-col h-screen w-full bg-gray-950 text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      {/* HEADER: Nằm ngoài wrapper, trên cùng, full-width */}
      {battle?.battle?.status !== "active" && <Header />}

      {/* CONTENT WRAPPER: Chứa Sidebar và Main nằm ngang hàng */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`hidden md:flex w-64 h-full bg-slate-900 border-r border-slate-800 flex-col p-6 ${battle?.battle?.status === "active" ? "hidden" : ""
            }`}
        >
          {/* User Profile */}
          <div className="flex flex-col items-center mb-10 mt-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-emerald-500 overflow-hidden"
              style={{
                backgroundColor: COLOR_MAP[user?.avatar_color] || "#43A047",
              }}
            >
              <img
                src={`https://ssl.gstatic.com/docs/common/profile/${user?.avatar_animal || "alligator"
                  }_lg.png`}
                alt="Profile"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-100">
              {user?.display_name || user?.username || "Guest"}
            </h2>
            <div className="mt-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
              <span className="text-emerald-400 text-sm font-semibold">
                ELO: {user?.rating || 0}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-3">
            <button
              onClick={() => setSidebarView("find-match")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${sidebarView === "find-match"
                  ? "bg-emerald-900/40 border border-emerald-700/50 text-emerald-300"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Search className="w-5 h-5" />
              <span>Find match</span>
            </button>

            <button
              onClick={() => setSidebarView("create-room")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${sidebarView === "create-room"
                  ? "bg-emerald-900/40 border border-emerald-700/50 text-emerald-300"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-bold">Create room</span>
            </button>

            <button
              onClick={() => setSidebarView("join-room")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${sidebarView === "join-room"
                  ? "bg-emerald-900/40 border border-emerald-700/50 text-emerald-300"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Join room</span>
            </button>
          </nav>

          {/* Logout */}
          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col relative">
          <main className="flex-1 p-6 flex justify-center items-center relative">
            {/* CREATE ROOM VIEW */}
            {sidebarView === "create-room" && (
              <div className="w-full max-w-7xl h-full bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 flex flex-col">
                <div className="text-center mt-6 mb-3">
                  <h2 className="text-4xl font-black text-emerald-400">
                    CREATE ROOM
                  </h2>
                  <p className="text-slate-400 mt-1">
                    Choose how you want to play
                  </p>
                </div>

                <div className="relative mx-auto mb-4 w-full max-w-md flex rounded-full bg-slate-900/70 border border-slate-700 px-2 py-1">
                  <div
                    className={`absolute inset-y-1 left-2 w-[calc(50%-4px)] rounded-full transition-all duration-300 bg-emerald-600/30 ${activeTab === "practice"
                        ? "translate-x-0"
                        : "translate-x-full"
                      }`}
                  ></div>

                  <button
                    onClick={() => setActiveTab("practice")}
                    className={`relative z-10 flex-1 py-3 rounded-full font-black tracking-wide transition-all focus:outline-none ${activeTab === "practice"
                        ? "text-emerald-400"
                        : "text-slate-400 hover:text-white"
                      }`}
                  >
                    PRACTICE
                  </button>

                  <button
                    onClick={() => setActiveTab("custom")}
                    className={`relative z-10 flex-1 py-3 rounded-full font-black tracking-wide transition-all focus:outline-none ${activeTab === "custom"
                        ? "text-emerald-400"
                        : "text-slate-400 hover:text-white"
                      }`}
                  >
                    CUSTOM
                  </button>
                </div>

                <div className="flex-1 relative overflow-hidden">
                  {activeTab === "practice" && (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                      <h3 className="text-3xl font-bold text-white mb-8">
                        Select Difficulty
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <button
                          onClick={() =>
                            navigate("/practice", {
                              state: { difficulty: "easy" },
                            })
                          }
                          className="group relative bg-slate-900/60 border border-slate-700 hover:border-emerald-500 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition"></div>
                          <h4 className="text-2xl font-black text-emerald-400 mb-2">
                            EASY
                          </h4>
                          <p className="text-slate-400 mb-6">Should be easy</p>
                        </button>
                        <button
                          onClick={() =>
                            navigate("/practice", {
                              state: { difficulty: "medium" },
                            })
                          }
                          className="group relative bg-slate-900/60 border border-slate-700 hover:border-yellow-500 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition"></div>
                          <h4 className="text-2xl font-black text-yellow-400 mb-2">
                            MEDIUM
                          </h4>
                          <p className="text-slate-400 mb-6">Still easy</p>
                        </button>
                        <button
                          onClick={() =>
                            navigate("/practice", {
                              state: { difficulty: "difficult" },
                            })
                          }
                          className="group relative bg-slate-900/60 border border-slate-700 hover:border-red-500 rounded-2xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition"></div>
                          <h4 className="text-2xl font-black text-red-500 mb-2">
                            HARD
                          </h4>
                          <p className="text-slate-400 mb-6">Not that easy</p>
                        </button>
                      </div>
                    </div>
                  )}
                  {activeTab === "custom" && (
                    <div className="h-full flex items-center justify-center">
                      <div className="max-w-xl w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                        <h3 className="text-3xl font-bold text-emerald-400 text-center mb-6">
                          Custom Room
                        </h3>
                        <div className="space-y-4">
                          <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-200"
                            placeholder="Room name"
                          />
                          <select className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-200">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                          </select>
                          <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-200"
                            placeholder="Max players"
                          />
                          <label className="flex items-center gap-2 text-slate-400">
                            <input type="checkbox" /> Private room
                          </label>
                          <button className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition">
                            CREATE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FIND MATCH VIEW */}
            {sidebarView === "find-match" && (
              <div className="w-full h-full flex flex-col">
                {(!battle?.battle || battle.battle.status === "completed") && (
                  <div className="w-full max-w-3xl h-full mx-auto flex flex-col justify-center">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-12 text-center relative overflow-hidden">
                      <h2 className="text-5xl font-black text-slate-100 mb-8">
                        RANKED <span className="text-emerald-500">MATCH</span>
                      </h2>
                      {queue?.status === "queued" && (
                        <div className="mb-8">
                          <div className="text-6xl font-black text-emerald-400 font-mono tracking-widest">
                            {Math.floor(queueTimer / 60)}:
                            {(queueTimer % 60).toString().padStart(2, "0")}
                          </div>
                          <p className="text-slate-400 mt-2 animate-pulse">
                            Searching for opponent...
                          </p>
                        </div>
                      )}
                      {queue?.status === "queued" ? (
                        <button
                          onClick={handleLeave}
                          disabled={busy}
                          className="px-12 py-4 bg-transparent border-2 border-red-500/50 text-red-400 rounded-2xl font-black text-xl hover:bg-red-500/10 transition"
                        >
                          CANCEL SEARCH
                        </button>
                      ) : (
                        <button
                          onClick={handleJoin}
                          disabled={busy}
                          className="px-12 py-6 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition transform hover:-translate-y-1"
                        >
                          FIND MATCH
                        </button>
                      )}
                      {error && (
                        <p className="mt-4 text-red-400 font-bold">{error}</p>
                      )}
                    </div>
                  </div>
                )}
                {battle?.battle?.status === "pending" && (
                  <div className="w-full max-w-xl h-full mx-auto flex flex-col justify-center">
                    <div className="bg-slate-900/60 border border-emerald-500/50 rounded-[32px] p-12 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                      <h2 className="text-4xl font-black text-emerald-400 mb-4">
                        MATCH FOUND!
                      </h2>
                      <div className="flex items-center justify-center gap-4 mb-8">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-emerald-500 overflow-hidden"
                          style={{
                            backgroundColor:
                              COLOR_MAP[battle.opponent?.avatar_color] ||
                              "#43A047",
                          }}
                        >
                          <img
                            src={`https://ssl.gstatic.com/docs/common/profile/${battle.opponent?.avatar_animal || "alligator"
                              }_lg.png`}
                            alt="Opponent"
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-xl font-bold text-white">
                            {battle.opponent?.display_name ||
                              battle.opponent?.username}
                          </p>
                          <p className="text-sm text-emerald-400">
                            ELO: {battle.opponent?.rating || "???"}
                          </p>
                        </div>
                      </div>
                      <div className="text-8xl font-black text-emerald-500 mb-8 font-mono">
                        {acceptCountdown || 0}
                      </div>
                      <button
                        onClick={handleAccept}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-xl transition"
                      >
                        ACCEPT BATTLE
                      </button>
                    </div>
                  </div>
                )}
                {battle?.battle?.status === "active" && (
                  <div className="flex-1 flex flex-col h-full bg-slate-950 absolute inset-0 z-50">
                    <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-emerald-500 overflow-hidden"
                          style={{
                            backgroundColor:
                              COLOR_MAP[battle.opponent?.avatar_color] ||
                              "#43A047",
                          }}
                        >
                          <img
                            src={`https://ssl.gstatic.com/docs/common/profile/${battle.opponent?.avatar_animal || "alligator"
                              }_lg.png`}
                            alt="Opponent"
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-slate-400">VS</span>
                          <span className="text-white text-lg ml-2 font-bold">
                            {battle.opponent?.display_name ||
                              battle.opponent?.username}
                          </span>
                          <span className="text-emerald-400 text-sm ml-2">
                            ({battle.opponent?.rating || "???"})
                          </span>
                        </div>
                      </div>
                      <div
                        className={`font-mono text-2xl font-bold ${battleTimer < 30 ? "text-red-500" : "text-emerald-400"
                          }`}
                      >
                        {Math.floor(battleTimer / 60)}:
                        {(battleTimer % 60).toString().padStart(2, "0")}
                      </div>
                      <div>
                        <button
                          onClick={handleResign}
                          className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg font-bold hover:bg-red-500 hover:text-white transition text-sm"
                        >
                          RESIGN
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                      <div className="w-1/2 p-8 overflow-y-auto border-r border-slate-800 bg-slate-900/20">
                        <div className="flex gap-2 items-center mb-6">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase border border-emerald-500/20">
                            {battle.exercise?.difficulty}
                          </span>
                          <h2 className="text-3xl font-bold text-slate-100">
                            {battle.exercise?.id}
                          </h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-300">
                          <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 shadow-none border-none text-base leading-relaxed">
                            {battle.exercise?.content}
                          </pre>
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col bg-slate-950">
                        <textarea
                          className="flex-1 w-full bg-[#0d1117] text-slate-200 p-6 font-mono text-sm leading-6 resize-none outline-none border-none focus:ring-0"
                          placeholder="// Write your solution here..."
                          spellCheck="false"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                        <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6">
                          <span className="text-slate-500 text-sm">{info}</span>
                          <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? "SUBMITTING..." : "SUBMIT SOLUTION"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* JOIN ROOM VIEW */}
            {sidebarView === "join-room" && (
              <div className="text-center text-slate-500">
                <h2 className="text-2xl font-bold mb-4">Join Room</h2>
                <p>Feature coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* RESULT POPUP */}
      {showResultPopup && resultPopupData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md bg-slate-900 border-2 rounded-[32px] p-8 text-center animate-up transform transition-all ${resultPopupData.outcome === "win"
                ? "border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
                : "border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.2)]"
              }`}
          >
            <div className="text-8xl mb-6">
              {resultPopupData.outcome === "win"
                ? "🏆"
                : resultPopupData.outcome === "loss"
                  ? "💀"
                  : "🤝"}
            </div>
            <h2
              className={`text-4xl font-black mb-4 uppercase ${resultPopupData.outcome === "win"
                  ? "text-emerald-400"
                  : "text-red-500"
                }`}
            >
              {resultPopupData.outcome === "win"
                ? "VICTORY"
                : resultPopupData.outcome === "loss"
                  ? "DEFEATED"
                  : "DRAW"}
            </h2>
            <div className="text-3xl font-bold text-slate-200 mb-8">
              {resultPopupData.delta > 0 ? "+" : ""}
              {resultPopupData.delta} ELO
            </div>
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
