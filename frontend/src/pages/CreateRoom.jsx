import React, { useState } from "react";
import Header from "../components/Header";
import CustomRoomPanel from "../components/CustomRoomPanel";
import "./CreateRoom.css";

export default function CreateRoom() {
  const [mode, setMode] = useState("practice"); // "practice" or "custom"

  return (
    <div className="create-room-page">
      <Header />

      <div className="create-room-container">
        <div className="mode-switch-container">
          <div className="mode-switch">
            <button
              className={`mode-button ${mode === "practice" ? "active" : ""}`}
              onClick={() => setMode("practice")}
            >
              Practice
            </button>
            <button
              className={`mode-button ${mode === "custom" ? "active" : ""}`}
              onClick={() => setMode("custom")}
            >
              Custom
            </button>
          </div>
        </div>

        <div className="content-container">
          {mode === "practice" ? (
            <div className="practice-mode">
              <h2>Practice Mode</h2>
              <p>Select difficulty to start practicing</p>
              <div className="difficulty-buttons">
                <button className="difficulty-btn">Easy</button>
                <button className="difficulty-btn">Medium</button>
                <button className="difficulty-btn">Hard</button>
              </div>
            </div>
          ) : (
            <CustomRoomPanel />
          )}
        </div>
      </div>
    </div>
  );
}
