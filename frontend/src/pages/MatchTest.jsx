import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { get, post } from "../services/httpClient";
import "./MatchTest.css";

export default function MatchTest() {
  const [queueStatus, setQueueStatus] = useState(null);
  const [activeBattle, setActiveBattle] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const call = async (fn, label) => {
    setError("");
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      console.error(label, e);
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    const data = await get("/battle/status");
    setQueueStatus(data);
    if (data.status === "matched") {
      const battle = await get("/battle/active");
      setActiveBattle(battle);
    }
  };

  const handleJoin = () =>
    call(async () => {
      const res = await post("/battle/join-queue", {});
      setQueueStatus({
        status: "queued",
        rating: res.rating,
        searchDifficulty: res.searchDifficulty,
        queuedAt: new Date().toISOString(),
      });
    }, "join-queue");

  const handleLeave = () =>
    call(async () => {
      await post("/battle/leave-queue", {});
      setQueueStatus({ status: "none" });
      setActiveBattle(null);
    }, "leave-queue");

  const handleCheckStatus = () => call(refreshStatus, "status");

  const handleRefreshBattle = () =>
    call(async () => {
      const battle = await get("/battle/active");
      setActiveBattle(battle);
    }, "active");

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(() => {
      refreshStatus().catch(() => {});
    }, 3000);
    return () => clearInterval(id);
  }, [polling]);

  return (
    <div className="match-test-page">
      <Header />
      <main className="match-test-main">
        <section className="match-test-controls">
          <h2>Matchmaking Test</h2>
          <p className="match-test-subtitle">
            Use two logged-in browsers/accounts to test the battle matching backend.
          </p>
          <div className="match-test-buttons">
            <button
              className="btn primary"
              onClick={handleJoin}
              disabled={loading}
            >
              Join Queue
            </button>
            <button
              className="btn secondary"
              onClick={handleLeave}
              disabled={loading}
            >
              Leave Queue
            </button>
            <button
              className="btn ghost"
              onClick={handleCheckStatus}
              disabled={loading}
            >
              Check Status
            </button>
            <button
              className="btn ghost"
              onClick={handleRefreshBattle}
              disabled={loading}
            >
              Refresh Active Battle
            </button>
          </div>
          <label className="match-test-poll-toggle">
            <input
              type="checkbox"
              checked={polling}
              onChange={(e) => setPolling(e.target.checked)}
            />
            Auto-poll status every 3s
          </label>
          {loading && <p className="match-test-info">Working...</p>}
          {error && <p className="match-test-error">{error}</p>}
        </section>

        <section className="match-test-panels">
          <div className="match-test-panel">
            <h3>Queue Status</h3>
            <pre className="match-test-json">
              {JSON.stringify(queueStatus, null, 2)}
            </pre>
          </div>
          <div className="match-test-panel">
            <h3>Active Battle</h3>
            <pre className="match-test-json">
              {JSON.stringify(activeBattle, null, 2)}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}


