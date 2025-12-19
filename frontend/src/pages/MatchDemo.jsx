import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { get, post } from "../services/httpClient";
import "./MatchDemo.css";

export default function MatchDemo() {
  const [user, setUser] = useState(null);
  const [queue, setQueue] = useState(null);
  const [battle, setBattle] = useState(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [acceptCountdown, setAcceptCountdown] = useState(null);
  const [preBattleRating, setPreBattleRating] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [resultPopupData, setResultPopupData] = useState(null);
  const [queueStartTime, setQueueStartTime] = useState(null);
  const [queueTimer, setQueueTimer] = useState(0);
  const shownResultBattleId = useRef(null);

  const loadUser = async () => {
    try {
      const data = await get("/auth/me");
      setUser(data.user);
    } catch (e) {
      console.error("loadUser", e);
    }
  };

  const loadStatus = async () => {
    const s = await get("/battle/status");
    setQueue(s);
    if (s.status === "matched") {
      const b = await get("/battle/active");
      setBattle(b);
      if (b.exercise?.starterCode && !code) {
        setCode(b.exercise.starterCode);
      }
      // Calculate countdown from creation time for sync
      if (b.battle?.status === 'pending') {
        if (b.battle?.createdAt) {
          const createdTime = new Date(b.battle.createdAt).getTime();
          if (!isNaN(createdTime) && createdTime > 0) {
            const now = Date.now();
            const elapsed = Math.floor((now - createdTime) / 1000);
            const remaining = Math.max(0, 20 - elapsed);
            
            // Safety: if battle is suspiciously old (more than 25 seconds), it's likely stale
            if (elapsed > 25) {
              console.warn('Battle is too old, likely stale. Not setting countdown.');
              setAcceptCountdown(null);
              return;
            }
            
            setAcceptCountdown(remaining);
            } else {
              setAcceptCountdown(20); // Fallback to 20 seconds
            }
          } else {
            setAcceptCountdown(20); // Fallback to 20 seconds
          }
      } else {
        setAcceptCountdown(null);
      }
    }
  };

  useEffect(() => {
    loadUser();
    loadStatus().catch(() => {});
  }, []);

  // Queue timer effect
  useEffect(() => {
    let intervalId = null;
    if (queueStartTime && queue?.status === 'queued') {
      intervalId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - queueStartTime) / 1000);
        setQueueTimer(elapsed);
      }, 1000);
    } else {
      setQueueTimer(0);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [queueStartTime, queue?.status]);

  // Poll while queued to auto-detect matches
  useEffect(() => {
    if (queue?.status !== 'queued') return;
    
    const intervalId = setInterval(async () => {
      try {
        const s = await get("/battle/status");
        setQueue(s);
        if (s.status === "matched") {
          // Match found! Load battle details
          setQueueStartTime(null); // Reset queue timer
          const b = await get("/battle/active");
          setBattle(b);
          if (b.exercise?.starterCode && !code) {
            setCode(b.exercise.starterCode);
          }
          // Calculate countdown from battle creation time
          if (b.battle?.status === 'pending') {
            if (b.battle?.createdAt) {
              const createdTime = new Date(b.battle.createdAt).getTime();
              if (!isNaN(createdTime) && createdTime > 0) {
                const now = Date.now();
                const elapsed = Math.floor((now - createdTime) / 1000);
                const remaining = Math.max(0, 20 - elapsed);
                
                // Safety: if battle is suspiciously old (more than 25 seconds), it's likely stale
                if (elapsed > 25) {
                  // Don't set countdown, let the effect handle it or refresh
                  return;
                }
                
                setAcceptCountdown(remaining);
              } else {
                setAcceptCountdown(20); // Fallback to 20 seconds
              }
            } else {
              setAcceptCountdown(20); // Fallback to 20 seconds
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }, 2000); // Poll every 2 seconds while queued
    
    return () => clearInterval(intervalId);
  }, [queue?.status, code]);

  // Accept countdown effect - calculate from createdAt for synchronization
  useEffect(() => {
    if (battle?.battle?.status === 'pending') {
      if (battle.battle?.createdAt) {
        const createdTime = new Date(battle.battle.createdAt).getTime();
        
        // Validate timestamp
        if (isNaN(createdTime) || createdTime <= 0) {
          setAcceptCountdown(20); // Fallback
          const fallbackInterval = setInterval(() => {
            setAcceptCountdown((c) => {
              if (c <= 1) {
                clearInterval(fallbackInterval);
                return null;
              }
              return c - 1;
            });
          }, 1000);
          return () => clearInterval(fallbackInterval);
        }
        
        const calculateRemaining = () => {
          const now = Date.now();
          const elapsed = Math.floor((now - createdTime) / 1000);
          return Math.max(0, 20 - elapsed);
        };
        
        const initialRemaining = calculateRemaining();
        setAcceptCountdown(initialRemaining);
        
        const intervalId = setInterval(() => {
          const remaining = calculateRemaining();
          setAcceptCountdown(remaining);
          if (remaining <= 0) {
            clearInterval(intervalId);
            setAcceptCountdown(null);
          }
        }, 1000);
        
        return () => clearInterval(intervalId);
      } else {
        setAcceptCountdown(20); // Fallback
        const fallbackInterval = setInterval(() => {
          setAcceptCountdown((c) => {
            if (c <= 1) {
              clearInterval(fallbackInterval);
              return null;
            }
            return c - 1;
          });
        }, 1000);
        return () => clearInterval(fallbackInterval);
      }
    } else {
      setAcceptCountdown(null);
    }
  }, [battle?.battle?.status, battle?.battle?.createdAt]);

  // Poll active battle while pending to pick up opponent accept/activation
  useEffect(() => {
    let intervalId = null;
    if (battle?.battle?.status === 'pending') {
      intervalId = setInterval(async () => {
        try {
          const b = await get('/battle/active');
          setBattle(b);
          if (b.battle?.status !== 'pending') setAcceptCountdown(null);
        } catch (e) {
          // ignore
        }
      }, 1500);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [battle?.battle?.status]);

  // Set preBattleRating when battle becomes active (if not already set)
  // Reset shownResultBattleId when a new battle starts
  useEffect(() => {
    if (battle?.battle?.status === 'active' && preBattleRating === null && user?.rating != null) {
      setPreBattleRating(user.rating);
    }
    // Reset shown result tracking when battle ID changes
    if (battle?.battle?.id && shownResultBattleId.current !== battle.battle.id) {
      // Only reset if we're starting a new battle (not completed)
      if (battle.battle.status !== 'completed') {
        shownResultBattleId.current = null;
      }
    }
  }, [battle?.battle?.status, battle?.battle?.id, user?.rating]);

  // Helper function to show result popup
  const showBattleResult = async (battleData) => {
    if (!battleData || !user) return;
    
    // Prevent showing popup multiple times for the same battle
    if (shownResultBattleId.current === battleData.id) {
      return;
    }
    
    const me = await get("/auth/me");
    const currentRating = me.user?.rating;
    setUser(me.user);
    
    // Determine outcome
    const winnerId = battleData.winnerId;
    let outcome = "draw";
    if (winnerId) {
      outcome = winnerId === me.user.id ? "win" : "loss";
    }
    
    // Calculate delta if we have preBattleRating, otherwise use 0
    const delta = (preBattleRating != null && currentRating != null) 
      ? currentRating - preBattleRating 
      : 0;
    
    const resultData = { outcome, delta };
    setLastResult(resultData);
    // Show result popup (always show, even for draws)
    setResultPopupData(resultData);
    setShowResultPopup(true);
    shownResultBattleId.current = battleData.id;
  };

  // Poll active battle while active to detect completion
  useEffect(() => {
    let intervalId = null;
    if (battle?.battle?.status === 'active') {
      intervalId = setInterval(async () => {
        try {
          const b = await get('/battle/active');
          const prevStatus = battle?.battle?.status;
          setBattle(b);
          
          // Detect when battle completes
          if (prevStatus === 'active' && b.battle?.status === 'completed') {
            await showBattleResult(b.battle);
          }
        } catch (e) {
          // If 404, battle might have completed - check status endpoint
          if (e.message?.includes('404') || e.message?.includes('No active battle')) {
            try {
              const status = await get('/battle/status');
              if (status.status === 'matched' && status.battleId) {
                // Try to get battle by ID
                const b = await get(`/battle/${status.battleId}`);
                if (b.battle?.status === 'completed') {
                  await showBattleResult(b.battle);
                }
              }
            } catch (e2) {
              // ignore
            }
          }
        }
      }, 2000); // Poll every 2 seconds while active
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [battle?.battle?.status, preBattleRating, user?.id]);

  // Auto-dismiss result popup after 5 seconds
  useEffect(() => {
    if (showResultPopup) {
      const timer = setTimeout(() => {
        setShowResultPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showResultPopup]);

  const withBusy = async (fn) => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = () =>
    withBusy(async () => {
      const res = await post("/battle/join-queue", {});
      const startTime = Date.now();
      setQueue({
        status: "queued",
        rating: res.rating,
        searchDifficulty: res.searchDifficulty,
        queuedAt: new Date().toISOString(),
      });
      setQueueStartTime(startTime);
      if (user?.rating != null) {
        setPreBattleRating(user.rating);
      }
      setLastResult(null);
    });

  const handleLeave = () =>
    withBusy(async () => {
      await post("/battle/leave-queue", {});
      setQueue({ status: "none" });
      setBattle(null);
      setQueueStartTime(null);
      setPreBattleRating(null);
      setLastResult(null);
    });


  const handleSubmit = async () => {
    if (!battle?.battle || !battle.battle.id || !battle.battle.exerciseId) {
      setError("No active battle to submit for.");
      return;
    }
    if (!code.trim()) {
      setError("Code is empty.");
      return;
    }
    setSubmitting(true);
    setError("");
    setInfo("");
    try {
      const res = await post("/battle/submit", {
        battleId: battle.battle.id,
        exerciseId: battle.battle.exerciseId,
        code,
      });
      setInfo("Submission received. Waiting for results...");

      // Poll battle until it completes
      let attempts = 0;
      const maxAttempts = 40;
      let finalBattle = null;
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts += 1;
        const b = await get("/battle/active");
        setBattle(b);
        finalBattle = b;
        if (b.battle?.status === "completed") {
          setInfo("Battle completed.");
          break;
        }
      }

      if (!finalBattle?.battle || !user) {
        await loadUser();
        return;
      }

      // Show result popup using helper function
      await showBattleResult(finalBattle.battle);
    } catch (e) {
      console.error("submit", e);
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (!battle?.battle?.id) return;
    try {
      await post(`/battle/${battle.battle.id}/accept`, {});
      // refresh status/battle
      const b = await get('/battle/active');
      setBattle(b);
      if (b.battle?.status !== 'pending') setAcceptCountdown(null);
    } catch (e) {
      console.error('accept', e);
      setError(e.message || String(e));
    }
  };

  const renderBattleSummary = () => {
    if (!battle?.battle) return <p>No active battle.</p>;
    const b = battle.battle;
    const opp = battle.opponent;
    const exercise = battle.exercise;

    return (
      <>
        {b.status === 'pending' && (
          <div className="accept-box">
            <p>Match found — accept to start the battle.</p>
            <p>Time left: <strong>{acceptCountdown !== null && acceptCountdown !== undefined ? acceptCountdown : 0}s</strong></p>
            <button className="btn primary" onClick={handleAccept} disabled={acceptCountdown === null || acceptCountdown === undefined || acceptCountdown <= 0}>Accept</button>
          </div>
        )}
        {b.status === 'active' && opp && (
          <p>
            <strong>Opponent:</strong> {opp.username}
          </p>
        )}
        {b.status === 'active' && exercise && (
          <p>
            <strong>Exercise:</strong> {exercise.difficulty}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="match-demo-page">
      <Header />
      <main className="match-demo-main">
        <section className="match-demo-left">
          <h2>Ranked Battle Demo</h2>
          <p className="match-demo-subtitle">
            Queue two accounts, get matched, solve the problem, and then see rating changes.
          </p>

          <div className="match-demo-card">
            <h3>Your Rating</h3>
            {user ? (
              <>
                <p>
                  <strong>{user.username}</strong>
                </p>
                <p>
                  Rating: <strong>{user.rating}</strong>
                </p>
                <p>
                  Streaks: {user.win_streak}W / {user.loss_streak}L
                </p>
                {lastResult && (
                  <p>
                    Result:&nbsp;
                    <strong>
                      {lastResult.outcome === "win"
                        ? "You won"
                        : lastResult.outcome === "loss"
                        ? "You lost"
                        : "Draw"}
                    </strong>
                    {typeof lastResult.delta === "number" && (
                      <span>
                        {" "}
                        ({lastResult.delta >= 0 ? "+" : ""}
                        {lastResult.delta} Elo)
                      </span>
                    )}
                  </p>
                )}
              </>
            ) : (
              <p>Loading user...</p>
            )}
          </div>

          <div className="match-demo-card">
            <h3>Matchmaking</h3>
            <div className="match-demo-buttons">
              <button className="btn primary" onClick={handleJoin} disabled={busy}>
                Join Queue
              </button>
              <button className="btn secondary" onClick={handleLeave} disabled={busy}>
                Leave Queue
              </button>
            </div>
            {queue?.status === 'queued' && (
              <p className="match-demo-queue-status">
                Searching for opponent... {queueTimer > 0 && (
                  <span className="match-demo-queue-timer">
                    ({Math.floor(queueTimer / 60)}:{(queueTimer % 60).toString().padStart(2, '0')})
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="match-demo-card">
            <h3>Battle</h3>
            {renderBattleSummary()}
          </div>

          {info && <p className="match-demo-info">{info}</p>}
          {error && <p className="match-demo-error">{error}</p>}
        </section>

        {/* Result Popup Modal */}
        {showResultPopup && resultPopupData && (
          <div className="result-popup-overlay" onClick={() => setShowResultPopup(false)}>
            <div className={`result-popup ${resultPopupData.outcome}`} onClick={(e) => e.stopPropagation()}>
              <button 
                className="result-popup-close" 
                onClick={() => setShowResultPopup(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="result-popup-content">
                <div className="result-popup-icon">
                  {resultPopupData.outcome === "win" && "🏆"}
                  {resultPopupData.outcome === "loss" && "💔"}
                  {resultPopupData.outcome === "draw" && "🤝"}
                </div>
                <h2 className="result-popup-title">
                  {resultPopupData.outcome === "win" && "VICTORY!"}
                  {resultPopupData.outcome === "loss" && "DEFEATED"}
                  {resultPopupData.outcome === "draw" && "DRAW"}
                </h2>
                {typeof resultPopupData.delta === "number" && (
                  <p className="result-popup-delta">
                    {resultPopupData.delta >= 0 ? "+" : ""}
                    {resultPopupData.delta} Elo
                  </p>
                )}
                <button 
                  className="btn primary result-popup-button" 
                  onClick={() => setShowResultPopup(false)}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="match-demo-right">
          <h3>Code Editor</h3>
          {battle?.exercise ? (
            <>
              <div className="match-demo-problem">
                <h4>{battle.exercise.id}</h4>
                <p className="match-demo-problem-meta">
                  Difficulty: {battle.exercise.difficulty} • Time limit:{" "}
                  {battle.exercise.timeLimit}s • Memory:{" "}
                  {battle.exercise.memoryLimit}
                </p>
                <div className="match-demo-problem-body">
                  <pre>{battle.exercise.content?.slice(0, 600) || "Problem markdown here..."}</pre>
                </div>
              </div>
              <textarea
                className="match-demo-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
              <div className="match-demo-editor-actions">
                <button
                  className="btn primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Solution"}
                </button>
              </div>
            </>
          ) : (
            <p className="match-demo-placeholder">
              Once you are matched, the exercise and code editor will appear here.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}


