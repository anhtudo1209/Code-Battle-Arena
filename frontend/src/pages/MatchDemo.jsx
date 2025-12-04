import React, { useEffect, useState } from "react";
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
    }
  };

  useEffect(() => {
    loadUser();
    loadStatus().catch(() => {});
  }, []);

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
      setQueue({
        status: "queued",
        rating: res.rating,
        searchDifficulty: res.searchDifficulty,
        queuedAt: new Date().toISOString(),
      });
      setInfo("Joined queue. Wait for opponent or open another browser to join.");
    });

  const handleLeave = () =>
    withBusy(async () => {
      await post("/battle/leave-queue", {});
      setQueue({ status: "none" });
      setBattle(null);
      setInfo("Left queue.");
    });

  const handleRefresh = () => withBusy(loadStatus);

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
      setInfo(`Submission queued (id ${res.submissionId}). Polling battle...`);

      // Poll battle until it completes
      let attempts = 0;
      const maxAttempts = 40;
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        attempts += 1;
        const b = await get("/battle/active");
        setBattle(b);
        if (b.battle?.status === "completed") {
          setInfo("Battle completed.");
          break;
        }
      }

      // Reload user to see rating change
      await loadUser();
    } catch (e) {
      console.error("submit", e);
      setError(e.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const renderBattleSummary = () => {
    if (!battle?.battle) return <p>No active battle.</p>;
    const b = battle.battle;
    const opp = battle.opponent;
    const exercise = battle.exercise;
    const submissions = battle.submissions || [];

    return (
      <>
        <p>
          <strong>Battle ID:</strong> {b.id} ({b.status})
        </p>
        <p>
          <strong>Opponent:</strong> {opp?.username} (id {opp?.id})
        </p>
        <p>
          <strong>Exercise:</strong> {exercise?.id} ({exercise?.difficulty})
        </p>
        <p>
          <strong>Started at:</strong> {b.startedAt}
        </p>
        <p>
          <strong>Submissions:</strong>{" "}
          {submissions.length ? JSON.stringify(submissions.map((s) => ({ id: s.id, user: s.user_id, status: s.status }))) : "none"}
        </p>
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
              <button className="btn ghost" onClick={handleRefresh} disabled={busy}>
                Refresh Status
              </button>
            </div>
            <pre className="match-demo-json">
              {JSON.stringify(queue, null, 2)}
            </pre>
          </div>

          <div className="match-demo-card">
            <h3>Battle</h3>
            {renderBattleSummary()}
          </div>

          {info && <p className="match-demo-info">{info}</p>}
          {error && <p className="match-demo-error">{error}</p>}
        </section>

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


